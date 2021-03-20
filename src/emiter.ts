import GlitchedWriter from '.'
import { Callback } from './types'

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
		const { htmlElement, writerData, string } = this.writer

		if (htmlElement) {
			if (this.writer.options.html) htmlElement.innerHTML = string
			else htmlElement.textContent = string
			htmlElement.setAttribute('data-string', string)
		}

		if (eventType === 'finish') {
			// ON FINISH
			this.writer.state.finish()
			this.onFinishCallback?.(string, writerData)
			this.emitEvent('gw_finished')
		} else {
			// ON STEP
			this.onStepCallback?.(string, writerData)
			this.emitEvent('gw_step')
		}
	}

	private emitEvent(name: 'gw_finished' | 'gw_step') {
		const { string, htmlElement, writerData } = this.writer
		const payload = {
			detail: {
				string,
				writerData,
			},
		}
		htmlElement?.dispatchEvent(new CustomEvent(name, payload))
	}
}
