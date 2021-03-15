import { parseCharset, random, randomChild } from './utils'
import { ModifyInterface } from './types'

type RangeOrNumber = [number, number] | number

type PresetName = 'nier' | 'typewriter'

type ConstructorOptions = ModifyInterface<
	Options,
	{
		ghostCharset: string | string[] | Set<string>
	}
>

interface AppendedText {
	text: string
	display: 'always' | 'when-typing' | 'when-not-typing'
}

export default class Options {
	steps: RangeOrNumber = [1, 7]
	interval: RangeOrNumber = [100, 320]
	initialDelay: RangeOrNumber = [0, 1700]
	ghostChance: RangeOrNumber = 0.1
	maxGhosts: RangeOrNumber = 7
	ghostCharset: string =
		'ABCDĐEFGHIJKLMNOPQRSTUVWXYZabcdđefghijklmnopqrstuvwxyzĄąĆćŻżŹźŃńóŁłАБВГҐДЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрстћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈέΉίϊΐΊόΌύΰϋΎΫΏĂÂÊÔƠƯăâêôơư一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何ĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/\\&<-+÷×=>$€£¥¢:;,.* •°·…±†‡æ«»¦¯—–~˜¨_øÞ¿▬▭▮▯┐└╛╟╚╔╘╒╓┘┌░▒▓○‼'
	ghostsFromString: 'start' | 'end' | 'both' | false = false
	oneAtATime = false
	startingText: 'matching' | 'previous' | false = 'matching'
	leadingText: AppendedText | false = false
	trailingText: AppendedText | false = false

	constructor(options?: ConstructorOptions | PresetName) {
		if (typeof options === 'object') {
			this.steps = options.steps
			this.interval = options.interval
			this.initialDelay = options.initialDelay
			this.ghostChance = options.ghostChance
			this.maxGhosts = options.maxGhosts
			this.ghostCharset = parseCharset(options.ghostCharset)
			this.ghostsFromString = options.ghostsFromString
			this.oneAtATime = options.oneAtATime
			this.startingText = options.startingText
		}
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
	get genGhostChance(): number {
		return getRandomFromRange(this.ghostChance)
	}
	get genMaxGhosts(): number {
		return getRandomFromRange(this.maxGhosts)
	}
	get genGhost(): string {
		return randomChild(this.ghostCharset)
	}
}

function getRandomFromRange(range: RangeOrNumber): number {
	return typeof range === 'number' ? range : random(...range, 'round')
}
