import GlitchedWriter from '..'
import { Callback } from '../types'
import { wait } from '../utils'

export default class Queue {
	writer: GlitchedWriter

	isStopped: boolean = false
	texts: string[]
	isLooping: boolean = false
	loopInterval: number = 0
	interval: number
	index: number = -1

	endCallback?: Callback

	constructor(
		writer: GlitchedWriter,
		texts: string[] | HTMLElement | Element | string,
		interval: number = 800,
		loop: boolean | Callback | number = false,
	) {
		this.writer = writer
		this.interval = interval

		// Setup texts
		if (Array.isArray(texts)) this.texts = texts
		else {
			// If passed html element
			// get child paragraphs as sequent texts to write
			let el: Element | null
			if (typeof texts === 'object') el = texts
			else el = document.querySelector(texts)

			this.texts = []

			el?.childNodes.forEach(node => {
				const { tagName, innerHTML } = node as HTMLElement
				tagName === 'P' &&
					innerHTML !== undefined &&
					this.texts.push(innerHTML)
			})
		}

		// Setup looping settings
		if (typeof loop === 'boolean') this.isLooping = loop
		else if (typeof loop === 'function') this.endCallback = loop
		else {
			this.isLooping = true
			this.loopInterval = loop
		}

		this.loop()
	}

	stop() {
		this.isStopped = true
	}

	resume() {
		this.index--
		this.isStopped = false
		this.writer.state.isPaused = false
		this.loop()
	}

	private async loop() {
		if (!this.texts.length) return
		this.index++

		if (this.index >= this.texts.length) {
			if (this.isLooping) {
				await wait(this.loopInterval)
				this.index = 0
			} else
				return this.endCallback?.(
					this.writer.string,
					this.writer.getWriterData(
						'SUCCESS',
						"The queue has reached it's end.",
					),
				)
		}

		if (this.isStopped || this.writer.state.isPaused) return

		const result = await this.writer.manageWriting(this.texts[this.index])
		if (!result || this.writer.state.isPaused) return

		await wait(this.interval)

		this.loop()
	}
}
