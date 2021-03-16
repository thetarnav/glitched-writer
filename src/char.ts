import Options from './options'
import { random, deleteRandom } from './utils'

export default class Char {
	char: string
	goal: string
	stepsLeft: number
	maxGhosts: number
	ghostsBefore: string[] = []
	ghostsAfter: string[] = []
	writerOptions: Options

	constructor(
		char: string,
		goal: string,
		options: Options,
		initialGhosts?: string,
	) {
		this.char = char
		this.goal = goal
		this.writerOptions = options
		this.stepsLeft = options.genSteps
		this.maxGhosts = options.genMaxGhosts
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

	proceed(): boolean {
		const areStepsLeft = this.stepsLeft > 0
		if (areStepsLeft) {
			/**
			 * IS GROWING
			 */
			const {
					genGhostChance: ghostChance,
					genChangeChance: changeChance,
				} = this.writerOptions,
				newGhost =
					Math.random() <= ghostChance ? this.writerOptions.genGhost : ''

			if (newGhost)
				Math.random() < 0.5
					? insertGhost(this.ghostsBefore, newGhost)
					: insertGhost(this.ghostsAfter, newGhost)
			else if (Math.random() <= changeChance)
				this.char = this.writerOptions.genGhost
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
