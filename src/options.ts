import {
	parseCharset,
	randomChild,
	filterDuplicates,
	getRandomFromRange,
} from './utils'
import {
	OptionsFields,
	ConstructorOptions,
	RangeOrNumber,
	AppendedText,
} from './types'
import GlitchedWriter from '.'
import { glyphs, presets, PresetName } from './presets'

export default class Options implements OptionsFields {
	steps: RangeOrNumber
	interval: RangeOrNumber
	initialDelay: RangeOrNumber
	changeChance: RangeOrNumber
	ghostChance: RangeOrNumber
	maxGhosts: number | 'relative'
	glyphs: string
	glyphsFromString: 'previous' | 'goal' | 'both' | 'none'
	ghostCharset: string
	oneAtATime: boolean
	html: boolean
	startFrom: 'matching' | 'previous' | 'erase'
	writer: GlitchedWriter

	constructor(
		writer: GlitchedWriter,
		options?: ConstructorOptions | PresetName,
	) {
		if (typeof options === 'string') options = presets[options]

		options ||= {}

		this.writer = writer
		this.steps = options.steps ?? [1, 6]
		this.interval = options.interval ?? [50, 150]
		this.initialDelay = options.initialDelay ?? [0, 1500]
		this.changeChance = options.changeChance ?? 0.6
		this.ghostChance = options.ghostChance ?? 0.15
		this.maxGhosts = options.maxGhosts ?? 'relative'
		this.glyphs = parseCharset(options.glyphs) ?? glyphs.full + glyphs.zalgo
		this.glyphsFromString = options.glyphsFromString ?? 'none'
		this.ghostCharset = this.glyphs
		this.oneAtATime = options.oneAtATime ?? false
		this.html = options.html ?? false
		this.startFrom = options.startFrom ?? 'matching'
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
	get genChangeChance(): number {
		return getRandomFromRange(this.changeChance, false)
	}
	get genGhostChance(): number {
		return getRandomFromRange(this.ghostChance, false)
	}
	get genMaxGhosts(): number {
		if (this.maxGhosts === 'relative')
			return Math.round((this.writer.goalString?.length || 25) * 0.25)

		return this.maxGhosts
	}
	get genGhost(): string {
		return randomChild(this.ghostCharset) ?? ''
	}

	setCharset() {
		let charset = this.glyphs

		if (this.glyphsFromString !== 'none') {
			const addPrevious = () =>
				(charset += filterDuplicates(this.writer.previousString))
			const addGoal = () =>
				(charset += filterDuplicates(this.writer.goalString))

			if (this.glyphsFromString === 'both') {
				addPrevious()
				addGoal()
			} else if (this.glyphsFromString === 'previous') addPrevious()
			else addGoal()
		}

		this.ghostCharset = charset
	}
}
