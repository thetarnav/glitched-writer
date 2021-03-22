import { ConstructorOptions, RangeOrNumber } from './types'

export const glyphs = {
	nier:
		'一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何',
	full:
		'ABCDĐEFGHIJKLMNOPQRSTUVWXYZabcdđefghijklmnopqrstuvwxyzĄąĆćŻżŹźŃńóŁłАБВГҐДЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрстћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈέΉίϊΐΊόΌύΰϋΎΫΏĂÂÊÔƠƯăâêôơư一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何ĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/\\&<-+÷×=>$€£¥¢:;,.*•°·…±†‡æ«»¦¯—–~˜¨_øÞ¿▬▭▮▯┐└╛░▒▓○‼⁇⁈⁉‽ℴℵℶℷℸℲ℮ℯ⅁⅂⅃⅄₠₡₢₣₤₥₦₧₨₩₪₫€₭₮₯₰₱₲₳₴₵₶₷₸₹₺₻₼₽₾₿          ',
	letterlike:
		'ABCDĐEFGHIJKLMNOPQRSTUVWXYZabcdđefghijklmnopqrstuvwxyzĄąĆćŻżŹźŃńóŁłАБВГҐДЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрстћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈέΉίϊΐΊόΌύΰϋΎΫΏĂÂÊÔƠƯăâêôơưĂÂÊÔƠƯăâêôơư1234567890',
	zalgo: '̴̵̶̷̸̡̢̧̨̛̖̗̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼͇͈͉͍͎̀́̂̃̄̅̆̇̈̉̊̋̌̍̎̏̐̑̒̓̔̽̾̿̀́͂̓̈́͆͊͋͌̕̚ͅ ͓͔͕͖͙͚͐͑͒͗͛ͣͤͥͦͧͨͩͪͫͬͭͮͯ͘͜͟͢͝͞͠͡͏҉',
}

export const presets = {
	default: {
		steps: [1, 8] as RangeOrNumber,
		interval: [60, 170] as RangeOrNumber,
		initialDelay: [0, 2000] as RangeOrNumber,
		changeChance: 0.6 as RangeOrNumber,
		ghostChance: 0.2 as RangeOrNumber,
		maxGhosts: 0.2,
		glyphs: glyphs.full + glyphs.zalgo,
		glyphsFromString: false,
		oneAtATime: false,
		html: false,
		fillSpace: true,
		startFrom: 'matching' as 'matching' | 'previous' | 'erase',
	},
	nier: {
		interval: [10, 20],
		initialDelay: [0, 0],
		steps: [1, 3],
		changeChance: 1,
		maxGhosts: 0,
		glyphs: glyphs.nier,
		oneAtATime: true,
		startFrom: 'erase',
		glyphsFromString: true,
	} as ConstructorOptions,
	typewriter: {
		interval: [40, 100],
		initialDelay: [0, 0],
		steps: [0, 1],
		changeChance: 1,
		maxGhosts: 0,
		glyphs: '',
		glyphsFromString: true,
		oneAtATime: true,
		startFrom: 'erase',
	} as ConstructorOptions,
	terminal: {
		interval: 50,
		initialDelay: [0, 0],
		steps: 0,
		changeChance: 1,
		maxGhosts: 0,
		glyphs: '',
		oneAtATime: true,
		startFrom: 'erase',
	} as ConstructorOptions,
	zalgo: {
		initialDelay: [0, 3000],
		interval: [10, 35],
		steps: [0, 42],
		maxGhosts: 4.5,
		changeChance: 0.2,
		ghostChance: 0.6,
		glyphs: glyphs.zalgo,
		glyphsFromString: true,
		fillSpace: false,
	} as ConstructorOptions,
}

export type PresetName = keyof typeof presets
