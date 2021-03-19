import GlitchedWriter from '.'
import { Callback } from './types'
import { reverseString } from './utils'

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

	call(finished: boolean) {
		const { htmlElement } = this.writer
		let { string } = this.writer

		if (this.writer.options.reverseOutput) string = reverseString(string)

		if (htmlElement) htmlElement.textContent = string
		if (htmlElement) htmlElement.setAttribute('data-string', string)
	}

	callOnStep() {
		this.callAnytime()
		if (this.onStepCallback)
			this.onStepCallback(string, this.writer.writerData)
	}

	callOnFinish() {
		const { htmlElement } = this.writer
		let { string } = this.writer

		if (this.writer.options.reverseOutput) string = reverseString(string)

		if (htmlElement) htmlElement.textContent = string
		if (htmlElement) htmlElement.setAttribute('data-string', string)
		if (this.onStepCallback)
			this.onStepCallback(string, this.writer.writerData)
	}
}
