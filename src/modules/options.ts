// eslint-disable-next-line import/no-extraneous-dependencies
import {
	parseCharset,
	filterDuplicates,
	getRandomFromRange,
	filterHtml,
	getRandom,
} from '../utils'
import { ConstructorOptions, OptionsFields, RangeOrNumber } from '../types'
import GlitchedWriter from '../index'
import { presets } from '../presets'

export default class Options implements OptionsFields {
	steps: RangeOrNumber
	interval: RangeOrNumber
	delay: RangeOrNumber
	changeChance: number
	ghostChance: number
	maxGhosts: number
	oneAtATime: OptionsFields['oneAtATime']
	glyphsFromText: boolean
	mode: OptionsFields['mode']
	html: boolean
	letterize: boolean
	endless: boolean
	fps: number

	space!: string
	private ghostCharset!: string[]
	private glyphsString!: string
	private writer: GlitchedWriter

	constructor(writer: GlitchedWriter, options: ConstructorOptions) {
		this.steps = options.steps ?? presets.default.steps
		this.interval = options.interval ?? presets.default.interval
		this.delay = options.delay ?? presets.default.delay
		this.changeChance = options.changeChance ?? presets.default.changeChance
		this.ghostChance = options.ghostChance ?? presets.default.ghostChance
		this.maxGhosts = options.maxGhosts ?? presets.default.maxGhosts
		this.glyphs = options.glyphs ?? presets.default.glyphs
		this.glyphsFromText =
			options.glyphsFromText ?? presets.default.glyphsFromText

		if (Number.isInteger(options.oneAtATime))
			this.oneAtATime = options.oneAtATime as number
		else if (options.oneAtATime === 'word') this.oneAtATime = 'word'
		else this.oneAtATime = options.oneAtATime ? 1 : 0

		this.html = options.html ?? presets.default.html
		this.letterize = options.letterize ?? presets.default.letterize
		if (typeof document === 'undefined') this.letterize = false
		this.endless = options.endless ?? presets.default.endless
		this.mode = options.mode ?? presets.default.mode
		this.fps = options.fps ?? presets.default.fps

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
	get genDelay(): number {
		return getRandomFromRange(this.delay)
	}
	get genMaxGhosts(): number {
		if (Number.isInteger(this.maxGhosts)) return this.maxGhosts

		let length: number
		if (this.writer.options.html)
			length = filterHtml(this.writer.goalText).length
		else length = this.writer.goalText.length

		return Math.round((length || 20) * this.maxGhosts)
	}
	get ghost(): string {
		return getRandom(this.ghostCharset) ?? ''
	}

	setCharset() {
		let charset = this.glyphsString

		if (this.glyphsFromText)
			charset += filterDuplicates(
				this.writer.previousString +
					(this.writer.options.html
						? filterHtml(this.writer.goalText)
						: this.writer.goalText),
			)

		this.ghostCharset = [...charset].filter(
			l => !['\t', '\n', '\r', '\f', '\v'].includes(l),
		)
	}
}