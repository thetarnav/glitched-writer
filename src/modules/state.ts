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
		this.maxGhosts = this.writer.options.maxGhosts
	}

	get ghostsInLimit(): boolean {
		return this.nGhosts < this.maxGhosts
	}

	play() {
		this.isTyping = true
		this.isPaused = false
		this.finished = false
		this.addClass()
		this.erasing && this.addClass('gw-erasing')
		this.maxGhosts = this.writer.options.maxGhosts

		this.writer.animator.run()
		this.writer.emiter.callback(
			'start',
			this.writer.goalText,
			this.writer.writerData,
		)
	}

	pause() {
		this.isTyping = false
		this.isPaused = true
		this.removeClasses()
	}

	finish() {
		this.progress.finish()
		this.isTyping = false
		this.finished = true
		this.removeClasses()
	}

	addClass(className: 'gw-writing' | 'gw-erasing' = 'gw-writing') {
		animateWithClass(this.writer.htmlElement, className)
	}

	removeClasses() {
		this.writer.htmlElement.classList.remove('gw-writing', 'gw-erasing')
	}
}
