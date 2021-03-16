// import { random, filterDuplicates } from './utils'
import Options from './options'
// @ts-ignore
// eslint-disable-next-line import/no-cycle
import Char from './char'

import { ConstructorOptions } from './types'

// eslint-disable-next-line no-unused-vars
type StepCallback = (string: string) => void

// @ts-ignore
export default class GlitchedWriter {
	options: Options = new Options()
	goalString: string | null = null
	charTable: Char[] = []
	stepCallback: StepCallback | null = null

	constructor(options?: ConstructorOptions, stepCallback?: StepCallback) {
		if (options) this.options = new Options(options)
		if (stepCallback) this.stepCallback = stepCallback
	}

	get string(): string {
		return this.charTable.map(char => char.string).join('')
	}

	displayStep(): void {
		console.log('string:', this.string)
		// if (this.stepCallback) this.stepCallback(this.string)
	}

	async write(string: string) {
		this.goalString = string

		const playList: Promise<void>[] = []

		;[...string].forEach(l => {
			const char = new Char('', l, this)
			this.charTable.push(char)
			playList.push(char.play())
		})

		return Promise.all(playList)
	}
}

const exampleWriter = new GlitchedWriter()

exampleWriter.write('Time To Die')
