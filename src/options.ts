import { parseCharset, random, randomChild } from './utils'
import {
	OptionsFields,
	ConstructorOptions,
	RangeOrNumber,
	AppendedText,
} from './types'
// eslint-disable-next-line import/no-cycle
import GlitchedWriter from '.'

type PresetName = 'default' | 'nier' | 'typewriter'

const glyphs = {
	basic:
		'ABCĆDEFGHIJKLMNOPQRSŠTUVWXYZŽabcćdefghijklmnopqrsštuvwxyzž1234567890‘?’“!”(%)[#]{@}/&\\<-+÷×=>$€£¥¢:;,.* ',
	full:
		'ABCDĐEFGHIJKLMNOPQRSTUVWXYZabcdđefghijklmnopqrstuvwxyzĄąĆćŻżŹźŃńóŁłАБВГҐДЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрстћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈέΉίϊΐΊόΌύΰϋΎΫΏĂÂÊÔƠƯăâêôơư一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何ĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/\\&<-+÷×=>$€£¥¢:;,.*•°·…±†‡æ«»¦¯—–~˜¨_øÞ¿▬▭▮▯┐└╛╟╚╔╘╒╓┘┌░▒▓○‼          ',
}

const preset: { [key: string]: ConstructorOptions } = {
	nier: {
		interval: [40, 80],
		initialDelay: [0, 0],
		steps: [3, 7],
		maxGhosts: 0,
		ghostCharset:
			'一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何',
		oneAtATime: true,
		// startText: 'eraseWhole',
		// instantErase: false,
		// combineGlitches: true,
		ghostsFromString: 'both',
		// leadingChar: false,
	},
}

export default class Options implements OptionsFields {
	steps: RangeOrNumber = [1, 7]
	interval: RangeOrNumber = [100, 320]
	initialDelay: RangeOrNumber = [0, 1700]
	changeChance: RangeOrNumber = 0.5
	ghostChance: RangeOrNumber = 0.15
	maxGhosts: number | 'relative' = 7
	ghostCharset: string = glyphs.full
	ghostsFromString: 'start' | 'end' | 'both' | false = false
	oneAtATime: boolean = false
	startFrom: 'matching' | 'previous' | 'erase' = 'matching'
	leadingText: AppendedText | undefined = undefined
	trailingText: AppendedText | undefined = undefined
	writer: GlitchedWriter

	constructor(
		writer: GlitchedWriter,
		options?: ConstructorOptions | PresetName,
	) {
		if (typeof options === 'string' || !options)
			options = options ? preset[options] : this

		this.steps = options.steps ?? this.steps
		this.interval = options.interval ?? this.interval
		this.initialDelay = options.initialDelay ?? this.initialDelay
		this.changeChance = options.changeChance ?? this.changeChance
		this.ghostChance = options.ghostChance ?? this.ghostChance
		this.maxGhosts = options.maxGhosts ?? this.maxGhosts
		if (options.ghostCharset)
			this.ghostCharset = parseCharset(options.ghostCharset)
		this.ghostsFromString = options.ghostsFromString ?? this.ghostsFromString
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
		return randomChild(this.ghostCharset)
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
