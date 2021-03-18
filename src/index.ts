// eslint-disable-next-line import/no-cycle
import Options from './options'
import State from './state'
// @ts-ignore
// eslint-disable-next-line import/no-cycle
import Char from './char'

import { ConstructorOptions, WriteOptions, PlayOptions } from './types'
// @ts-ignore
import {
	wait,
	promiseWhile,
	isInRange,
	animateWithClass,
	reverseString,
} from './utils'

import { presets, glyphs } from './presets'

export { presets, glyphs, wait }

// eslint-disable-next-line no-unused-vars
type StepCallback = (string: string, writerData?: WriterDataResponse) => any

export interface WriterDataResponse {
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
	htmlElement?: HTMLElement
	options: Options
	state: State
	charTable: Char[] = []
	previousString: string = ''
	goalString: string = ''
	onStepCallback?: StepCallback

	constructor(
		htmlElement?: HTMLElement,
		options?: ConstructorOptions,
		onStepCallback?: StepCallback,
	) {
		this.options = new Options(this, options)
		if (onStepCallback) this.onStepCallback = onStepCallback
		this.state = new State()
		this.htmlElement = htmlElement
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

	get genPreviousString(): string {
		let elTextContent = this.htmlElement?.textContent
		if (this.options.reverseOutput)
			elTextContent &&= reverseString(elTextContent)
		return (elTextContent ?? this.previousString).trim()
	}

	emitStep(): void {
		const { htmlElement } = this
		let { string } = this

		if (this.options.reverseOutput) string = reverseString(string)

		if (htmlElement) htmlElement.textContent = string
		if (htmlElement) htmlElement.setAttribute('data-string', string)
		if (this.onStepCallback) this.onStepCallback(string, this.getWriterData())
	}

	async write(string: string, writeOptions?: WriteOptions) {
		if (this.options.startFrom === 'erase' && !writeOptions?.erase)
			await this.write(this.genEraseGoalString(string), { erase: true })

		this.previousString = this.htmlElement?.textContent ?? this.string
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
		this.toggleClass(true)

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

			return this.returnResult(lastResult)
		}
		charTable.forEach(char => playList.push(char.type()))

		try {
			const finished = (await Promise.all(playList)).every(result => result)
			return this.returnResult(finished)
		} catch (error) {
			this.getWriterData('ERROR', 'Writer encountered an error.', error)
		}

		return this.state.finished
			? this.getWriterData('SUCCESS', `The writer finished typing.`)
			: this.getWriterData('ERROR', `Writer failed to finish typing.`)
	}

	pause() {
		this.toggleClass(false)
		this.state.pause()
	}

	private returnResult(finished: boolean): WriterDataResponse {
		finished && this.state.finish()
		this.emitStep()
		this.toggleClass(false)
		return finished
			? this.getWriterData('SUCCESS', `The writer finished typing.`)
			: this.getWriterData('ERROR', `Writer failed to finish typing.`)
	}

	private toggleClass(enable: boolean): void {
		const el = this.htmlElement,
			className = 'glitched-writer--writing'
		if (!el) return

		enable ? animateWithClass(el, className) : el.classList.remove(className)
	}

	private createMatchingCharTable(): void {
		const { genPreviousString: previous, goalString: goal } = this,
			goalStringArray = makeGoalArray(previous, goal),
			maxDist = Math.ceil(this.options.genMaxGhosts / 2)

		let pi = -1
		goalStringArray.forEach(gl => {
			const pl = previous[pi]
			pi++
			if (gl === '' && !pl) return
			const fi = gl !== '' ? previous.indexOf(gl, pi) : -1

			if (fi !== -1 && fi - pi <= maxDist) {
				const appendedText = previous.substring(pi, fi)
				this.charTable.push(new Char(gl, gl, this, appendedText))
				pi = fi
				this.state.nGhosts += appendedText.length
			} else this.charTable.push(new Char(pl || ' ', gl, this))
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

	private genEraseGoalString(goal: string): string {
		const { genPreviousString: previous } = this
		let result = ''

		for (let i = 0; i < goal.length; i++) {
			const gl = goal[i],
				pl = previous[i] ?? ''

			if (gl === pl) result += pl
			else break
		}

		const diff = Math.max(goal.length - result.length, 0)
		if (diff > 0) result = result.padEnd(diff, ' ')

		return result
	}
}

function makeGoalArray(previous: string, goal: string): string[] {
	const goalArray = Array.from(goal),
		prevGtGoal = Math.max(previous.length - goal.length, 0)

	goalArray.push(...''.padEnd(prevGtGoal, ' '))

	return goalArray
}

export const createGlitchedWriter = (
	htmlElement?: HTMLElement,
	options?: ConstructorOptions,
	onStepCallback?: StepCallback,
): GlitchedWriter => new GlitchedWriter(htmlElement, options, onStepCallback)

export async function glitchWrite(
	string: string,
	htmlElement?: HTMLElement,
	options?: ConstructorOptions,
	onStepCallback?: StepCallback,
): Promise<WriterDataResponse> {
	const writer = new GlitchedWriter(htmlElement, options, onStepCallback)
	return writer.write(string)
}
