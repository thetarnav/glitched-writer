import GlitchedWriter from '../index'
import { Callback, CallbackType } from '../types'
import { filterHtml } from '../utils'

export default class Emiter {
	writer: GlitchedWriter

	callbacks = {
		start: [] as Callback[],
		step: [] as Callback[],
		finish: [] as Callback[],
	}

	constructor(writer: GlitchedWriter) {
		this.writer = writer
	}

	addCallback(type: CallbackType, callback: Callback) {
		this.callbacks[type].push(callback)
	}

	removeCallback(type: CallbackType, callback: Callback): boolean {
		const array = this.callbacks[type],
			i = array.indexOf(callback)
		if (i === -1) return false
		array.splice(i, 1)
		return true
	}

	callback(type: CallbackType, ...args: Parameters<Callback>) {
		this.callbacks[type].forEach(cb => cb(...args))
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
		if (eventType === 'step') return this.callback('step', string, writerData)

		// ON FINISH
		writer.state.finish()

		// change state to finished but do not fire callbacks
		if (writer.state.erasing) return
		this.callback('finish', string, writerData)
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
