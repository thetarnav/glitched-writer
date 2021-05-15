import GlitchedWriter from './index'
import Options from './modules/options'
import State from './modules/state'

export type ModifyInterface<T, R> = Omit<T, keyof R> & R

export type RangeOrNumber = [number, number] | number

export interface OptionsFields {
	steps: RangeOrNumber
	interval: RangeOrNumber
	delay: RangeOrNumber
	changeChance: number
	ghostChance: number
	maxGhosts: number
	oneAtATime: number | 'word'
	glyphsFromText: boolean
	mode: 'matching' | 'normal' | 'erase' | 'clear'
	html: boolean
	letterize: boolean
	endless: boolean
	fps: number
}

export type ConstructorOptions = ModifyInterface<
	Partial<OptionsFields>,
	{
		glyphs?: string | string[] | Set<string>
		fillSpace?: boolean
		oneAtATime?: OptionsFields['oneAtATime'] | boolean
	}
>

export interface HTMLWriterElement extends Element {
	$writer?: GlitchedWriter
}

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
export type Callback = (string: string, writerData: WriterDataResponse) => any
