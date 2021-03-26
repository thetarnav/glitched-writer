import GlitchedWriter from './index'
import { animateWithClass } from './utils'

export default class State {
	writer: GlitchedWriter
	nGhosts: number = 0
	maxGhosts: number
	isTyping: boolean = false
	isPaused: boolean = false
	finished: boolean = false

	constructor(writer: GlitchedWriter) {
		this.writer = writer
		this.maxGhosts = this.writer.options.genMaxGhosts
	}

	get ghostsInLimit(): boolean {
		return this.nGhosts < this.maxGhosts
	}

	play() {
		this.isTyping = true
		this.isPaused = false
		this.finished = false
		this.toggleClass(true)
		this.maxGhosts = this.writer.options.genMaxGhosts
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
			className = 'gw-writing'
		if (!el) return

		enable ? animateWithClass(el, className) : el.classList.remove(className)
	}
}
