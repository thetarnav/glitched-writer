// eslint-disable-next-line import/no-cycle
import Options from './options'
import State from './state'
// @ts-ignore
// eslint-disable-next-line import/no-cycle
import Char from './char'

import { ConstructorOptions, WriteOptions, PlayOptions } from './types'
// @ts-ignore
import { promiseWhile, isInRange } from './utils'

// eslint-disable-next-line no-unused-vars
type StepCallback = (string: string, writerData?: WriterDataResponse) => any

interface WriterDataResponse {
	string: string
	writer: GlitchedWriter
	options: Options
	state: State
	status?: 'ERROR' | 'SUCCESS'
	message?: string
	error?: any
}

// @ts-ignore
export default class GlitchedWriter {
	options: Options
	state: State
	charTable: Char[] = []
	previousString: string = ''
	goalString: string = ''
	onStepCallback?: StepCallback

	constructor(options?: ConstructorOptions, onStepCallback?: StepCallback) {
		this.options = new Options(this, options)
		if (onStepCallback) this.onStepCallback = onStepCallback
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

	get writerData(): WriterDataResponse {
		const writer: GlitchedWriter = this,
			{ options, state, string } = this

		return {
			string,
			writer,
			options,
			state,
		}
	}

	emitStep(): void {
		if (this.onStepCallback)
			this.onStepCallback(this.string, this.getWriterData())
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
		return this.play({
			reverse: this.options.oneAtATime && writeOptions?.erase,
		})
	}

	async play(playOptions?: PlayOptions): Promise<WriterDataResponse> {
		const playList: Promise<boolean>[] = [],
			{ charTable } = this,
			{ length } = charTable

		if (this.state.isTyping)
			return this.getWriterData(
				'ERROR',
				`The writer is already typing "${this.goalString}".`,
			)

		this.state.play()

		if (this.options.oneAtATime) {
			const reverse = playOptions?.reverse ?? false

			let i = reverse ? length - 1 : 0,
				lastResult: boolean = true

			const loop = async (): Promise<void> => {
				lastResult = await charTable[i].type()
				reverse ? i-- : i++
			}
			await promiseWhile(
				() => isInRange(0, i, length) && lastResult && !this.state.isPaused,
				loop,
			)

			return lastResult
				? this.getWriterData('SUCCESS', `The writer finished typing.`)
				: this.getWriterData('ERROR', `Writer failed to finish typing.`)
		}
		charTable.forEach(char => playList.push(char.type()))

		try {
			const finished = (await Promise.all(playList)).every(result => result)
			finished && this.state.finish()
			return finished
				? this.getWriterData('SUCCESS', `The writer finished typing.`)
				: this.getWriterData('ERROR', `Writer failed to finish typing.`)
		} catch (error) {
			this.getWriterData('ERROR', 'Writer encountered an error.', error)
		}

		return this.state.finished
			? this.getWriterData('SUCCESS', `The writer finished typing.`)
			: this.getWriterData('ERROR', `Writer failed to finish typing.`)
	}

	pause() {
		this.state.pause()
	}

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

	private getWriterData(
		status?: WriterDataResponse['status'],
		message?: WriterDataResponse['message'],
		error?: WriterDataResponse['error'],
	): WriterDataResponse {
		const { writerData } = this
		return {
			...writerData,
			status,
			message,
			error,
		}
	}
}

function makeGoalArray(previous: string, goal: string): string[] {
	const goalArray = Array.from(goal),
		prevGtGoal = Math.max(previous.length - goal.length, 0)

	goalArray.push(...''.padEnd(prevGtGoal, ' '))

	return goalArray
}

export const createGlitchedWriter = (
	options?: ConstructorOptions,
	onStepCallback?: StepCallback,
): GlitchedWriter => new GlitchedWriter(options, onStepCallback)

export async function glitchWrite(
	string: string,
	options?: ConstructorOptions,
	onStepCallback?: StepCallback,
): Promise<WriterDataResponse> {
	const writer = new GlitchedWriter(options, onStepCallback)
	return writer.write(string)
}
