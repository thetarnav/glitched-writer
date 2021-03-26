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

	els?: {
		charEl: HTMLSpanElement
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

		if (writer.options.letterize && !isTag) {
			this.els = {
				charEl: document.createElement('span'),
				ghostsBeforeEl: document.createElement('span'),
				letterEl: document.createElement('span'),
				ghostsAfterEl: document.createElement('span'),
			}
			this.els.charEl.className = 'gw-char'
			this.els.ghostsBeforeEl.className = 'gw-ghosts'
			this.els.ghostsAfterEl.className = 'gw-ghosts'
			this.els.letterEl.className = 'gw-letter'
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

	private appendChildren() {
		if (this.els)
			this.els.charEl.append(
				this.els.ghostsBeforeEl,
				this.els.letterEl,
				this.els.ghostsAfterEl,
			)
		this.writeToElement()
	}

	reset(
		l: string,
		gl: string,
		initialGhosts: string = '',
		instant: boolean = false,
	) {
		this.setProps(l, gl, initialGhosts, instant)
		if (this.els) {
			this.els.charEl.className = 'gw-char'
			this.els.letterEl.className = 'gw-letter'
		}
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

	private writeToElement() {
		if (!this.els) return
		const { ghostsBeforeEl, ghostsAfterEl, letterEl } = this.els

		letterEl.innerHTML = this.l
		ghostsBeforeEl.textContent = this.ghostsBefore.join('')
		ghostsAfterEl.textContent = this.ghostsAfter.join('')
	}

	set spanElement(el: HTMLSpanElement) {
		if (!this.els) return
		this.els.charEl = el

		this.appendChildren()
	}

	get interval(): number {
		let interval = this.writer.options.genInterval
		if (this.isWhitespace) interval /= 2
		return interval
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

		this.els?.charEl.classList.add('gw-typing')

		await promiseWhile(
			() => !this.finished && !this.writer.state.isPaused && !this.stop,
			loop,
		)

		if (this.finished) {
			this.els?.charEl.classList.add('gw-finished')
			this.els?.charEl.classList.remove('gw-typing')
			this.els?.letterEl.classList.remove('gw-glitched')
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
				this.els?.letterEl.classList.add('gw-glitched')
				this.l = this.writer.options.genGhost
			}
		} else if (!this.finished) {
			/**
			 * IS SHRINKING
			 */
			this.els?.letterEl.classList.remove('gw-glitched')
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
