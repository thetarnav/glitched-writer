/* eslint-disable no-unused-vars */
import GlitchedWriter from '..'
import {
	arrayOfTheSame,
	htmlToArray,
	LetterItem,
	stringToLetterItems,
} from '../utils'

export default function setupCharTable(this: GlitchedWriter) {
	// For "clear" mode char table will be prepared as starting from blank
	const from =
		this.options.mode === 'clear' && this.state.finished
			? ''
			: this.previousString

	this.options.mode === 'matching'
		? createMatchingCharTable.call(this, from)
		: createPreviousCharTable.call(this, from)
}

function createMatchingCharTable(this: GlitchedWriter, from: string): void {
	const maxDist = Math.min(Math.ceil(this.options.maxGhosts / 2), 5),
		goalStringArray = getGoalStringArray.call(this, from)

	let pi = -1
	goalStringArray.forEach((gl, gi) => {
		pi++

		if (gl.type === 'tag') {
			pi--
			this.setChar(gi, '', gl)
			return
		}

		const fi = gl.value !== '' ? from.indexOf(gl.value, pi) : -1

		if (fi !== -1 && fi - pi <= maxDist) {
			const appendedText = from.substring(pi, fi)
			this.setChar(gi, gl.value, gl, appendedText)
			pi = fi
		} else this.setChar(gi, from[pi], gl)
	})

	this.removeExtraChars(goalStringArray.length)
}

function createPreviousCharTable(this: GlitchedWriter, from: string): void {
	const goalStringArray = getGoalStringArray.call(this, from)

	let pi = -1
	goalStringArray.forEach((gl, gi) => {
		pi++

		if (gl.type === 'tag') {
			pi--
			this.setChar(gi, '', gl)
			return
		}

		this.setChar(gi, from[pi], gl)
	})

	this.removeExtraChars(goalStringArray.length)
}

function getGoalStringArray(this: GlitchedWriter, from: string): LetterItem[] {
	const { options, goalText } = this,
		goalArray = options.html
			? htmlToArray(goalText)
			: stringToLetterItems(goalText),
		diff = Math.max(0, from.length - goalArray.length)

	if (this.options.oneAtATime)
		return goalArray.concat(stringToLetterItems(arrayOfTheSame('', diff)))

	const nBefore = Math.ceil(diff / 2),
		nAfter = Math.floor(diff / 2)

	return stringToLetterItems(arrayOfTheSame('', nBefore)).concat(
		goalArray,
		stringToLetterItems(arrayOfTheSame('', nAfter)),
	)
}
