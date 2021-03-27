import GlitchedWriter from './index'
import Options from './options'
import State from './state'

export type ModifyInterface<T, R> = Omit<T, keyof R> & R

export interface AppendedText {
	value: string
	display: 'always' | 'when-typing' | 'when-not-typing'
}

export type RangeOrNumber = [number, number] | number

export interface OptionsFields {
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
	endless: boolean
	startFrom: 'matching' | 'previous' | 'erase'
}

export type ConstructorOptions = ModifyInterface<
	Partial<OptionsFields>,
	{
		glyphs?: string | string[] | Set<string>
		fillSpace?: boolean
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
