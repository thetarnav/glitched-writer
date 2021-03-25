// eslint-disable-next-line import/no-extraneous-dependencies
import Options from './options'
import State from './state'
import Char from './char'
import Emiter from './emiter'
import {
	ConstructorOptions,
	WriteOptions,
	PlayOptions,
	WriterDataResponse,
	Callback,
} from './types'
import {
	wait,
	promiseWhile,
	isInRange,
	htmlToArray,
	LetterItem,
	filterHtml,
	arrayOfTheSame,
	stringToLetterItems,
} from './utils'
import { presets, glyphs, PresetName } from './presets'

export default class GlitchedWriter {
	htmlElement?: HTMLElement | Element | null
	options: Options
	state: State
	emiter: Emiter
	charTable: Char[] = []
	goalString: string = ''

	constructor(
		htmlElement?: HTMLElement | Element | string,
		options?: ConstructorOptions | PresetName | null,
		onStepCallback?: Callback,
		onFinishCallback?: Callback,
	) {
		if (typeof htmlElement === 'string') {
			if (typeof document !== 'undefined')
				this.htmlElement = document.querySelector(htmlElement)
		} else this.htmlElement = htmlElement
		this.options = new Options(this, options)
		this.state = new State(this)
		this.emiter = new Emiter(this, onStepCallback, onFinishCallback)
	}

	get string(): string {
		const string = this.charTable.map(char => char.string).join('')

		return string
	}

	get previousString(): string {
		let prev = this.htmlElement?.textContent
		if (typeof prev !== 'string')
			prev = this.options.html ? filterHtml(this.string) : this.string
		prev = prev.trim()
		return prev
	}

	// get previousStringFromTable(): string {
	// 	let prev = flattenDeep(
	// 		this.charTable.map(({ ghostsBefore, l, ghostsAfter }) => [
	// 			ghostsBefore,
	// 			l,
	// 			ghostsAfter,
	// 		]),
	// 	).join('')

	// 	console.log(prev)

	// 	if (this.options.html) prev = filterHtml(prev)

	// 	prev = prev.trim()
	// 	return prev
	// }

	get writerData(): WriterDataResponse {
		const writer: GlitchedWriter = this,
			{ options, state, string } = this

		return {
			string,
			writer,
			options,
			state,
		}
	}

	async write(string: string, writeOptions?: WriteOptions) {
		if (this.options.startFrom === 'erase' && !writeOptions?.erase)
			await this.write(this.genGoalStringToErase(string), { erase: true })

		this.goalString = string
		this.state.nGhosts = 0
		this.options.setCharset()
		// this.removeSpecialChars()

		if (this.options.startFrom === 'matching') this.createMatchingCharTable()
		else this.createPreviousCharTable()

		// this.logCharTable()
		if (this.options.letterize) {
			if (this.htmlElement) this.htmlElement.innerHTML = ''
			this.charTable.forEach(char => char.appendChild())
		}

		this.pause()
		return this.play({
			reverse: this.options.oneAtATime && writeOptions?.erase,
		})
	}

	async add(string: string) {
		const { previousString } = this

		return this.write(previousString + string)
	}

	async remove(n: number) {
		const { previousString } = this,
			array = Array.from(previousString)

		array.splice(-n)

		return this.write(array.join(''), { erase: true })
	}

	// private logCharTable() {
	// 	console.table(
	// 		this.charTable.map(({ ghostsBefore, ghostsAfter, l, gl, instant }) => [
	// 			ghostsBefore.join(''),
	// 			ghostsAfter.join(''),
	// 			l,
	// 			gl,
	// 			instant && 'HTML',
	// 		]),
	// 	)
	// }

	async play(playOptions?: PlayOptions): Promise<WriterDataResponse> {
		const playList: Promise<boolean>[] = [],
			{ charTable } = this,
			{ length } = charTable

		if (this.state.isTyping)
			return this.getWriterData(
				'ERROR',
				`The writer is already typing "${this.goalString}".`,
			)

		this.state.play()

		if (this.options.oneAtATime) {
			const reverse = playOptions?.reverse ?? false

			let i = reverse ? length - 1 : 0,
				lastResult: boolean = true

			const loop = async (): Promise<void> => {
				lastResult = await charTable[i].type()
				reverse ? i-- : i++
			}
			await promiseWhile(
				() => isInRange(0, i, length) && lastResult && !this.state.isPaused,
				loop,
			)

			return this.returnResult(lastResult)
		}
		charTable.forEach(char => playList.push(char.type()))

		try {
			const finished = (await Promise.all(playList)).every(result => result)
			return this.returnResult(finished)
		} catch (error) {
			return this.getWriterData(
				'ERROR',
				'Writer encountered an error.',
				error,
			)
		}
	}

	pause() {
		this.state.pause()
	}

	private returnResult(finished: boolean): WriterDataResponse {
		finished ? this.emiter.call('finish') : this.emiter.call('step')
		return finished
			? this.getWriterData('SUCCESS', `The writer finished typing.`)
			: this.getWriterData('ERROR', `Writer failed to finish typing.`)
	}

	private createMatchingCharTable(): void {
		const { goalStringArray, previousString: previous } = this,
			maxDist = Math.min(Math.ceil(this.options.genMaxGhosts / 2), 5)

		let pi = -1
		goalStringArray.forEach((gl, gi) => {
			pi++
			const pl: string | undefined = previous[pi]

			if (gl.type === 'tag') {
				pi--
				this.setChar(gi, '', gl.value, undefined, true)
				return
			}

			const fi = gl.value !== '' ? previous.indexOf(gl.value, pi) : -1

			if (fi !== -1 && fi - pi <= maxDist) {
				const appendedText = previous.substring(pi, fi)
				this.setChar(gi, gl.value, gl.value, appendedText)
				pi = fi
				this.state.nGhosts += appendedText.length
			} else
				this.setChar(
					gi,
					pl || this.options.space,
					gl.value || this.options.space,
				)
		})

		this.removeExtraChars(goalStringArray.length)
	}

	private createPreviousCharTable(): void {
		const { goalStringArray, previousString: previous } = this

		let pi = -1
		goalStringArray.forEach((gl, gi) => {
			pi++
			const pl = previous[pi] || this.options.space

			if (gl.type === 'tag') {
				pi--
				this.setChar(gi, '', gl.value, undefined, true)
				return
			}

			this.setChar(gi, pl, gl.value)
		})

		this.removeExtraChars(goalStringArray.length)
	}

	private removeExtraChars(from: number) {
		const { charTable } = this
		// for (let i = charTable.length - 1; i >= from; i--) {
		// 	charTable[i].destroy()
		// }
		charTable.splice(from, charTable.length - from)
	}

	// private removeSpecialChars() {
	// 	let i: number = findLastIndex(this.charTable, 'special')
	// 	while (i !== -1) {
	// 		this.charTable.splice(i, 1)
	// 		i = findLastIndex(this.charTable, 'special')
	// 	}
	// }

	private setChar(
		ci: number,
		pl: string,
		gl: string,
		appendedText?: string,
		special: boolean = false,
	) {
		const { charTable } = this,
			char: Char | undefined = charTable[ci]

		if (special) {
			charTable.splice(ci, 0, new Char(this, pl, gl, '', true))
			return
		}

		char
			? char.reset(pl, gl, appendedText, special)
			: charTable.push(new Char(this, pl, gl, appendedText, special))
	}

	private get goalStringArray(): LetterItem[] {
		const { goalString: goal, previousString: previous, options } = this,
			goalArray = options.html
				? htmlToArray(goal)
				: stringToLetterItems(goal),
			prevGtGoal = Math.max(previous.length - goalArray.length, 0)

		goalArray.push(...stringToLetterItems(arrayOfTheSame('', prevGtGoal)))

		return goalArray
	}

	private getWriterData(
		status?: WriterDataResponse['status'],
		message?: WriterDataResponse['message'],
		error?: WriterDataResponse['error'],
	): WriterDataResponse {
		const { writerData } = this
		return {
			...writerData,
			status,
			message,
			error,
		}
	}

	private genGoalStringToErase(goal: string): string {
		const { previousString: previous } = this
		let result = ''

		for (let i = 0; i < goal.length; i++) {
			const gl = goal[i],
				pl = previous[i] ?? ''

			if (gl === pl) result += pl
			else break
		}

		const diff = Math.max(goal.length - result.length, 0)
		if (diff > 0 && this.options.space === ' ')
			result = result.padEnd(diff + result.length, ' ')

		return result
	}
}

export async function glitchWrite(
	string: string,
	htmlElement?: HTMLElement | Element,
	options?: ConstructorOptions | PresetName,
	onStepCallback?: Callback,
	onFinishCallback?: Callback,
): Promise<WriterDataResponse> {
	const writer = new GlitchedWriter(
		htmlElement,
		options,
		onStepCallback,
		onFinishCallback,
	)
	return writer.write(string)
}

export {
	presets,
	glyphs,
	wait,
	ConstructorOptions,
	WriterDataResponse,
	Callback,
}
