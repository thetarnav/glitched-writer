// eslint-disable-next-line import/no-extraneous-dependencies
import Options from './modules/options'
import State from './modules/state'
import Char from './modules/char'
import Emiter from './modules/emiter'
import {
	CustomOptions,
	PlayOptions,
	WriterDataResponse,
	Callback,
	HTMLWriterElement,
} from './types'
import { wait, LetterItem, filterHtml } from './utils'
import { presets, glyphs, PresetName } from './presets'
import setupCharTable from './functions/setupCharTable'
import letterize from './functions/letterize'
import prepWordsPlaylist from './functions/playlist/words'
import prepLettersPlaylist from './functions/playlist/letters'
import Animator from './modules/animator'

export default class GlitchedWriter {
	htmlElement: HTMLWriterElement
	options!: Options
	state: State
	emiter: Emiter
	animator: Animator
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
		options?: CustomOptions | PresetName | null,
		onStepCallback?: Callback,
		onFinishCallback?: Callback,
	) {
		if (!htmlElement) this.htmlElement = document.createElement('span')
		else if (typeof htmlElement === 'string') {
			this.htmlElement =
				document.querySelector(htmlElement) ??
				document.createElement('span')
		} else this.htmlElement = htmlElement

		this.htmlElement.$writer = this

		this.options = new Options(this, options)
		this.state = new State(this)
		this.emiter = new Emiter(this, onStepCallback, onFinishCallback)
		this.animator = new Animator(this)
		this.string = this.previousString
	}

	updateString(): void {
		this.string = this.charTable.map(char => char.string).join('')
	}

	get previousString(): string {
		let prev = this.htmlElement.textContent
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
		if (text !== null) this.lastText = text

		// Erasing first
		if (
			this.options.mode === 'erase' &&
			(this.state.finished || this.state.erasing)
		) {
			this.state.erasing = true
			const eraseTo = this.genGoalStringToErase(this.lastText)
			this.preparePropertiesBeforeWrite(eraseTo)

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
		// this.logCharTable()

		this.pause()
		return this.playChT()
	}

	private preparePropertiesBeforeWrite(text: string) {
		/* PREPARE PROPERTIES */
		this.goalText = text
		this.state.nGhosts = 0
		this.options.setCharset()
		setupCharTable.call(this)
		this.state.progress.reset(this.charTable.length)
		letterize.call(this)
	}

	private async playChT(
		playOptions?: PlayOptions,
	): Promise<WriterDataResponse> {
		const playList: Promise<boolean>[] = [],
			{ charTable, state, options } = this

		if (state.isTyping)
			return this.getWriterData('ERROR', `The writer is already typing.`)

		state.play()

		// N LETTERS AT A TIME
		if (options.oneAtATime > 0)
			prepLettersPlaylist.call(this, playList, playOptions)
		// BY WORDS
		else if (options.oneAtATime === 'word')
			prepWordsPlaylist.call(this, playList)
		// NORMAL
		else charTable.forEach(char => playList.push(char.type()))

		/**
		 * Play Playlist
		 * and return the result
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
					gl.type,
			  )
			: charTable.push(
					new Char(
						this,
						pl ?? '',
						gl.value || this.options.space,
						appendedText,
						gl.type,
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
	options?: CustomOptions | PresetName | null,
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
	options?: CustomOptions | PresetName | null,
	onStepCallback?: Callback,
	onFinishCallback?: Callback,
) => new GlitchedWriter(htmlElement, options, onStepCallback, onFinishCallback)

export { presets, glyphs, wait, CustomOptions, WriterDataResponse, Callback }
