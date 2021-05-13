/* eslint-disable no-unused-vars */
import GlitchedWriter from '..'
import {
	arrayOfTheSame,
	htmlToArray,
	LetterItem,
	stringToLetterItems,
} from '../utils'

export default function setupCharTable(this: GlitchedWriter) {
	this.options.startFrom === 'matching'
		? createMatchingCharTable.call(this)
		: createPreviousCharTable.call(this)
}

function createMatchingCharTable(this: GlitchedWriter): void {
	const { previousString: previous } = this,
		maxDist = Math.min(Math.ceil(this.options.genMaxGhosts / 2), 5),
		goalStringArray = getGoalStringArray.call(this)

	let pi = -1
	goalStringArray.forEach((gl, gi) => {
		pi++

		if (gl.type === 'tag') {
			pi--
			this.setChar(gi, '', gl)
			return
		}

		const fi = gl.value !== '' ? previous.indexOf(gl.value, pi) : -1

		if (fi !== -1 && fi - pi <= maxDist) {
			const appendedText = previous.substring(pi, fi)
			this.setChar(gi, gl.value, gl, appendedText)
			pi = fi
		} else this.setChar(gi, previous[pi], gl)
	})

	this.removeExtraChars(goalStringArray.length)
}

function createPreviousCharTable(this: GlitchedWriter): void {
	const { previousString: previous } = this,
		goalStringArray = getGoalStringArray.call(this)

	let pi = -1
	goalStringArray.forEach((gl, gi) => {
		pi++

		if (gl.type === 'tag') {
			pi--
			this.setChar(gi, '', gl)
			return
		}

		this.setChar(gi, previous[pi], gl)
	})

	this.removeExtraChars(goalStringArray.length)
}

function getGoalStringArray(this: GlitchedWriter): LetterItem[] {
	const { options, previousString, goalText } = this,
		goalArray = options.html
			? htmlToArray(goalText)
			: stringToLetterItems(goalText),
		diff = Math.max(0, previousString.length - goalArray.length)

	if (this.options.oneAtATime)
		return goalArray.concat(stringToLetterItems(arrayOfTheSame('', diff)))

	const nBefore = Math.ceil(diff / 2),
		nAfter = Math.floor(diff / 2)

	return stringToLetterItems(arrayOfTheSame('', nBefore)).concat(
		goalArray,
		stringToLetterItems(arrayOfTheSame('', nAfter)),
	)
}
