import GlitchedWriter from '../..'
import { PlayOptions } from '../../types'
import { promiseWhile } from '../../utils'

export default function prepLettersPlaylist(
	this: GlitchedWriter,
	playList: Promise<boolean>[],
	playOptions?: PlayOptions,
) {
	const { charTable, state, options } = this,
		reverse = playOptions?.reverse ?? false,
		charTableCopy = reverse ? [...charTable] : [...charTable].reverse()

	// Char executor - runs a loop, typing one char at a time
	// It is possible to run multiple of them at the same time
	const executor = async () => {
		let lastResult: boolean = true,
			ended = false

		const loop = async () => {
			const lastChar = charTableCopy.pop()
			if (!lastChar) ended = true
			else lastResult = (await lastChar.type()) ?? false
		}

		await promiseWhile(() => !ended && lastResult && !state.isPaused, loop)

		return ended && lastResult && !state.isPaused
	}

	// Add as many executors as needed to the playList
	for (let n = 0; n < options.oneAtATime; n++) {
		playList.push(executor())
	}
}
