import Options from './options'
import { random } from './utils'

export default class Char {
	char: string
	goal: string
	stepsLeft: number
	maxGhosts: number
	ghostsBefore: string = ''
	ghostsAfter: string = ''
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
		if (initialGhosts) this.ghostsAfter = initialGhosts
	}

	get string(): string {
		const { char, ghostsAfter, ghostsBefore } = this
		return [ghostsBefore, char, ghostsAfter].join('')
	}

	proceed() {
		if (this.stepsLeft === 0) return

		const { genGhostChance: ghostChance } = this.writerOptions,
			newGhost =
				Math.random() <= ghostChance ? this.writerOptions.genGhost : ''

		if (newGhost)
			Math.random() < 0.5
				? (this.ghostsBefore = insertGhost(this.ghostsBefore, newGhost))
				: (this.ghostsAfter = insertGhost(this.ghostsAfter, newGhost))
	}
}

function insertGhost(ghostsString: string, ghost: string): string {
	const { length } = ghostsString,
		array = [...ghostsString]
	array.splice(random(0, length, 'floor'), 0, ghost)
	return array.join('')
}
