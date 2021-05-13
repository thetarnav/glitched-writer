// eslint-disable-next-line import/no-extraneous-dependencies
import Options from './modules/options'
import State from './modules/state'
import Char from './modules/char'
import Emiter from './modules/emiter'
import {
	ConstructorOptions,
	PlayOptions,
	WriterDataResponse,
	Callback,
	HTMLWriterElement,
} from './types'
import { wait, promiseWhile, LetterItem, filterHtml } from './utils'
import { presets, glyphs, PresetName } from './presets'
import setupCharTable from './functions/setupCharTable'
import letterize from './functions/letterize'

export default class GlitchedWriter {
	htmlElement?: HTMLWriterElement
	options!: Options
	state: State
	emiter: Emiter
	charTable: Char[] = []

	goalText: string = ''
	lastText: string = ''
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
		htmlElement?: HTMLElement | Element | null | string,
		options?: ConstructorOptions | PresetName | null,
		onStepCallback?: Callback,
		onFinishCallback?: Callback,
	) {
		if (typeof htmlElement === 'string') {
			this.htmlElement = document.querySelector(htmlElement) ?? undefined
		} else this.htmlElement = htmlElement ?? undefined

		if (this.htmlElement) this.htmlElement.$writer = this

		if (typeof options === 'string') this.preset = options
		else this.setOptions(options ?? {})

		this.state = new State(this)
		this.emiter = new Emiter(this, onStepCallback, onFinishCallback)
		this.string = this.previousString
	}

	/**
	 * Function for updating multiple options at once. Unlike options setter, it doesn't reset not-passed fields to default state.
	 * @param options Options object, with fields you want to change.
	 */
	extendOptions(options: ConstructorOptions) {
		this.setOptions({
			...this.options,
			...options,
		})
	}

	setOptions(options: ConstructorOptions) {
		this.options = new Options(this, options)
	}

	set preset(preset: PresetName) {
		this.options = new Options(this, presets[preset])
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
	async write(string: string) {
		return this.manageWriting(string)
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

		// return this.write(array.join(''), { erase: true })
		return this.write(array.join(''))
	}

	// private logCharTable() {
	// 	console.table(
	// 		this.charTable.map(
	// 			({ ghostsBefore, ghostsAfter, l, gl, isTag, isWhitespace }) => [
	// 				ghostsBefore.join(''),
	// 				ghostsAfter.join(''),
	// 				l,
	// 				gl,
	// 				(isTag && 'TAG') || (isWhitespace && 'Whitespace'),
	// 			],
	// 		),
	// 	)
	// }

	/**
	 * Resume last writing order.
	 * @returns Promise, with writer data result
	 */
	async play(): Promise<WriterDataResponse> {
		return this.manageWriting(null)
	}

	/**
	 * Pause current writer task.
	 */
	pause() {
		this.state.pause()
	}

	private async manageWriting(
		text: string | null,
	): Promise<WriterDataResponse> {
		if (text) this.lastText = text

		// Erasing first
		if (
			this.options.startFrom === 'erase' &&
			(this.state.finished || this.state.erasing)
		) {
			this.state.erasing = true
			const eraseTo = this.genGoalStringToErase(this.lastText)
			this.preparePropertiesBeforeWrite(eraseTo)
			setupCharTable.call(this)
			letterize.call(this)

			await this.playChT({
				reverse: this.options.oneAtATime !== 0,
			})

			// If erasing did not finish for some reason
			// Like it was paused
			if (!this.state.finished)
				return this.getWriterData('ERROR', 'Erasing did not finish.')

			this.state.erasing = false
		}

		this.preparePropertiesBeforeWrite(this.lastText)
		setupCharTable.call(this)
		// this.logCharTable()
		letterize.call(this)

		this.pause()
		return this.playChT()
	}

	private preparePropertiesBeforeWrite(text: string) {
		/* PREPARE PROPERTIES */
		this.goalText = text
		this.state.nGhosts = 0
		this.options.setCharset()
	}

	private async playChT(
		playOptions?: PlayOptions,
	): Promise<WriterDataResponse> {
		const playList: Promise<boolean>[] = [],
			{ charTable } = this

		if (this.state.isTyping)
			return this.getWriterData('ERROR', `The writer is already typing.`)

		this.state.play()

		/**
		 * ONE AT A TIME
		 */
		if (this.options.oneAtATime > 0) {
			const reverse = playOptions?.reverse ?? false,
				charTableCopy = reverse ? [...charTable] : [...charTable].reverse()

			// Char executor - runs a loop, typing one char at a time
			// It is possible to run multiple of them at the same time
			const executor = async () => {
				let lastResult: boolean = true,
					ended = false

				const loop = async () => {
					const lastChar = charTableCopy.pop()
					if (!lastChar) ended = true
					else lastResult = (await lastChar.type()) ?? false
				}

				await promiseWhile(
					() => !ended && lastResult && !this.state.isPaused,
					loop,
				)

				return ended && lastResult && !this.state.isPaused
			}

			// Add as many executors as needed to the playList
			for (let n = 0; n < this.options.oneAtATime; n++) {
				playList.push(executor())
			}
		}

		/**
		 * NORMAL
		 */
		// Add every char .type() at once.
		else charTable.forEach(char => playList.push(char.type()))

		/**
		 * Return result
		 */
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

	private returnResult(finished: boolean): WriterDataResponse {
		finished ? this.emiter.call('finish') : this.emiter.call('step')
		return finished
			? this.getWriterData('SUCCESS', `The writer finished typing.`)
			: this.getWriterData('ERROR', `Writer failed to finish typing.`)
	}

	removeExtraChars(from: number) {
		const { charTable } = this
		charTable.splice(from, charTable.length - from)
	}

	setChar(ci: number, pl: string, gl: LetterItem, appendedText?: string) {
		const { charTable } = this,
			char: Char | undefined = charTable[ci]

		char
			? char.reset(
					pl ?? '',
					gl.value || this.options.space,
					appendedText,
					gl.type === 'tag',
			  )
			: charTable.push(
					new Char(
						this,
						pl ?? '',
						gl.value || this.options.space,
						appendedText,
						gl.type === 'tag',
					),
			  )
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

/**
 * One time use, standalone write function. Used to order a temporary Glitched Writer instance to animate content of html element to chosen text.
 * @param string text, that will get written.
 * @param htmlElement HTML Element OR a Selector string (eg. '.text')
 * @param options Options object (eg. { html: true, ... }) OR preset name (eg. 'zalgo').
 * @param onStepCallback Callback, that will be triggered on every step. Params passed: string & writer data.
 * @param onFinishCallback Callback, that will be triggered when each writing finishes. Params passed: string & writer data.
 * @returns Promise, with writer data result
 */
export async function glitchWrite(
	string: string,
	htmlElement?: HTMLElement | Element | null | string,
	options?: ConstructorOptions | PresetName | null,
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

/**
 * A way to create new Writer without having to rely on defult export.
 * @param htmlElement HTML Element OR a Selector string (eg. '.text')
 * @param options Options object (eg. { html: true, ... }) OR preset name (eg. 'zalgo').
 * @param onStepCallback Callback, that will be triggered on every step. Params passed: string & writer data.
 * @param onFinishCallback Callback, that will be triggered when each writing finishes. Params passed: string & writer data.
 * @returns GlitchedWriter Class Instance
 */
export const create = (
	htmlElement?: HTMLElement | Element | null | string,
	options?: ConstructorOptions | PresetName | null,
	onStepCallback?: Callback,
	onFinishCallback?: Callback,
) => new GlitchedWriter(htmlElement, options, onStepCallback, onFinishCallback)

export {
	presets,
	glyphs,
	wait,
	ConstructorOptions,
	WriterDataResponse,
	Callback,
}
