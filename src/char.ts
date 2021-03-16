// eslint-disable-next-line import/no-cycle
import GlitchedWriter from './index'
import { random, deleteRandom, wait, promiseWhile } from './utils'
export default class Char {
	char: string
	goal: string
	stepsLeft: number
	maxGhosts: number
	ghostsBefore: string[] = []
	ghostsAfter: string[] = []
	writer: GlitchedWriter

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
		this.maxGhosts = writer.options.genMaxGhosts
		if (initialGhosts) this.ghostsAfter = [...initialGhosts]
	}

	get string(): string {
		const { char, ghostsAfter, ghostsBefore } = this
		return [ghostsBefore.join(''), char, ghostsAfter.join('')].join('')
	}

	get finished(): boolean {
		const { stepsLeft, char, goal, ghostsBefore, ghostsAfter } = this
		return (
			stepsLeft <= 0 &&
			char === goal &&
			ghostsBefore.length === 0 &&
			ghostsAfter.length === 0
		)
	}

	async play() {
		const loop = async () => {
			await wait(this.writer.options.genInterval)

			this.nextStep()
			this.writer.displayStep()

			return true
		}

		await wait(this.writer.options.genInitDelay)

		await promiseWhile(() => !this.finished, loop)
	}

	nextStep(): boolean {
		const areStepsLeft = this.stepsLeft > 0
		if (areStepsLeft) {
			/**
			 * IS GROWING
			 */
			const {
				genGhostChance: ghostChance,
				genChangeChance: changeChance,
			} = this.writer.options

			if (Math.random() <= ghostChance) {
				const newGhost = this.writer.options.genGhost
				Math.random() < 0.5
					? insertGhost(this.ghostsBefore, newGhost)
					: insertGhost(this.ghostsAfter, newGhost)
			}
			if (Math.random() <= changeChance)
				this.char = this.writer.options.genGhost
		} else if (!this.finished) {
			/**
			 * IS SHRINKING
			 */
			if (this.char !== this.goal) this.char = this.goal
			else {
				Math.random() < 0.5 && this.ghostsBefore.length > 0
					? deleteRandom(this.ghostsBefore)
					: deleteRandom(this.ghostsAfter)
			}
		} else {
			/**
			 * IS DONE
			 */
			return true
		}

		this.stepsLeft--
		return false
	}
}

function insertGhost(ghostsArray: string[], ghost: string) {
	const { length } = ghostsArray
	ghostsArray.splice(random(0, length, 'floor'), 0, ghost)
}
