import GlitchedWriter from '../index'
import { animateWithClass } from '../utils'

export default class State {
	writer: GlitchedWriter
	nGhosts = 0
	maxGhosts: number
	/**
	 * Numerical data about progress of writing
	 */
	progress = {
		percent: 0,
		done: 0,
		todo: 0,

		increase() {
			this.done++
			this.percent = this.done / this.todo
		},

		reset(todo: number) {
			this.percent = 0
			this.done = 0
			this.todo = todo
		},

		finish() {
			this.done = this.todo
			this.percent = 1
		},
	}

	isTyping = false
	isPaused = false
	finished = true
	erasing = false

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
		this.writer.animator.run()
	}

	pause() {
		this.isTyping = false
		this.isPaused = true
		this.toggleClass(false)
	}

	finish() {
		this.progress.finish()
		this.isTyping = false
		this.finished = true
		this.toggleClass(false)
	}

	toggleClass(enable: boolean): void {
		const el = this.writer.htmlElement,
			className = 'gw-writing'

		enable ? animateWithClass(el, className) : el.classList.remove(className)
	}
}
