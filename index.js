const random = (min, max, mathFunc = null) => {
	const w = Math.random() * (max - min) + min
	return mathFunc == null ? w : Math[mathFunc](w)
}

class GlitchedWriter {
	static defaults = {
		state: {
			stop: false,
			typing: false,
			restart: false,
		},
		settings: {
			stepsMin: 0,
			stepsMax: 6,
			delayMin: 140,
			delayMax: 400,
			ghostLettersProbability: 0.1,
			maxGhostLetters: 7,
		},
		glitches:
			'ABCDĐEFGHIJKLMNOPQRSTUVWXYZabcdđefghijklmnopqrstuvwxyzĄąĆćŻżŹźŃńóŁłАБВГҐДЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрстћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈέΉίϊΐΊόΌύΰϋΎΫΏĂÂÊÔƠƯăâêôơư一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何ĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/&<-+÷×=>$€£¥¢:;,.* •°·…±†‡æ«»¦¯—–~˜¨_øÞ¿▬▭▮▯┐└╛╟╚╔╘╒╓┘┌░▒▓○‼',
	}

	constructor(htmlElement, string, glitchCharacters, settings) {
		const {
			state: defState,
			settings: defSettings,
			glitches: defGlitches,
		} = GlitchedWriter.defaults

		this.state = defState
		this.glitches = glitchCharacters || defGlitches
		this.settings = settings || defSettings
		this.el = htmlElement
		this.text = string
		this.endEvent = new CustomEvent('glitchWrote', { detail: this })

		string !== undefined && this.write(string)
	}

	write(text, glitches = this.glitches, settings = this.settings) {
		this.text = text
		if (this.state.typing) {
			this.stop(true)			
			return Promise.resolve({
				finished: false,
				restarting: this.state.restart,
				element: this.el,
				text: this.text,
				description: `${this.el.outerHTML} is typing: "${this.text}"`,
				textTable: this.textTable,
			})
		}
		this.state.stop = false
		return this.accualWrite(glitches, settings)
	}

	stop(restart) {
		this.state.restart = Boolean(restart)
		if (this.state.stop) return false
		this.state.stop = true
	}

	async accualWrite(glitches, settings) {
		const { text, el, state } = this,
			after = [...text] || [' '],
			{
				stepsMin,
				stepsMax,
				delayMin,
				delayMax,
				ghostLettersProbability: ghostProb,
			} = settings,
			randomSteps = () => random(stepsMin, stepsMax, 'floor')

		let { maxGhostLetters: maxGhosts } = settings

		this.textTable = (
			this.textTable ||
			[...el.textContent]
				.filter(l => l !== '\n')
				.map(l => ({
					l,
					ghosts: '',
				}))
		).map(char => ({
			...char,
			steps: randomSteps(),
		}))

		const { textTable } = this

		state.typing = true
		el.classList.add('glitch-writing')

		textTable.forEach((char, i) => (textTable[i].steps = randomSteps()))

		const getTextToRender = () =>
			textTable.reduce((total, { l, ghosts }) => (total += l + ghosts), ''),
		renderText = () => {
				const output = getTextToRender()
				el.textContent = output
				el.setAttribute('data-decrypted-text', output)
			},
			getClitchChar = () => glitches[random(0, glitches.length, 'floor')],
			lastMatching = after.reduce((last, l, i) => {
				if (i >= textTable.length) return last
				return last === i - 1 &&
					l.toLowerCase() === textTable[i].l.toLowerCase()
					? i
					: last
			}, -1)

		while (textTable.length < after.length)
			textTable.splice(
				random(lastMatching + 1, textTable.length, 'floor'),
				0,
				{
					l: '',
					steps: randomSteps(),
					ghosts: '',
				},
			)
		while (textTable.length > after.length)
			after.splice(random(lastMatching + 1, after.length, 'floor'), 0, '')

		const promiseList = after.map((l, i) => handleLetter(i, l))

		const results = (await Promise.all(promiseList))

		let result = results.every(r => r)

		const restarting = state.restart
		state.restart = false
		state.typing = false
		el.classList.remove('glitch-writing')

		result = {
			finished: result,
			restarting,
			element: this.el,
			text,
			description: `${this.el.outerHTML} types: "${text}"`,
			textTable: this.textTable,
		}

		result.finished && el.dispatchEvent(this.endEvent)
		return (result.finished || !restarting) && this.text === getTextToRender()
			? result
			: this.write(this.text, glitches, settings)

		function handleLetter(i, newL) {
			return new Promise(resolve => {
				const char = textTable[i]
				loop()

				function loop() {
					if (state.stop) {
						resolve(false)
						return
					}
					setTimeout(() => {
						char.steps--

						char.l =
							char.steps <= 0 || char.l === newL ? newL : getClitchChar()

						if (char.l === newL && char.ghosts !== '')
							char.ghosts = char.ghosts.slice(0, -1)
						else if (maxGhosts > 0 && Math.random() < ghostProb) {
							char.ghosts += getClitchChar()
							maxGhosts--
						}

						renderText()
						if (char.l === newL && char.ghosts === '') {
							char.steps = 0
							resolve(true)
							return
						}
						loop()
					}, random(delayMin, delayMax))
				}
			})
		}
	}
}

const glitchWrite = (htmlElement, string, glitchCharacters, settings) => {
	const writer = new GlitchedWriter(
		htmlElement,
		glitchCharacters,
		settings,
	)
	return writer.write(string)
}
	

module.exports = { GlitchedWriter, glitchWrite }
