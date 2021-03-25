type RangeOrNumber = [number, number] | number

interface OptionsFields {
	steps: RangeOrNumber
	interval: RangeOrNumber
	initialDelay: RangeOrNumber
	changeChance: number
	ghostChance: number
	maxGhosts: number
	glyphs: string
	glyphsFromString: boolean
	oneAtATime: boolean
	html: boolean
	letterize: boolean
	startFrom: 'matching' | 'previous' | 'erase'
}
