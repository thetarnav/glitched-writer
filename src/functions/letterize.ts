/* eslint-disable no-unused-vars */
import GlitchedWriter from '..'

export default function letterize(this: GlitchedWriter) {
	if (!this.options.letterize) return

	const html: string = this.charTable
		.map(({ specialType, gl }) =>
			specialType === 'tag' ? gl : '<span class="gw-char"></span>',
		)
		.join('')
	this.htmlElement.innerHTML = html

	const spans = this.htmlElement.querySelectorAll(
		'span.gw-char',
	) as NodeListOf<HTMLSpanElement>

	let i = 0
	this.charTable.forEach(char => {
		if (char.specialType === 'tag') return
		char.spanElement = spans[i]
		i++
	})
}
