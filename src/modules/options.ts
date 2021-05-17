// eslint-disable-next-line import/no-extraneous-dependencies
import {
	parseCharset,
	filterDuplicates,
	getRandomFromRange,
	filterHtml,
	getRandom,
} from '../utils'
import { AllCustomOptions, CustomOptions, OptionsFields } from '../types'
import GlitchedWriter from '../index'
import { PresetName, presets } from '../presets'
import Char from './char'

export default class Options {
	private writer: GlitchedWriter
	private options!: AllCustomOptions

	glyphs!: string
	charset!: string[]
	space!: string
	oneAtATime!: OptionsFields['oneAtATime']
	maxGhosts!: number

	constructor(
		writer: GlitchedWriter,
		options?: CustomOptions | PresetName | null,
	) {
		this.writer = writer
		this.set(options)
	}

	set(options?: CustomOptions | PresetName | null) {
		this.options = {
			...presets.default,
			...this.parseOptions(options),
		}
		this.updateInternal()
	}

	extend(options?: CustomOptions | PresetName | null) {
		this.options = {
			...this.options,
			...this.parseOptions(options),
		}
		this.updateInternal()
	}

	parseOptions(options?: CustomOptions | PresetName | null): CustomOptions {
		if (!options) return {}
		if (typeof options === 'string') return presets[options] ?? {}
		return options
	}

	private updateInternal() {
		const { options } = this

		this.glyphs = parseCharset(options.glyphs)
		this.setCharset()

		this.space = options.fillSpace ? ' ' : ''

		if (Number.isInteger(options.oneAtATime))
			this.oneAtATime = options.oneAtATime as number
		else if (options.oneAtATime === 'word') this.oneAtATime = 'word'
		else this.oneAtATime = options.oneAtATime ? 1 : 0
	}

	setCharset() {
		const { writer } = this
		let { glyphs } = this

		if (this.glyphsFromText)
			glyphs += filterDuplicates(
				writer.previousString +
					(this.html ? filterHtml(writer.goalText) : writer.goalText),
			)

		this.charset = [...glyphs].filter(
			l => !['\t', '\n', '\r', '\f', '\v'].includes(l),
		)

		this.setMaxGhosts()
	}

	setMaxGhosts(): void {
		const {
			writer: { charTable },
			options: { maxGhosts },
		} = this
		if (Number.isInteger(maxGhosts)) this.maxGhosts = maxGhosts

		const { length } = charTable.filter(char => char.specialType !== 'tag')

		this.maxGhosts = Math.round((length || 20) * maxGhosts)
	}

	getGlyph(char: Char): string {
		const { options } = this

		return options.genGlyph
			? options.genGlyph(char, this.baseGetGlyph)
			: this.baseGetGlyph()
	}
	private baseGetGlyph(): string {
		return getRandom(this.charset) ?? ''
	}

	get steps(): number {
		return getRandomFromRange(this.options.steps)
	}
	get interval(): number {
		return getRandomFromRange(this.options.interval)
	}

	getDelay(char: Char): number {
		const { options } = this
		return options.genDelay
			? options.genDelay(char, this.baseGetDelay)
			: this.baseGetDelay()
	}
	private baseGetDelay(): number {
		return getRandomFromRange(this.options.delay)
	}

	get mode() {
		return this.options.mode
	}

	get html() {
		return this.options.html
	}
	get endless() {
		return this.options.endless
	}
	get fps() {
		return this.options.fps
	}

	get letterize() {
		return this.options.letterize
	}

	get ghostChance() {
		return this.options.ghostChance
	}

	get changeChance() {
		return this.options.changeChance
	}

	get glyphsFromText() {
		return this.options.glyphsFromText
	}
}
