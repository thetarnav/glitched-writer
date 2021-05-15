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
		const { writer } = this
		writer.updateString()
		const { writerData, string } = writer

		// for letterize: update data attribute every step
		if (writer.options.letterize)
			writer.htmlElement.setAttribute(
				'data-gw-string',
				writer.options.html ? filterHtml(string) : string,
			)

		// ON STEP
		if (eventType === 'step') return this.onStepCallback?.(string, writerData)

		// ON FINISH
		writer.state.finish()

		// change state to finished but do not fire callbacks
		if (writer.state.erasing) return
		this.onFinishCallback?.(string, writerData)
		this.emitEvent()
	}

	private emitEvent() {
		const { htmlElement, writerData } = this.writer

		if (typeof CustomEvent === 'undefined') return
		htmlElement.dispatchEvent(
			new CustomEvent('gw-finished', { detail: writerData }),
		)
	}
}
