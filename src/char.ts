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

		if (this.special) this.stepsLeft = 0
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

	async type() {
		const loop = async () => {
			!this.special && (await wait(this.writer.options.genInterval))

			this.step()
			this.writer.emiter.call('step')
			this.stepsLeft--
		}

		!this.special && (await wait(this.writer.options.genInitDelay))

		await promiseWhile(
			() => !this.finished && !this.writer.state.isPaused && !this.stop,
			loop,
		)

		return this.finished
	}

	step() {
		if (this.stepsLeft > 0 && this.l !== this.gl) {
			/**
			 * IS GROWING
			 */
			const {
				genGhostChance: ghostChance,
				genChangeChance: changeChance,
			} = this.writer.options

			if (coinFlip(ghostChance)) {
				if (this.writer.state.ghostsInLimit) this.addGhost()
				else this.removeGhost()
			}
			if (coinFlip(changeChance)) this.l = this.writer.options.genGhost
		} else if (!this.finished) {
			/**
			 * IS SHRINKING
			 */
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
