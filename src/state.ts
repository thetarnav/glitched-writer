import GlitchedWriter from '.'
import { animateWithClass } from './utils'

export default class State {
	writer: GlitchedWriter
	nGhosts: number = 0
	isTyping: boolean = false
	isPaused: boolean = false
	finished: boolean = false

	constructor(writer: GlitchedWriter) {
		this.writer = writer
	}

	play() {
		this.isTyping = true
		this.isPaused = false
		this.finished = false
		this.toggleClass(true)
	}

	pause() {
		this.isTyping = false
		this.isPaused = true
		this.toggleClass(false)
	}

	finish() {
		this.isTyping = false
		this.finished = true
		this.toggleClass(false)
	}

	toggleClass(enable: boolean): void {
		const el = this.writer.htmlElement,
			className = 'glitched-writer--writing'
		if (!el) return

		enable ? animateWithClass(el, className) : el.classList.remove(className)
	}
}
