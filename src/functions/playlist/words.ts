import GlitchedWriter from '../..'
import Char from '../../modules/char'
import { promiseWhile, wordsRgx } from '../../utils'

/**
 * ONE WORD AT A TIME
 */
export default function prepWordsPlaylist(
	this: GlitchedWriter,
	playList: Promise<boolean>[],
) {
	const { charTable, state } = this

	// indexes of chars in chartable that are normal letters
	const indexes: number[] = []
	let wordArray: RegExpMatchArray | null

	/**
	 * Scope for separating words
	 */
	{
		const filteredTable = charTable.filter((char, i) => {
				if (
					char.specialType === 'tag' ||
					char.specialType === 'html_entity'
				)
					return false
				indexes.push(i)
				return true
			}),
			// I want to only find words in the normal text
			text = filteredTable.map(char => char.gl).join('')
		wordArray = text.match(wordsRgx)
	}

	/**
	 * Scope for greating groups
	 */
	const charGroups: Char[][] = []
	{
		// set of index variables
		// fi - index of (not) filtered chars
		// gi - index of all chars
		// sgi - steady gi - for detecting when gi grows more than 1
		let fi = -1,
			ai = -1,
			sgi = -1
		const lastGroup = () => charGroups[charGroups.length - 1]

		wordArray?.forEach(word => {
			charGroups.push([])
			;[...word].forEach(() => {
				fi++
				ai = indexes[fi]
				sgi++

				// handling filtered chars before current char
				if (sgi !== ai) {
					for (let i = sgi; i < ai; i++) {
						lastGroup().push(charTable[i])
					}
					sgi = ai
				}

				lastGroup().push(charTable[ai])
			})
		})

		// Adds the rest of the chartable chars
		if (!charGroups.length) charGroups.push([])
		for (let i = ai + 1; i < charTable.length; i++) {
			lastGroup().push(charTable[i])
		}
	}

	// so i can use .pop() and get the first group
	charGroups.reverse()

	let lastResult: boolean = true,
		ended = false

	const loop = async (): Promise<any> => {
		const group = charGroups.pop()
		if (!group) return (ended = true)

		const groupPromises = group.map(char => char.type())
		lastResult =
			(await Promise.all(groupPromises)).every(result => result) ?? false
	}

	const executor = async () => {
		await promiseWhile(() => !ended && lastResult && !state.isPaused, loop)
		return ended && lastResult && !state.isPaused
	}
	playList.push(executor())
}
