// eslint-disable-next-line import/no-cycle
import GlitchedWriter from './index'
import { random, deleteRandom, wait, promiseWhile, coinFlip } from './utils'

export default class Char {
	l: string
	gl: string
	stepsLeft: number
	ghostsBefore: string[] = []
	ghostsAfter: string[] = []
	writer: GlitchedWriter
	stop: boolean = false
	special: boolean
	els?: {
		charEl: HTMLSpanElement
		ghostsBeforeEl: HTMLSpanElement
		letterEl: HTMLSpanElement
		ghostsAfterEl: HTMLSpanElement
	}

	constructor(
		l: string,
		gl: string,
		writer: GlitchedWriter,
		initialGhosts?: string,
		special: boolean = false,
	) {
		this.l = l
		this.gl = gl
		this.writer = writer
		this.special = special
		if (initialGhosts) this.ghostsBefore = [...initialGhosts]

		this.stepsLeft = writer.options.stepsLeft

		if (special) this.stepsLeft = 0
		else if (writer.options.letterize) {
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
			this.els.charEl.append(
				this.els.ghostsBeforeEl,
				this.els.letterEl,
				this.els.ghostsAfterEl,
			)
			this.writeToElement()
		}
	}

	reset(
		l: string,
		gl: string,
		initialGhosts: string = '',
		special: boolean = false,
	) {
		if (!special && this.special) this.l = ''
		this.l = l
		this.gl = gl
		this.special = special
		this.ghostsBefore = Array.from(initialGhosts)
		this.stepsLeft = this.writer.options.stepsLeft
		this.writeToElement()
		if (this.els) {
			this.els.charEl.className = 'gw-char'
			this.els.letterEl.className = 'gw-letter'
		}
	}

	get string(): string {
		const { l: char, ghostsAfter, ghostsBefore } = this
		return [ghostsBefore.join(''), char, ghostsAfter.join('')].join('')
	}

	get finished(): boolean {
		const { l: char, gl: goal, ghostsBefore, ghostsAfter } = this
		return (
			char === goal && ghostsBefore.length === 0 && ghostsAfter.length === 0
		)
	}

	private writeToElement() {
		if (!this.els) return

		const { l, ghostsBefore, ghostsAfter } = this,
			{ ghostsBeforeEl, ghostsAfterEl, letterEl: letter } = this.els

		letter.textContent = l
		ghostsBeforeEl.textContent = ghostsBefore.join('')
		ghostsAfterEl.textContent = ghostsAfter.join('')
	}

	appendChild() {
		if (this.els) this.writer.htmlElement?.appendChild(this.els.charEl)
	}

	get interval(): number {
		let interval = this.writer.options.genInterval
		if (this.gl === '' || this.gl === ' ') interval /= 2
		return interval
	}

	async type() {
		const loop = async () => {
			!this.special && (await wait(this.interval))

			this.step()
			this.writer.emiter.call('step')
			this.writeToElement()
			this.stepsLeft--
		}

		!this.special && (await wait(this.writer.options.genInitDelay))

		if (this.els) this.els.charEl.classList.add('gw-typing')

		await promiseWhile(
			() => !this.finished && !this.writer.state.isPaused && !this.stop,
			loop,
		)

		if (this.els) {
			this.els.charEl.classList.add('gw-finished')
			this.els.charEl.classList.remove('gw-typing')
		}
		return this.finished
	}

	step() {
		if (this.stepsLeft > 0 && this.l !== this.gl) {
			/**
			 * IS GROWING
			 */
			const { ghostChance, changeChance } = this.writer.options

			if (coinFlip(ghostChance)) {
				if (this.writer.state.ghostsInLimit) this.addGhost()
				else this.removeGhost()
			}
			if (coinFlip(changeChance)) {
				if (this.els) this.els.letterEl.classList.add('gw-glitched')
				this.l = this.writer.options.genGhost
			}
		} else if (!this.finished) {
			/**
			 * IS SHRINKING
			 */
			if (this.els) this.els.letterEl.classList.remove('gw-glitched')
			this.l = this.gl
			this.removeGhost()
		}
	}

	addGhost() {
		const l = this.writer.options.genGhost
		this.writer.state.nGhosts++
		coinFlip()
			? insertGhost(this.ghostsBefore, l)
			: insertGhost(this.ghostsAfter, l)
	}

	removeGhost() {
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
