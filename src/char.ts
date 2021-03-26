// eslint-disable-next-line import/no-cycle
import GlitchedWriter from './index'
import {
	random,
	deleteRandom,
	wait,
	promiseWhile,
	coinFlip,
	isSpecialChar,
} from './utils'

export default class Char {
	l!: string
	gl!: string
	stepsLeft!: number
	ghostsBefore: string[] = []
	ghostsAfter: string[] = []
	writer: GlitchedWriter

	stop: boolean = false
	isTag: boolean = false
	isWhitespace: boolean = false

	afterGlitchChance: number = 0

	letterize?: {
		charEl?: HTMLSpanElement
		ghostsBeforeEl: HTMLSpanElement
		letterEl: HTMLSpanElement
		ghostsAfterEl: HTMLSpanElement
	}

	constructor(
		writer: GlitchedWriter,
		l: string,
		gl: string,
		initialGhosts: string = '',
		isTag: boolean = false,
	) {
		this.writer = writer

		this.setProps(l, gl, initialGhosts, isTag)

		if (writer.options.letterize) {
			this.letterize = {
				ghostsBeforeEl: document.createElement('span'),
				letterEl: document.createElement('span'),
				ghostsAfterEl: document.createElement('span'),
			}
			this.letterize.ghostsBeforeEl.className = 'gw-ghosts'
			this.letterize.ghostsAfterEl.className = 'gw-ghosts'
			this.letterize.letterEl.className = 'gw-letter'
		}
	}

	private setProps(
		l: string,
		gl: string,
		initialGhosts: string = '',
		isTag: boolean = false,
	) {
		const { options } = this.writer
		this.l = l
		this.gl = gl
		this.isTag = isTag
		this.ghostsBefore = [...initialGhosts]

		this.stepsLeft = options.stepsLeft
		if (isTag) this.stepsLeft = 0

		this.isWhitespace = isSpecialChar(gl)

		this.afterGlitchChance =
			(options.ghostChance + options.changeChance) / 3.7
	}

	reset(
		l: string,
		gl: string,
		initialGhosts: string = '',
		isTag: boolean = false,
	) {
		this.setProps(l, gl, initialGhosts, isTag)
		if (this.letterize) this.letterize.letterEl.className = 'gw-letter'
	}

	get string(): string {
		const { l: char, ghostsAfter, ghostsBefore } = this
		return ghostsBefore.join('') + char + ghostsAfter.join('')
	}

	get finished(): boolean {
		const { l: char, gl: goal, ghostsBefore, ghostsAfter } = this
		return (
			char === goal && ghostsBefore.length === 0 && ghostsAfter.length === 0
		)
	}

	get interval(): number {
		let interval = this.writer.options.genInterval
		if (this.isWhitespace) interval /= 2
		return interval
	}

	private writeToElement() {
		if (!this.letterize) return
		const { ghostsBeforeEl, ghostsAfterEl, letterEl } = this.letterize

		letterEl.innerHTML = this.l
		ghostsBeforeEl.textContent = this.ghostsBefore.join('')
		ghostsAfterEl.textContent = this.ghostsAfter.join('')
	}

	set spanElement(el: HTMLSpanElement) {
		if (!this.letterize) return
		this.letterize.charEl = el
		this.appendChildren()
	}

	private appendChildren() {
		this.letterize?.charEl?.append(
			this.letterize.ghostsBeforeEl,
			this.letterize.letterEl,
			this.letterize.ghostsAfterEl,
		)
		this.writeToElement()
	}

	async type() {
		const loop = async () => {
			!this.isTag && (await wait(this.interval))

			const lastString = this.string
			this.step()
			if (lastString !== this.string) {
				this.writer.emiter.call('step')
				this.writeToElement()
			}
			this.stepsLeft--
		}

		!this.isTag && (await wait(this.writer.options.genInitDelay))

		await promiseWhile(
			() => !this.finished && !this.writer.state.isPaused && !this.stop,
			loop,
		)

		if (this.finished) {
			this.letterize?.charEl?.classList.add('gw-finished')
			this.letterize?.letterEl.classList.remove('gw-glitched')
		}
		return this.finished
	}

	step() {
		if (
			(this.stepsLeft > 0 && this.l !== this.gl) ||
			(coinFlip(this.afterGlitchChance) && !this.isTag && !this.isWhitespace)
		) {
			/**
			 * IS GROWING
			 */
			const { ghostChance, changeChance } = this.writer.options

			if (coinFlip(ghostChance)) {
				if (this.writer.state.ghostsInLimit) this.addGhost()
				else this.removeGhost()
			}
			if (coinFlip(changeChance)) {
				this.letterize?.letterEl.classList.add('gw-glitched')
				this.l = this.writer.options.genGhost
			}
		} else if (!this.finished) {
			/**
			 * IS SHRINKING
			 */
			this.letterize?.letterEl.classList.remove('gw-glitched')
			this.l = this.gl
			this.removeGhost()
		}
	}

	private addGhost() {
		const l = this.writer.options.genGhost
		this.writer.state.nGhosts++
		coinFlip()
			? insertGhost(this.ghostsBefore, l)
			: insertGhost(this.ghostsAfter, l)
	}

	private removeGhost() {
		this.writer.state.nGhosts--
		coinFlip() && this.ghostsBefore.length > 0
			? deleteRandom(this.ghostsBefore)
			: deleteRandom(this.ghostsAfter)
	}
}

function insertGhost(ghostsArray: string[], ghost: string) {
	const { length } = ghostsArray
	ghostsArray.splice(random(0, length, 'floor'), 0, ghost)
}
