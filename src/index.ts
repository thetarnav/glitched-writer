// import { random, filterDuplicates } from './utils'
import Options from './options'
import State from './state'
// @ts-ignore
// eslint-disable-next-line import/no-cycle
import Char from './char'

import { ConstructorOptions } from './types'

// eslint-disable-next-line no-unused-vars
type StepCallback = (string: string) => void

// @ts-ignore
export default class GlitchedWriter {
	options: Options = new Options()
	state: State
	charTable: Char[] = []
	goalString: string | null = null
	stepCallback: StepCallback | null = null

	constructor(options?: ConstructorOptions, stepCallback?: StepCallback) {
		if (options) this.options = new Options(options)
		if (stepCallback) this.stepCallback = stepCallback
		this.state = new State()
	}

	get string(): string {
		return this.charTable.map(char => char.string).join('')
	}

	emitStep(): void {
		console.log('string:', this.string)
		if (this.stepCallback) this.stepCallback(this.string)
	}

	async write(string: string) {
		this.goalString = string
		this.charTable = []
		;[...string].forEach(l => this.charTable.push(new Char('', l, this)))

		this.pause()
		return this.play()
	}

	async play() {
		const playList: Promise<boolean>[] = [],
			{ goalString, charTable } = this

		if (!goalString || this.state.isTyping) return false

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

const exampleWriter = new GlitchedWriter()

exampleWriter.write('Time To Die').then(res => console.log('Time to die', res))

setTimeout(() => {
	exampleWriter.pause()
}, 1000)

setTimeout(() => {
	exampleWriter.play().then(res => console.log('play', res))
}, 2300)
