// eslint-disable-next-line import/no-cycle
import GlitchedWriter from './index'
import { random, deleteRandom, wait, promiseWhile, coinFlip } from './utils'

export default class Char {
	char: string
	goal: string
	stepsLeft: number
	maxGhosts: number
	ghostsBefore: string[] = []
	ghostsAfter: string[] = []
	writer: GlitchedWriter
	stop: boolean = false
	instant: boolean

	constructor(
		char: string,
		goal: string,
		writer: GlitchedWriter,
		initialGhosts?: string,
		instant: boolean = false,
	) {
		this.char = char
		this.goal = goal
		this.writer = writer
		this.instant = instant
		if (initialGhosts) this.ghostsBefore = [...initialGhosts]

		this.stepsLeft = writer.options.stepsLeft

		if (this.instant) this.stepsLeft = 0

		this.maxGhosts = writer.options.genMaxGhosts
	}

	get string(): string {
		const { char, ghostsAfter, ghostsBefore } = this
		return [ghostsBefore.join(''), char, ghostsAfter.join('')].join('')
	}

	get finished(): boolean {
		const { char, goal, ghostsBefore, ghostsAfter } = this
		return (
			char === goal && ghostsBefore.length === 0 && ghostsAfter.length === 0
		)
	}

	async type() {
		const loop = async () => {
			!this.instant && (await wait(this.writer.options.genInterval))

			this.nextStep()
			this.writer.emiter.call('step')

			return true
		}

		!this.instant && (await wait(this.writer.options.genInitDelay))

		await promiseWhile(
			() => !this.finished && !this.writer.state.isPaused && !this.stop,
			loop,
		)

		return this.finished
	}

	nextStep() {
		if (this.stepsLeft > 0 && this.char !== this.goal) {
			/**
			 * IS GROWING
			 */
			const {
				genGhostChance: ghostChance,
				genChangeChance: changeChance,
			} = this.writer.options

			if (coinFlip(ghostChance)) {
				if (this.writer.state.nGhosts < this.maxGhosts) this.addGhost()
				else this.removeGhost()
			}
			if (coinFlip(changeChance)) this.char = this.writer.options.genGhost
		} else if (!this.finished) {
			/**
			 * IS SHRINKING
			 */
			this.char = this.goal
			this.removeGhost()
		} else {
			/**
			 * IS DONE
			 */
			return
		}

		this.stepsLeft--
	}

	addGhost() {
		const l = this.writer.options.genGhost
		this.writer.state.nGhosts++
		coinFlip()
			? insertGhost(this.ghostsBefore, l)
			: insertGhost(this.ghostsAfter, l)
	}

	removeGhost() {
		coinFlip() && this.ghostsBefore.length > 0
			? deleteRandom(this.ghostsBefore)
			: deleteRandom(this.ghostsAfter)
	}
}

function insertGhost(ghostsArray: string[], ghost: string) {
	const { length } = ghostsArray
	ghostsArray.splice(random(0, length, 'floor'), 0, ghost)
}
