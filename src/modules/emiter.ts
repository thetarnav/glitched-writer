import GlitchedWriter from '../index'
import { Callback } from '../types'
import { filterHtml } from '../utils'

export default class {
	writer: GlitchedWriter
	onStepCallback?: Callback
	onFinishCallback?: Callback

	constructor(
		writer: GlitchedWriter,
		onStepCallback?: Callback,
		onFinishCallback?: Callback,
	) {
		this.onStepCallback = onStepCallback
		this.onFinishCallback = onFinishCallback
		this.writer = writer
	}

	call(eventType: 'step' | 'finish') {
		this.writer.updateString()
		const { htmlElement, writerData, string } = this.writer

		if (htmlElement && !this.writer.options.letterize) {
			if (this.writer.options.html) htmlElement.innerHTML = string
			else htmlElement.textContent = string
		}
		htmlElement?.setAttribute(
			'data-gw-string',
			this.writer.options.html ? filterHtml(string) : string,
		)

		// ON STEP
		if (eventType === 'step') return this.onStepCallback?.(string, writerData)

		// ON FINISH
		this.writer.state.finish()

		// change state to finished but do not fire callbacks
		if (this.writer.state.erasing) return
		this.onFinishCallback?.(string, writerData)
		this.emitEvent()
	}

	private emitEvent() {
		const { htmlElement, writerData } = this.writer

		if (!htmlElement || typeof CustomEvent === 'undefined') return
		htmlElement?.dispatchEvent(
			new CustomEvent('gw-finished', { detail: writerData }),
		)
	}
}
