import GlitchedWriter from '.'
import Options from './options'
import State from './state'

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
	glyphs: string
	glyphsFromString: 'previous' | 'goal' | 'both' | 'none'
	oneAtATime: boolean
	html: boolean
	startFrom: 'matching' | 'previous' | 'erase'
	leadingText: AppendedText | undefined
	trailingText: AppendedText | undefined
}

export type ConstructorOptions = ModifyInterface<
	Partial<OptionsFields>,
	{
		glyphs?: string | string[] | Set<string>
	}
>

export interface WriteOptions {
	erase?: boolean
}

export interface PlayOptions {
	reverse?: boolean
}

export interface WriterDataResponse {
	string: string
	writer: GlitchedWriter
	options: Options
	state: State
	status?: 'ERROR' | 'SUCCESS'
	message?: string
	error?: any
}

// eslint-disable-next-line no-unused-vars
export type Callback = (string: string, writerData?: WriterDataResponse) => any
