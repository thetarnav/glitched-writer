/* eslint-disable no-unused-vars */
import GlitchedWriter from '..'
import Char from '../modules/char'
import {
	arrayOfTheSame,
	htmlToArray,
	LetterItem,
	stringToLetterItems as textToLetterItems,
} from '../utils'

export default function setupCharTable(this: GlitchedWriter) {
	const { charTable, options } = this

	// For "clear" mode char table will be prepared as starting from blank
	const from =
		options.mode === 'clear' && this.state.finished ? '' : this.previousString

	// Clear Char Table -> stop all chars and remove them from char table
	charTable.forEach(char => (char.stop = true))
	this.charTable = []

	options.mode === 'matching'
		? createMatching.call(this, from)
		: createPrevious.call(this, from)
}

function createMatching(this: GlitchedWriter, from: string): void {
	const maxDist = Math.min(Math.ceil(this.options.maxGhosts / 2), 5),
		goalTextArray = getGoalStringText.call(this, from)

	let pi = -1
	goalTextArray.forEach((gl, gi) => {
		pi++

		if (gl.type === 'tag') {
			pi--
			setChar.call(this, gi, '', gl)
			return
		}

		const fi = gl.value !== '' ? from.indexOf(gl.value, pi) : -1

		if (fi !== -1 && fi - pi <= maxDist) {
			const ghosts = from.substring(pi, fi)
			setChar.call(this, gi, gl.value, gl, ghosts)
			pi = fi
		} else setChar.call(this, gi, from[pi], gl)
	})

	removeExtraChars(this.charTable, goalTextArray.length)
}

function createPrevious(this: GlitchedWriter, from: string): void {
	const goalStringText = getGoalStringText.call(this, from)

	let pi = -1
	goalStringText.forEach((gl, gi) => {
		pi++

		if (gl.type === 'tag') {
			pi--
			setChar.call(this, gi, '', gl)
			return
		}

		setChar.call(this, gi, from[pi], gl)
	})

	removeExtraChars(this.charTable, goalStringText.length)
}

function getGoalStringText(this: GlitchedWriter, from: string): LetterItem[] {
	const { options, goalText } = this,
		goalArray = options.html
			? htmlToArray(goalText)
			: textToLetterItems(goalText),
		diff = Math.max(0, from.length - goalArray.length)

	if (options.oneAtATime)
		return goalArray.concat(textToLetterItems(arrayOfTheSame('', diff)))

	const nBefore = Math.ceil(diff / 2),
		nAfter = Math.floor(diff / 2)

	return textToLetterItems(arrayOfTheSame('', nBefore)).concat(
		goalArray,
		textToLetterItems(arrayOfTheSame('', nAfter)),
	)
}

function setChar(
	this: GlitchedWriter,
	i: number,
	l: string,
	gl: LetterItem,
	ghosts?: string,
) {
	const { charTable, options } = this

	charTable.push(
		new Char(this, l ?? '', gl.value || options.space, ghosts, gl.type, i),
	)
}

function removeExtraChars(charTable: Char[], from: number) {
	charTable.splice(from, charTable.length - from)
}
