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
	string: string = ''

	/**
	 * Create new instance of Glitched Writer, that manages writing text to one HTML Element. Few writers can possess the same HTML Element, but don't write with them at the same time.
	 * Use .write(string) method to start writing.
	 * @param htmlElement HTML Element OR a Selector string (eg. '.text')
	 * @param options Options object (eg. { html: true, ... }) OR preset name (eg. 'zalgo').
	 * @param onStepCallback Callback, that will be triggered on every step. Params passed: string & writer data.
	 * @param onFinishCallback Callback, that will be triggered when each writing finishes. Params passed: string & writer data.
	 */
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
		this.string = this.previousString
	}

	updateString(): void {
		this.string = this.charTable.map(char => char.string).join('')
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

	/**
	 * All the data, about current state of the writer instance.
	 */
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

	/**
	 * Main function of Glitched Writer. It orders writer to start typing passed string. Can be called multiple times after each other, or even during writing.
	 * @param string text, that will get written.
	 * @returns Promise, with writer data result
	 */
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
		this.letterize()

		this.pause()
		return this.play({
			reverse: this.options.oneAtATime && writeOptions?.erase,
		})
	}

	/**
	 * Add text to end method. Orders writer to write same string as previous, but with this added at the end.
	 * @param string text that will get added
	 * @returns Promise, with writer data result
	 */
	async add(string: string) {
		const { previousString } = this

		return this.write(previousString + string)
	}

	/**
	 * Remove last n-letters method. Orders writer to write same string as previous, but without n-letters at the end.
	 * @param n number of letters to remove.
	 * @returns Promise, with writer data result
	 */
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

	/**
	 * Resume last writing order.
	 * @returns Promise, with writer data result
	 */
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

	/**
	 * Pause current writer task.
	 */
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
				this.setChar(gi, '', gl)
				return
			}

			const fi = gl.value !== '' ? previous.indexOf(gl.value, pi) : -1

			if (fi !== -1 && fi - pi <= maxDist) {
				const appendedText = previous.substring(pi, fi)
				this.setChar(gi, gl.value, gl, appendedText)
				pi = fi
				this.state.nGhosts += appendedText.length
			} else this.setChar(gi, pl || this.options.space, gl)
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
				this.setChar(gi, '', gl)
				return
			}

			this.setChar(gi, pl, gl)
		})

		this.removeExtraChars(goalStringArray.length)
	}

	private letterize() {
		if (!this.options.letterize || !this.htmlElement) return

		const htmlArray: string[] = this.charTable.map(({ isTag: instant, gl }) =>
				instant ? gl : '<span class="gw-char"></span>' ?? '',
			),
			html: string = htmlArray.join('')
		this.htmlElement.innerHTML = html

		const spans = this.htmlElement.querySelectorAll(
			'span.gw-char',
		) as NodeListOf<HTMLSpanElement>

		let i = 0
		this.charTable.forEach(char => {
			if (char.isTag) return
			char.spanElement = spans[i]
			i++
		})
	}

	private removeExtraChars(from: number) {
		const { charTable } = this
		charTable.splice(from, charTable.length - from)
	}

	private setChar(
		ci: number,
		pl: string,
		gl: LetterItem,
		appendedText?: string,
	) {
		const { charTable } = this,
			char: Char | undefined = charTable[ci]

		char
			? char.reset(
					pl,
					gl.value || this.options.space,
					appendedText,
					gl.type === 'tag',
			  )
			: charTable.push(
					new Char(
						this,
						pl,
						gl.value || this.options.space,
						appendedText,
						gl.type === 'tag',
					),
			  )
	}

	private get goalStringArray(): LetterItem[] {
		const { goalString: goal, previousString, options } = this,
			goalArray = options.html
				? htmlToArray(goal)
				: stringToLetterItems(goal),
			prevGtGoal = Math.max(previousString.length - goalArray.length, 0)

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
