import Options from './options'
import State from './state'
import Char from './char'
import Emiter from './emiter'
import {
	ConstructorOptions,
	WriteOptions,
	PlayOptions,
	WriterDataResponse,
	Callback,
} from './types'
import { wait, promiseWhile, isInRange } from './utils'
import { presets, glyphs } from './presets'

export default class GlitchedWriter {
	htmlElement?: HTMLElement | Element
	options: Options
	state: State
	emiter: Emiter
	charTable: Char[] = []
	previousString: string = ''
	goalString: string = ''

	constructor(
		htmlElement?: HTMLElement | Element,
		options?: ConstructorOptions,
		onStepCallback?: Callback,
		onFinishCallback?: Callback,
	) {
		this.htmlElement = htmlElement
		this.options = new Options(this, options)
		this.state = new State(this)
		this.emiter = new Emiter(this, onStepCallback, onFinishCallback)
	}

	get string(): string {
		const string = this.charTable.map(char => char.string).join('')

		return [
			this.options.getAppendedText('leading'),
			string,
			this.options.getAppendedText('trailing'),
		].join('')
	}

	get genPreviousString(): string {
		const elTextContent = this.htmlElement?.textContent
		return (elTextContent ?? this.previousString).trim()
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

	async write(string: string, writeOptions?: WriteOptions) {
		if (this.options.startFrom === 'erase' && !writeOptions?.erase)
			await this.write(this.genEraseGoalString(string), { erase: true })

		this.previousString = this.htmlElement?.textContent ?? this.string
		this.goalString = string
		this.charTable.forEach(char => (char.stop = true))
		this.charTable = []
		this.state.nGhosts = 0
		this.options.setCharset()

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

			return this.returnResult(lastResult)
		}
		charTable.forEach(char => playList.push(char.type()))

		try {
			const finished = (await Promise.all(playList)).every(result => result)
			return this.returnResult(finished)
		} catch (error) {
			return this.getWriterData(
				'ERROR',
				'Writer encountered an error.',
				error,
			)
		}
	}

	pause() {
		this.state.pause()
	}

	private returnResult(finished: boolean): WriterDataResponse {
		finished ? this.emiter.call('finish') : this.emiter.call('step')
		return finished
			? this.getWriterData('SUCCESS', `The writer finished typing.`)
			: this.getWriterData('ERROR', `Writer failed to finish typing.`)
	}

	private createMatchingCharTable(): void {
		const { genPreviousString: previous, goalString: goal } = this,
			goalStringArray = strechGoal(previous, goal),
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
			goalStringArray = strechGoal(previous, goal)

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

function strechGoal(previous: string, goal: string): string[] {
	const goalArray = typeof goal === 'object' ? goal : Array.from(goal),
		prevGtGoal = Math.max(previous.length - goal.length, 0)

	goalArray.push(...' '.repeat(prevGtGoal))

	return goalArray
}

export const createGlitchedWriter = (
	htmlElement?: HTMLElement,
	options?: ConstructorOptions,
	onStepCallback?: Callback,
	onFinishCallback?: Callback,
): GlitchedWriter =>
	new GlitchedWriter(htmlElement, options, onStepCallback, onFinishCallback)

export async function glitchWrite(
	string: string,
	htmlElement?: HTMLElement,
	options?: ConstructorOptions,
	onStepCallback?: Callback,
	onFinishCallback?: Callback,
): Promise<WriterDataResponse> {
	const writer = new GlitchedWriter(
		htmlElement,
		options,
		onStepCallback,
		onFinishCallback,
	)
	return writer.write(string)
}

export {
	presets,
	glyphs,
	wait,
	ConstructorOptions,
	WriterDataResponse,
	Callback,
}

// const Writer = new GlitchedWriter(undefined, {}, string => console.log(string))

// Writer.write('\tNothing\n\tspecial here!')
