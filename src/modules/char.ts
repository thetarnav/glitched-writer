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
	animateWithClass,
} from '../utils'

export default class Char {
	index!: number
	l!: string
	gl!: string
	stepsLeft!: number
	ghosts: [string[], string[]] = [[], []]
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
		index: number,
	) {
		this.writer = writer
		const { options } = writer

		this.index = index
		this.l = l
		this.gl = gl
		this.specialType = specialType
		this.ghosts[0] = [...initialGhosts]
		this.writer.state.nGhosts += initialGhosts.length

		this.stepsLeft = options.steps
		if (specialType === 'tag') this.stepsLeft = 0
		else if (isSpecialChar(gl)) this.specialType = 'whitespace'

		this.afterGlitchChance =
			(options.ghostChance + options.changeChance) / 3.7

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

	get string(): string {
		const { l, ghosts } = this
		return ghosts[0].join('') + l + ghosts[1].join('')
	}

	get finished(): boolean {
		const { l, gl, ghosts } = this
		return (
			(l === gl && ghosts[0].length === 0 && ghosts[1].length === 0) ||
			this.specialType === 'tag'
		)
	}

	private writeToElement() {
		if (!this.els) return
		const { ghostsBeforeEl, ghostsAfterEl, letterEl, charEl } = this.els

		letterEl.innerHTML = this.l
		ghostsBeforeEl.textContent = this.ghosts[0].join('')
		ghostsAfterEl.textContent = this.ghosts[1].join('')

		charEl && animateWithClass(charEl, 'gw-changed')
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
		const { options, state, emiter } = this.writer

		if (this.specialType === 'tag') {
			this.l = this.gl
			emiter.call('step')
			state.progress.increase()
			return true
		}

		const loop = async () => {
			await wait(options.getInterval(this))

			const lastString = this.string
			this.step()
			if (lastString !== this.string) {
				emiter.call('step')
				this.writeToElement()
			}

			!options.endless && this.stepsLeft--
		}

		await wait(options.getDelay(this))

		await promiseWhile(
			() =>
				(!this.finished || options.endless) &&
				!state.isPaused &&
				!this.stop,
			loop,
		)

		if (this.finished) {
			state.progress.increase()
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
				this.l = writer.options.getGlyph(this)
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
		const { writer, ghosts } = this,
			l = writer.options.getGlyph(this)
		writer.state.nGhosts++
		coinFlip() ? insertGhost(ghosts[0], l) : insertGhost(ghosts[1], l)
	}

	private removeGhost() {
		const { writer, ghosts } = this,
			deleted =
				coinFlip() && ghosts[0].length > 0
					? deleteRandom(ghosts[0])
					: deleteRandom(ghosts[1])

		if (deleted) writer.state.nGhosts--
	}
}

function insertGhost(ghostsArray: string[], ghost: string) {
	const { length } = ghostsArray
	ghostsArray.splice(random(0, length, 'floor'), 0, ghost)
}
