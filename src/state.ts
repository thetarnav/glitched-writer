export default class State {
	nGhosts: number
	isTyping: boolean = false
	isPaused: boolean = false
	finished: boolean = false

	constructor(nGhosts: number = 0) {
		this.nGhosts = nGhosts
	}

	play() {
		this.isTyping = true
		this.isPaused = false
		this.finished = false
	}

	pause() {
		this.isTyping = false
		this.isPaused = true
	}

	finish() {
		this.isTyping = false
		this.finished = true
	}
}
