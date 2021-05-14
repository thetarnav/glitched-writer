// eslint-disable-next-line import/no-cycle
import GlitchedWriter from '../index'
import {
	random,
	deleteRandom,
	wait,
	promiseWhile,
	coinFlip,
	isSpecialChar,
	LetterItem,
} from '../utils'

export default class Char {
	l!: string
	gl!: string
	stepsLeft!: number
	ghostsBefore: string[] = []
	ghostsAfter: string[] = []
	writer: GlitchedWriter

	stop: boolean = false
	specialType: LetterItem['type']

	afterGlitchChance: number = 0

	els?: {
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
		specialType: LetterItem['type'],
	) {
		this.writer = writer

		this.setProps(l, gl, initialGhosts, specialType)

		if (writer.options.letterize) {
			this.els = {
				ghostsBeforeEl: document.createElement('span'),
				letterEl: document.createElement('span'),
				ghostsAfterEl: document.createElement('span'),
			}
			this.els.ghostsBeforeEl.className = 'gw-ghosts'
			this.els.ghostsAfterEl.className = 'gw-ghosts'
			this.els.letterEl.className = 'gw-letter'
		}
	}

	private setProps(
		l: string,
		gl: string,
		initialGhosts: string = '',
		specialType: LetterItem['type'],
	) {
		const { options } = this.writer
		this.l = l
		this.gl = gl
		this.specialType = specialType
		this.ghostsBefore = [...initialGhosts]
		this.writer.state.nGhosts += initialGhosts.length

		this.stepsLeft = options.stepsLeft
		if (specialType === 'tag') this.stepsLeft = 0
		else if (isSpecialChar(gl)) this.specialType = 'whitespace'

		this.afterGlitchChance =
			(options.ghostChance + options.changeChance) / 3.7
	}

	reset(
		l: string,
		gl: string,
		initialGhosts: string = '',
		specialType: LetterItem['type'],
	) {
		this.setProps(l, gl, initialGhosts, specialType)
		if (this.els) this.els.letterEl.className = 'gw-letter'
	}

	get string(): string {
		const { l: char, ghostsAfter, ghostsBefore } = this
		return ghostsBefore.join('') + char + ghostsAfter.join('')
	}

	get finished(): boolean {
		const { l: char, gl: goal, ghostsBefore, ghostsAfter } = this
		return (
			(char === goal &&
				ghostsBefore.length === 0 &&
				ghostsAfter.length === 0) ||
			this.specialType === 'tag'
		)
	}

	get interval(): number {
		let interval = this.writer.options.genInterval
		if (this.specialType === 'whitespace') interval /= 2
		return interval
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

	private appendChildren() {
		this.els?.charEl?.append(
			this.els.ghostsBeforeEl,
			this.els.letterEl,
			this.els.ghostsAfterEl,
		)
		this.writeToElement()
	}

	async type() {
		const { writer } = this

		if (this.specialType === 'tag') {
			this.l = this.gl
			writer.emiter.call('step')
			writer.state.progress.increase()
			return true
		}

		const loop = async () => {
			await wait(this.interval)

			const lastString = this.string
			this.step()
			if (lastString !== this.string) {
				writer.emiter.call('step')
				this.writeToElement()
			}

			!writer.options.endless && this.stepsLeft--
		}

		await wait(writer.options.genInitDelay)

		await promiseWhile(
			() =>
				(!this.finished || writer.options.endless) &&
				!writer.state.isPaused &&
				!this.stop,
			loop,
		)

		if (this.finished) {
			writer.state.progress.increase()
			this.els?.charEl?.classList.add('gw-finished')
			this.els?.letterEl.classList.remove('gw-glitched')
		}
		return this.finished
	}

	step() {
		const { writer } = this
		if (
			(this.stepsLeft > 0 && this.l !== this.gl) ||
			(coinFlip(this.afterGlitchChance) &&
				this.specialType !== 'whitespace') ||
			writer.options.endless
		) {
			/**
			 * IS GROWING
			 */
			const { ghostChance, changeChance } = writer.options

			if (coinFlip(ghostChance)) {
				if (writer.state.ghostsInLimit) this.addGhost()
				else this.removeGhost()
			}
			if (coinFlip(changeChance)) {
				this.els?.letterEl.classList.add('gw-glitched')
				this.l = writer.options.ghost
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
		const l = this.writer.options.ghost
		this.writer.state.nGhosts++
		coinFlip()
			? insertGhost(this.ghostsBefore, l)
			: insertGhost(this.ghostsAfter, l)
	}

	private removeGhost() {
		const deleted =
			coinFlip() && this.ghostsBefore.length > 0
				? deleteRandom(this.ghostsBefore)
				: deleteRandom(this.ghostsAfter)

		if (deleted) this.writer.state.nGhosts--
	}
}

function insertGhost(ghostsArray: string[], ghost: string) {
	const { length } = ghostsArray
	ghostsArray.splice(random(0, length, 'floor'), 0, ghost)
}
