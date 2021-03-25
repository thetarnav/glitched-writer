import GlitchedWriter from '.'
import { Callback } from './types'
import { filterHtml } from './utils'

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
		const { htmlElement, writerData } = this.writer,
			string =
				eventType === 'finish' ? this.writer.goalString : this.writer.string

		if (htmlElement && !this.writer.options.letterize) {
			if (this.writer.options.html) htmlElement.innerHTML = string
			else htmlElement.textContent = string
		}
		htmlElement?.setAttribute(
			'data-gw-string',
			this.writer.options.html ? filterHtml(string) : string,
		)

		if (eventType === 'finish') {
			// ON FINISH
			this.writer.state.finish()
			this.onFinishCallback?.(string, writerData)
			this.emitEvent()
		} else {
			// ON STEP
			this.onStepCallback?.(string, writerData)
		}
	}

	private emitEvent() {
		const { htmlElement, writerData } = this.writer

		if (!htmlElement || typeof CustomEvent === 'undefined') return
		htmlElement?.dispatchEvent(
			new CustomEvent('gw-finished', { detail: writerData }),
		)
	}
}
