// eslint-disable-next-line import/no-cycle
import GlitchedWriter from './index'
import { random, deleteRandom, wait, promiseWhile } from './utils'

export default class Char {
	char: string
	goal: string
	stepsLeft: number
	ghostsBefore: string[] = []
	ghostsAfter: string[] = []
	writer: GlitchedWriter
	stop: boolean = false

	constructor(
		char: string,
		goal: string,
		writer: GlitchedWriter,
		initialGhosts?: string,
	) {
		this.char = char
		this.goal = goal
		this.writer = writer
		this.stepsLeft = writer.options.genSteps
		if (initialGhosts) this.ghostsBefore = [...initialGhosts]
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
			await wait(this.writer.options.genInterval)

			this.nextStep()
			this.writer.emitStep()

			return true
		}

		await wait(this.writer.options.genInitDelay)

		await promiseWhile(
			() => !this.finished && !this.writer.state.isPaused && !this.stop,
			loop,
		)

		return this.finished
	}

	nextStep(): boolean {
		const areStepsLeft = this.stepsLeft > 0
		if (areStepsLeft && this.char !== this.goal) {
			/**
			 * IS GROWING
			 */
			const {
				genGhostChance: ghostChance,
				genChangeChance: changeChance,
			} = this.writer.options

			if (Math.random() <= ghostChance) {
				if (this.writer.state.nGhosts < this.writer.options.genMaxGhosts) {
					const newGhost = this.writer.options.genGhost

					this.writer.state.nGhosts++
					this.addGhost(newGhost)
				} else this.removeGhost()
			}
			if (Math.random() <= changeChance)
				this.char = this.writer.options.genGhost
		} else if (!this.finished) {
			/**
			 * IS SHRINKING
			 */
			if (this.char !== this.goal) this.char = this.goal
			this.removeGhost()
		} else {
			/**
			 * IS DONE
			 */
			return true
		}

		this.stepsLeft--
		return false
	}

	addGhost(l: string) {
		Math.random() < 0.5
			? insertGhost(this.ghostsBefore, l)
			: insertGhost(this.ghostsAfter, l)
	}

	removeGhost() {
		Math.random() < 0.5 && this.ghostsBefore.length > 0
			? deleteRandom(this.ghostsBefore)
			: deleteRandom(this.ghostsAfter)
	}
}

function insertGhost(ghostsArray: string[], ghost: string) {
	const { length } = ghostsArray
	ghostsArray.splice(random(0, length, 'floor'), 0, ghost)
}
