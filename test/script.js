const { wait } = require('./utility.js')
const _ = {
	debounce: require('lodash.debounce'),
}
const { setGlitchedWriter, glitchWrite } = require('../glitchedWriter')

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input'),
	logsEl = document.getElementById('logs')

const displayWriter = setGlitchedWriter(textEl, {
	delayMin: 20,
	delayMax: 80,
	maxGhosts: 0,
	glitches:
		'一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何',
	oneAtATime: true,
	clearStart: true,
	addGlitches: true,
	glitchesFromString: true,
})

wait(1200)
	.then(() => displayWriter.write('my old friend.'))
	.then(() => wait(1200))
	.then(() =>
		glitchWrite(textEl, 'This is only the beginning', { glitches: null }),
	)
	.then(() => wait(1500))
	.then(() => glitchWrite(textEl, 'Please, say something...'))
	.then(() => inputEl.removeAttribute('disabled'))

inputEl.addEventListener(
	'input',
	_.debounce(() => displayWriter.write(inputEl.value), 500, {
		maxWait: 1000,
	}),
)

textEl.addEventListener(
	'glitchWrote',
	e => (logsEl.innerHTML += `<p>${e.detail.text}</p>`),
)
