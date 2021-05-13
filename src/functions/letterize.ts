/* eslint-disable no-unused-vars */
import GlitchedWriter from '..'

export default function letterize(this: GlitchedWriter) {
	if (!this.options.letterize || !this.htmlElement) return

	const html: string = this.charTable
		.map(({ isTag, gl }) => (isTag ? gl : '<span class="gw-char"></span>'))
		.join('')
	this.htmlElement.innerHTML = html

	const spans = this.htmlElement.querySelectorAll(
		'span.gw-char',
	) as NodeListOf<HTMLSpanElement>

	let i = 0
	this.charTable.forEach(char => {
		if (char.isTag) return
		char.spanElement = spans[i]
		i++
	})
}
