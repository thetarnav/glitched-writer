// eslint-disable-next-line import/no-extraneous-dependencies
import { findLastIndex, flattenDeep } from 'lodash'
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
	TagOrString,
	isSpecialChar,
	filterHtml,
	arrayOfTheSame,
} from './utils'
import { presets, glyphs, PresetName } from './presets'

export default class GlitchedWriter {
	htmlElement?: HTMLElement | Element
	options: Options
	state: State
	emiter: Emiter
	charTable: Char[] = []
	goalString: string = ''

	constructor(
		htmlElement?: HTMLElement | Element,
		options?: ConstructorOptions | PresetName,
		onStepCallback?: Callback,
		onFinishCallback?: Callback,
	) {
		this.htmlElement = htmlElement
		this.options = new Options(this, options)
		this.state = new State(this)
		this.emiter = new Emiter(this, onStepCallback, onFinishCallback)
	}

	get string(): string {
		const string = this.charTable.map(char => char.string).join('')

		return string
	}

	get previousString(): string {
		let prev = this.htmlElement?.textContent ?? this.string
		if (this.options.html) {
			prev = this.htmlElement?.innerHTML ?? prev
			prev = filterHtml(prev)
		}
		prev = prev.trim()
		return prev
	}

	get previousStringFromTable(): string {
		let prev = flattenDeep(
			this.charTable.map(({ ghostsBefore, l, ghostsAfter }) => [
				ghostsBefore,
				l,
				ghostsAfter,
			]),
		).join('')
		if (this.options.html) {
			prev = this.htmlElement?.innerHTML ?? prev
			prev = filterHtml(prev)
		}
		prev = prev.trim()
		return prev
	}

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
		this.dropSpecialChars()

		if (this.options.startFrom === 'matching') this.createMatchingCharTable()
		else this.createPreviousCharTable()

		// this.logCharTable()

		this.pause()
		return this.play({
			reverse: this.options.oneAtATime && writeOptions?.erase,
		})
	}

	// private logCharTable() {
	// 	console.table(
	// 		this.charTable.map(({ ghostsBefore, ghostsAfter, l, gl, special }) => [
	// 			ghostsBefore.join(''),
	// 			ghostsAfter.join(''),
	// 			l,
	// 			gl,
	// 			special && 'HTML',
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

			if (typeof gl === 'object' || isSpecialChar(gl)) {
				pi--
				this.setChar(
					gi,
					'',
					typeof gl === 'object' ? gl.tag : gl,
					undefined,
					true,
				)
				return
			}

			const fi = gl !== '' ? previous.indexOf(gl, pi) : -1

			if (fi !== -1 && fi - pi <= maxDist) {
				const appendedText = previous.substring(pi, fi)
				this.setChar(gi, gl, gl, appendedText)
				pi = fi
				this.state.nGhosts += appendedText.length
			} else
				this.setChar(gi, pl || this.options.space, gl || this.options.space)
		})

		this.dropOldChars(goalStringArray.length)
	}

	private createPreviousCharTable(): void {
		const { goalStringArray, previousString: previous } = this

		let pi = -1
		goalStringArray.forEach((gl, gi) => {
			pi++
			const pl = previous[pi] || this.options.space

			if (typeof gl === 'object' || isSpecialChar(gl)) {
				pi--
				this.setChar(
					gi,
					'',
					typeof gl === 'object' ? gl.tag : gl,
					undefined,
					true,
				)
				return
			}

			this.setChar(gi, pl, gl)
		})

		this.dropOldChars(goalStringArray.length)
	}

	// private dropEmptyChars() {
	// 	const { length } = this.charTable,
	// 		n = this.charTable.filter(({ l, gl }) => !l && !gl).length

	// 	n && this.charTable.splice(length - n, n)
	// }

	private dropOldChars(from: number) {
		const { charTable } = this
		charTable.splice(from, charTable.length - from)
	}

	private dropSpecialChars() {
		let i: number = findLastIndex(this.charTable, 'special')
		while (i !== -1) {
			this.charTable.splice(i, 1)
			i = findLastIndex(this.charTable, 'special')
		}
	}

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
			charTable.splice(ci, 0, new Char('', gl, this, '', true))
			return
		}

		char
			? char.reset(pl, gl, appendedText, special)
			: charTable.push(new Char(pl, gl, this, appendedText, special))
	}

	private get goalStringArray(): TagOrString[] {
		const { goalString: goal, previousString: previous, options } = this,
			goalArray = options.html ? htmlToArray(goal) : Array.from(goal),
			prevGtGoal = Math.max(previous.length - goalArray.length, 0)

		goalArray.push(...arrayOfTheSame('', prevGtGoal))

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
		if (diff > 0 && this.options.space !== '')
			result = result.padEnd(diff, ' ')

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

// const writer = new GlitchedWriter(undefined, { html: true }, string =>
// 	console.log(string),
// )

// // eslint-disable-next-line func-names
// ;(async function () {
// 	await wait(1200)
// 	await writer.write('<h3>This is only the beginning.</h3>')
// 	await wait(1200)
// 	await writer.write('Please, <b>say something</b>...')
// 	await wait(1500)
// 	await writer.write('my <i>old</i> friend.')
// 	// inputEl.removeAttribute('disabled')
// })()
