// eslint-disable-next-line import/no-extraneous-dependencies
import {
	parseCharset,
	filterDuplicates,
	getRandomFromRange,
	filterHtml,
	getRandom,
} from './utils'
import { ConstructorOptions, OptionsFields, RangeOrNumber } from './types'
import GlitchedWriter from './index'
import { presets } from './presets'

export default class Options implements OptionsFields {
	steps: RangeOrNumber
	interval: RangeOrNumber
	initialDelay: RangeOrNumber
	changeChance: number
	ghostChance: number
	maxGhosts: number
	glyphsFromString: boolean
	oneAtATime: boolean
	html: boolean
	letterize: boolean
	endless: boolean
	startFrom: 'matching' | 'previous' | 'erase'

	space!: string
	private ghostCharset!: string[]
	private glyphsString!: string
	private writer: GlitchedWriter

	constructor(writer: GlitchedWriter, options: ConstructorOptions) {
		this.steps = options.steps ?? presets.default.steps
		this.interval = options.interval ?? presets.default.interval
		this.initialDelay = options.initialDelay ?? presets.default.initialDelay
		this.changeChance = options.changeChance ?? presets.default.changeChance
		this.ghostChance = options.ghostChance ?? presets.default.ghostChance
		this.maxGhosts = options.maxGhosts ?? presets.default.maxGhosts
		this.glyphs = options.glyphs ?? presets.default.glyphs
		this.glyphsFromString =
			options.glyphsFromString ?? presets.default.glyphsFromString
		this.oneAtATime = options.oneAtATime ?? presets.default.oneAtATime
		this.html = options.html ?? presets.default.html
		this.letterize = options.letterize ?? presets.default.letterize
		if (typeof document === 'undefined') this.letterize = false
		this.endless = options.endless ?? presets.default.endless
		this.startFrom = options.startFrom ?? presets.default.startFrom

		this.writer = writer
		this.fillSpace = options.fillSpace ?? presets.default.fillSpace
	}

	set glyphs(glyphs: string | string[] | Set<string>) {
		this.glyphsString = parseCharset(glyphs)
		this.setCharset()
	}

	set fillSpace(doFillSpace: boolean) {
		this.space = doFillSpace ? ' ' : ''
	}

	get stepsLeft(): number {
		return getRandomFromRange(this.steps)
	}
	get genInterval(): number {
		return getRandomFromRange(this.interval)
	}
	get genInitDelay(): number {
		return getRandomFromRange(this.initialDelay)
	}
	get genMaxGhosts(): number {
		if (Number.isInteger(this.maxGhosts)) return this.maxGhosts

		let length: number
		if (this.writer.options.html)
			length = filterHtml(this.writer.goalString).length
		else length = this.writer.goalString.length

		return Math.round((length || 20) * this.maxGhosts)
	}
	get ghost(): string {
		return getRandom(this.ghostCharset) ?? ''
	}

	setCharset() {
		let charset = this.glyphsString

		if (this.glyphsFromString)
			charset += filterDuplicates(
				this.writer.previousString +
					(this.writer.options.html
						? filterHtml(this.writer.goalString)
						: this.writer.goalString),
			)

		this.ghostCharset = [...charset].filter(
			l => !['\t', '\n', '\r', '\f', '\v'].includes(l),
		)
	}
}
