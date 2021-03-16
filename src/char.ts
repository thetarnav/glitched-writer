import Options from './options'
import { random, deleteRandom, wait, promiseWhile } from './utils'

type StepCallback = (string: string) => void
export default class Char {
	char: string
	goal: string
	stepsLeft: number
	maxGhosts: number
	ghostsBefore: string[] = []
	ghostsAfter: string[] = []
	writerOptions: Options
	stepCallback: StepCallback

	constructor(
		char: string,
		goal: string,
		options: Options,
		stepCallback: StepCallback,
		initialGhosts?: string,
	) {
		this.char = char
		this.goal = goal
		this.writerOptions = options
		this.stepCallback = stepCallback
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

	async play() {
		const loop = async () => {
			await wait(this.writerOptions.genInterval)

			this.nextStep()
			this.stepCallback(this.string)

			return true
		}

		await wait(this.writerOptions.genInitDelay)

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
			} = this.writerOptions

			if (Math.random() <= ghostChance) {
				const newGhost = this.writerOptions.genGhost
				Math.random() < 0.5
					? insertGhost(this.ghostsBefore, newGhost)
					: insertGhost(this.ghostsAfter, newGhost)
			}
			if (Math.random() <= changeChance)
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
