import { parseCharset, random, randomChild, filterDuplicates } from './utils'
import {
	OptionsFields,
	ConstructorOptions,
	RangeOrNumber,
	AppendedText,
} from './types'
import GlitchedWriter from '.'
import { glyphs, presets, PresetName } from './presets'

export default class Options implements OptionsFields {
	steps: RangeOrNumber = [1, 6]
	interval: RangeOrNumber = [50, 150]
	initialDelay: RangeOrNumber = [0, 1500]
	changeChance: RangeOrNumber = 0.6
	ghostChance: RangeOrNumber = 0.15
	maxGhosts: number | 'relative' = 'relative'
	glyphs: string = glyphs.full
	glyphsFromString: 'previous' | 'goal' | 'both' | 'none' = 'none'
	oneAtATime: boolean = false
	startFrom: 'matching' | 'previous' | 'erase' = 'matching'
	leadingText: AppendedText | undefined = undefined
	trailingText: AppendedText | undefined = undefined
	writer: GlitchedWriter

	constructor(
		writer: GlitchedWriter,
		options?: ConstructorOptions | PresetName,
	) {
		if (typeof options === 'string') options = presets[options]

		options ||= {}

		this.steps = options.steps ?? this.steps
		this.interval = options.interval ?? this.interval
		this.initialDelay = options.initialDelay ?? this.initialDelay
		this.changeChance = options.changeChance ?? this.changeChance
		this.ghostChance = options.ghostChance ?? this.ghostChance
		this.maxGhosts = options.maxGhosts ?? this.maxGhosts
		if (options.glyphs !== undefined)
			this.glyphs = parseCharset(options.glyphs)
		this.glyphsFromString = options.glyphsFromString ?? this.glyphsFromString
		this.oneAtATime = options.oneAtATime ?? this.oneAtATime
		this.startFrom = options.startFrom ?? this.startFrom
		this.leadingText = options.leadingText ?? this.leadingText
		this.trailingText = options.trailingText ?? this.trailingText
		this.writer = writer
	}

	get genSteps(): number {
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
		const { maxGhosts: max } = this

		if (max === 'relative')
			return Math.round((this.writer.goalString?.length || 25) * 0.2)

		return max
	}
	get genGhost(): string {
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

		return randomChild(charset) ?? ''
	}

	getAppendedText(witch: 'trailing' | 'leading'): string {
		const text = witch === 'trailing' ? this.trailingText : this.leadingText
		if (!text) return ''
		if (
			text.display === 'always' ||
			(text.display === 'when-typing' && this.writer.state.isTyping) ||
			(text.display === 'when-not-typing' && !this.writer.state.isTyping)
		)
			return text.value
		return ''
	}
}

function getRandomFromRange(
	range: RangeOrNumber,
	round: boolean = true,
): number {
	return typeof range === 'number'
		? range
		: random(...range, round ? 'round' : undefined)
}
