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
	CallbackType,
} from './types'
import { wait, filterHtml } from './utils'
import { presets, glyphs, PresetName } from './presets'
import setupCharTable from './functions/setupCharTable'
import letterize from './functions/letterize'
import prepWordsPlaylist from './functions/playlist/words'
import prepLettersPlaylist from './functions/playlist/letters'
import Animator from './modules/animator'
import Queue from './modules/queue'

export default class GlitchedWriter {
	htmlElement: HTMLWriterElement
	options!: Options
	state: State
	emiter: Emiter
	animator: Animator
	queue?: Queue
	charTable: Char[] = []

	goalText: string = ''
	lastText: string = ''
	string: string = ''

	/**
	 * Create new instance of Glitched Writer, that manages writing text to one HTML Element. Few writers can possess the same HTML Element, but don't write with them at the same time.
	 * Use .write(string) method to start writing.
	 * @param htmlElement HTML Element OR a Selector string (eg. '.text')
	 * @param options Options object (eg. { html: true, ... }) OR preset name (eg. 'zalgo').
	 * @param onFinishCallback Callback, that will be triggered when each writing finishes. Params passed: string & writer data.
	 */
	constructor(
		htmlElement?: HTMLElement | Element | null | string,
		options?: CustomOptions | PresetName | null,
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
		this.emiter = new Emiter(this)
		if (onFinishCallback) this.emiter.addCallback('finish', onFinishCallback)
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
	 * @param text text, that will get written.
	 * @returns Promise, with writer data result
	 */
	async write(text: string): Promise<WriterDataResponse>
	/**
	 * Order Glitched writer to write sequence of texts. In a loop or not.
	 * @param texts - Array of strings to write
	 * @param queueInterval - Time to wait between writing each texts [ms]
	 * @param loop - boolean | Callback | number - What to do when the queue has ended.
	 * - false -> stop;
	 * - true -> continue looping;
	 * - Callback -> stop and fire the callback.
	 * - number -> wait number ms and than continue
	 */
	async write(
		texts: string[],
		queueInterval?: number,
		loop?: boolean | Callback | number,
	): Promise<void>
	async write(
		texts: string | string[],
		queueInterval?: number,
		loop?: boolean | Callback | number,
	): Promise<void | WriterDataResponse> {
		if (this.queue) {
			this.queue.stop()
			delete this.queue
		}
		if (typeof texts === 'string') return this.manageWriting(texts)

		this.queueWrite(texts, queueInterval, loop)
	}

	/**
	 * Order Glitched writer to write sequence of texts.
	 * @param texts - Array of strings to write.
	 *
	 * You can also pass selector or a html element.
	 * Paragraph children content will make the array of texts
	 * @param queueInterval - Time to wait between writing each texts [ms]
	 * @param loop - boolean | Callback | number - What to do when the queue has ended.
	 * - false -> stop;
	 * - true -> continue looping;
	 * - Callback -> stop and fire the callback.
	 * - number -> wait number ms and than continue
	 */
	queueWrite(
		texts: string[] | HTMLElement | Element | string,
		queueInterval?: number,
		loop?: boolean | Callback | number,
	) {
		if (this.queue) {
			this.queue.stop()
			delete this.queue
		}
		this.queue = new Queue(this, texts, queueInterval, loop)
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

	/**
	 * Resume last writing order.
	 * @returns Promise, with writer data result
	 */
	async play(): Promise<WriterDataResponse> {
		if (!this.state.isPaused)
			return this.getWriterData('ERROR', "The writer isn't paused.")
		if (this.queue) {
			this.queue.resume()
			return this.getWriterData('SUCCESS', 'The queue was resumed')
		}
		return this.manageWriting(null)
	}

	/**
	 * Pause current writer task.
	 */
	pause() {
		this.state.pause()
	}

	/**
	 * Shorthand for changing endless option value
	 * @param bool goal state
	 */
	endless(bool: boolean): void {
		this.options.extend({ endless: bool })
	}

	/**
	 * Use this to add callback to one of the writer events
	 *
	 * save callback in a variable first if you want to remove it later.
	 * @param type "start" | "step" | "finish"
	 * @param callback your callback function: (string, writerData) => {}
	 */
	addCallback(type: CallbackType, callback: Callback) {
		this.emiter.addCallback(type, callback)
	}

	/**
	 * Use this to remove added callback
	 * @param type "start" | "step" | "finish"
	 * @param callback variable pointing to your function
	 */
	removeCallback(type: CallbackType, callback: Callback) {
		this.emiter.removeCallback(type, callback)
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

	async manageWriting(text: string | null): Promise<WriterDataResponse> {
		if (text !== null) this.lastText = text

		// Erasing first
		if (
			['erase_smart', 'erase'].includes(this.options.mode) &&
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

	getWriterData(
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

		if (this.options.mode === 'erase_smart') {
			// Do not erase matching with previous letters
			for (let i = 0; i < goal.length; i++) {
				const gl = goal[i],
					pl = previous[i] ?? ''

				if (gl === pl) result += pl
				else break
			}
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
	const writer = new GlitchedWriter(htmlElement, options, onFinishCallback)
	if (onStepCallback) writer.addCallback('step', onStepCallback)
	return writer.write(string)
}

/**
 * A way to create new Writer without having to rely on defult export.
 * @param htmlElement HTML Element OR a Selector string (eg. '.text')
 * @param options Options object (eg. { html: true, ... }) OR preset name (eg. 'zalgo').
 * @param onFinishCallback Callback, that will be triggered when each writing finishes. Params passed: string & writer data.
 * @returns GlitchedWriter Class Instance
 */
export const create = (
	htmlElement?: HTMLElement | Element | null | string,
	options?: CustomOptions | PresetName | null,
	onFinishCallback?: Callback,
) => new GlitchedWriter(htmlElement, options, onFinishCallback)

export { presets, glyphs, wait, CustomOptions, WriterDataResponse, Callback }
