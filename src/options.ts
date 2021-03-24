// eslint-disable-next-line import/no-extraneous-dependencies
import { sample } from 'lodash'
import {
	parseCharset,
	filterDuplicates,
	getRandomFromRange,
	filterHtml,
} from './utils'
import { OptionsFields, ConstructorOptions, RangeOrNumber } from './types'
import GlitchedWriter from '.'
import { presets, PresetName } from './presets'

// const sample = require('lodash.sample')

export default class Options implements OptionsFields {
	steps: RangeOrNumber
	interval: RangeOrNumber
	initialDelay: RangeOrNumber
	changeChance: number
	ghostChance: number
	maxGhosts: number
	glyphs: string
	glyphsFromString: boolean
	ghostCharset: string
	oneAtATime: boolean
	html: boolean
	letterize: boolean
	startFrom: 'matching' | 'previous' | 'erase'
	writer: GlitchedWriter
	space: string

	constructor(
		writer: GlitchedWriter,
		options?: ConstructorOptions | PresetName,
	) {
		if (typeof options === 'string') options = presets[options]

		options ||= {}

		this.steps = options.steps ?? presets.default.steps
		this.interval = options.interval ?? presets.default.interval
		this.initialDelay = options.initialDelay ?? presets.default.initialDelay
		this.changeChance = options.changeChance ?? presets.default.changeChance
		this.ghostChance = options.ghostChance ?? presets.default.ghostChance
		this.maxGhosts = options.maxGhosts ?? presets.default.maxGhosts
		this.glyphs = parseCharset(options.glyphs) ?? presets.default.glyphs
		this.glyphsFromString =
			options.glyphsFromString ?? presets.default.glyphsFromString
		this.ghostCharset = this.glyphs
		this.oneAtATime = options.oneAtATime ?? presets.default.oneAtATime
		this.html = options.html ?? presets.default.html
		this.letterize = options.letterize ?? presets.default.letterize
		if (typeof document === 'undefined') this.letterize = false
		// if (this.letterize) this.html = false
		this.startFrom = options.startFrom ?? presets.default.startFrom

		this.writer = writer
		this.space = options.fillSpace ?? presets.default.fillSpace ? ' ' : ''
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
	get genGhost(): string {
		return sample(this.ghostCharset) ?? ''
	}

	setCharset() {
		let charset = this.glyphs

		if (this.glyphsFromString)
			charset += filterDuplicates(
				this.writer.previousString +
					(this.writer.options.html
						? filterHtml(this.writer.goalString)
						: this.writer.goalString),
			)

		this.ghostCharset = charset
	}
}
