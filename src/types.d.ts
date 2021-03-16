export type ModifyInterface<T, R> = Omit<T, keyof R> & R

export type RangeOrNumber = [number, number] | number

export interface AppendedText {
	value: string
	display: 'always' | 'when-typing' | 'when-not-typing'
}
export interface OptionsFields {
	steps: RangeOrNumber
	interval: RangeOrNumber
	initialDelay: RangeOrNumber
	changeChance: RangeOrNumber
	ghostChance: RangeOrNumber
	maxGhosts: number | 'relative'
	ghostCharset: string
	ghostsFromString: 'start' | 'end' | 'both' | false
	oneAtATime: boolean
	startingText: 'matching' | 'previous' | 'none'
	leadingText: AppendedText | undefined
	trailingText: AppendedText | undefined
}

export type ConstructorOptions = ModifyInterface<
	Partial<OptionsFields>,
	{
		ghostCharset?: string | string[] | Set<string>
	}
>
