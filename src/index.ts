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
import {
	wait,
	promiseWhile,
	isInRange,
	htmlToArray,
	TagOrString,
	isSpecialChar,
	filterHtml,
	arrayOfTheSame,
} from './utils'
import { presets, glyphs, PresetName } from './presets'

export default class GlitchedWriter {
	htmlElement?: HTMLElement | Element
	options: Options
	state: State
	emiter: Emiter
	charTable: Char[] = []
	goalString: string = ''

	constructor(
		htmlElement?: HTMLElement | Element,
		options?: ConstructorOptions | PresetName,
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

		return string
	}

	get previousString(): string {
		let prev = this.htmlElement?.textContent ?? this.string
		if (this.options.html) {
			prev = this.htmlElement?.innerHTML ?? prev
			prev = filterHtml(prev)
		}
		prev = prev.trim()
		return prev
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
			await this.write(this.genGoalStringToErase(string), { erase: true })

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
		const { goalStringArray, previousString: previous } = this,
			maxDist = Math.min(Math.ceil(this.options.genMaxGhosts / 2), 5)

		let pi = -1
		goalStringArray.forEach(gl => {
			pi++
			const pl = previous[pi]
			if (gl === '' && !pl) return

			if (typeof gl === 'object' || isSpecialChar(gl)) {
				pi--
				this.addChar(
					'',
					typeof gl === 'object' ? gl.tag : gl,
					undefined,
					true,
				)
				return
			}

			const fi = gl !== '' ? previous.indexOf(gl, pi) : -1

			if (fi !== -1 && fi - pi <= maxDist) {
				const appendedText = previous.substring(pi, fi)
				this.addChar(gl, gl, appendedText)
				pi = fi
				this.state.nGhosts += appendedText.length
			} else this.addChar(pl || this.options.space, gl)
		})
	}

	private createPreviousCharTable(): void {
		const { goalStringArray, previousString: previous } = this

		let pi = -1
		goalStringArray.forEach(gl => {
			pi++
			const pl = previous[pi] || this.options.space

			if (typeof gl === 'object' || isSpecialChar(gl)) {
				pi--
				this.addChar(
					'',
					typeof gl === 'object' ? gl.tag : gl,
					undefined,
					true,
				)
				return
			}

			this.addChar(pl, gl)
		})
	}

	private addChar(
		pl: string,
		gl: string,
		appendedText?: string,
		instant: boolean = false,
	) {
		this.charTable.push(new Char(pl, gl, this, appendedText, instant))
	}

	private get goalStringArray(): TagOrString[] {
		const { goalString: goal, previousString: previous, options } = this,
			goalArray = options.html ? htmlToArray(goal) : Array.from(goal)

		const prevGtGoal = Math.max(previous.length - goalArray.length, 0)

		goalArray.push(...arrayOfTheSame(options.space, prevGtGoal))

		return goalArray
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

	private genGoalStringToErase(goal: string): string {
		const { previousString: previous } = this
		let result = ''

		for (let i = 0; i < goal.length; i++) {
			const gl = goal[i],
				pl = previous[i] ?? ''

			if (gl === pl) result += pl
			else break
		}

		const diff = Math.max(goal.length - result.length, 0)
		if (diff > 0 && this.options.space !== '')
			result = result.padEnd(diff, ' ')

		return result
	}
}

export async function glitchWrite(
	string: string,
	htmlElement?: HTMLElement | Element,
	options?: ConstructorOptions | PresetName,
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
