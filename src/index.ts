// import { random, filterDuplicates } from './utils'
// eslint-disable-next-line import/no-cycle
import Options from './options'
import State from './state'
// @ts-ignore
// eslint-disable-next-line import/no-cycle
import Char from './char'

import { ConstructorOptions } from './types'
import { wait } from './utils'

// eslint-disable-next-line no-unused-vars
type StepCallback = (string: string) => void

interface WriteOptions {
	erase: boolean
}

// @ts-ignore
export default class GlitchedWriter {
	options: Options
	state: State
	charTable: Char[] = []
	previousString: string = ''
	goalString: string = ''
	stepCallback: StepCallback | null = null

	constructor(options?: ConstructorOptions, stepCallback?: StepCallback) {
		this.options = new Options(this, options)
		if (stepCallback) this.stepCallback = stepCallback
		this.state = new State()
	}

	get string(): string {
		const charTableMap = this.charTable.map(char => char.string)

		return [
			this.options.getAppendedText('leading'),
			charTableMap.join(''),
			this.options.getAppendedText('trailing'),
		].join('')
	}

	emitStep(): void {
		console.log('string:', this.string)
		if (this.stepCallback) this.stepCallback(this.string)
	}

	async write(string: string, writeOptions?: WriteOptions) {
		if (this.options.startFrom === 'erase' && !writeOptions?.erase)
			await this.write(''.padEnd(string.length, ' '), { erase: true })

		this.previousString = this.string
		this.goalString = string
		this.charTable.forEach(char => (char.stop = true))
		this.charTable = []
		this.state.nGhosts = 0

		if (this.options.startFrom === 'matching') this.createMatchingCharTable()
		else this.createPreviousCharTable()

		this.pause()
		return this.play()
	}

	// private eraseThenWrite

	private createMatchingCharTable(): void {
		const { previousString: previous, goalString: goal } = this,
			goalStringArray = makeGoalArray(previous, goal)

		let pi = -1
		goalStringArray.forEach(l => {
			pi++
			if (l === '' && !previous[pi]) return
			const fi = l !== '' ? previous.indexOf(l, pi) : -1

			if (fi !== -1) {
				const appendedText = previous.substring(pi, fi)
				this.charTable.push(new Char(l, l, this, appendedText))
				pi = fi
				this.state.nGhosts += appendedText.length
			} else this.charTable.push(new Char(previous[pi] || ' ', l, this))
		})
	}

	private createPreviousCharTable(): void {
		const { previousString: previous, goalString: goal } = this,
			goalStringArray = makeGoalArray(previous, goal)

		goalStringArray.forEach((l, i) =>
			this.charTable.push(new Char(previous[i] || ' ', l, this)),
		)
	}

	async play() {
		const playList: Promise<boolean>[] = [],
			{ charTable } = this

		if (this.state.isTyping) return false

		this.state.play()

		charTable.forEach(char => playList.push(char.type()))

		try {
			const finished = (await Promise.all(playList)).every(result => result)
			finished && this.state.finish()
			return finished
		} catch (error) {
			console.error(error)
			return false
		}
	}

	pause() {
		this.state.pause()
	}
}

function makeGoalArray(previous: string, goal: string): string[] {
	const goalArray = Array.from(goal),
		prevGtGoal = Math.max(previous.length - goal.length, 0)

	goalArray.push(...''.padEnd(prevGtGoal, ' '))

	return goalArray
}

const exampleWriter = new GlitchedWriter({ startFrom: 'erase' })

// eslint-disable-next-line func-names
;(async function () {
	await exampleWriter.write('Time To Die')
	await wait(200)
	await exampleWriter.write('Some weird string')
	await wait(200)
	await exampleWriter.write('Number two!')
})()
