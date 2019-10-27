const putEasing = p => p * p * p

const random = (min, max, mathFunc = null, easing = false) => {
	let p = Math.random()
	p = easing ? putEasing(p) : p
	const w = p * (max - min) + min
	return mathFunc == null ? w : Math[mathFunc](w)
}

const stringWithoutRepeat = string =>
	[...new Set([...string])].reduce((set, l) => set + l)

class GlitchedWriter {
	static state = {
		stop: false,
		typing: false,
		restart: false,
	}
	static settings = {
		steps: [0, 6],
		delay: [140, 400],
		firstDelay: [0, 1700],
		ghostsProbability: 0.1,
		maxGhosts: 7,
		glitches:
			'ABCDĐEFGHIJKLMNOPQRSTUVWXYZabcdđefghijklmnopqrstuvwxyzĄąĆćŻżŹźŃńóŁłАБВГҐДЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрстћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈέΉίϊΐΊόΌύΰϋΎΫΏĂÂÊÔƠƯăâêôơư一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何ĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/&<-+÷×=>$€£¥¢:;,.* •°·…±†‡æ«»¦¯—–~˜¨_øÞ¿▬▭▮▯┐└╛╟╚╔╘╒╓┘┌░▒▓○‼',
		glitchesFromString: false,
		oneAtATime: false,
		startText: 'previous',
		instantErase: false,
		combineGlitches: false,
		className: 'glitch-writing',
		leadingChar: {
			char: '',
			onTyping: false,
		},
	}
	static presets = {
		default: { ...this.settings },
		nier: {
			delay: [40, 80],
			firstDelay: [0, 0],
			steps: [3, 7],
			maxGhosts: 0,
			glitches:
				'一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何',
			oneAtATime: true,
			startText: 'eraseWhole',
			instantErase: false,
			combineGlitches: true,
			glitchesFromString: true,
			leadingChar: false,
		},
		normal: {
			delay: [80, 230],
			firstDelay: [0, 0],
			oneAtATime: true,
			maxGhosts: 0,
			startText: 'matchingOnly',
			instantErase: false,
			steps: [0, 0],
			leadingChar: {
				char: '_',
				onTyping: true,
			},
		},
	}

	constructor(htmlElement, settings) {
		this.state = GlitchedWriter.state

		this.settings = {
			...GlitchedWriter.settings,
			...this.getPreset(settings),
			...settings,
		}
		this.prevWrongSettings()
		this.el = htmlElement
		this.text = ''
		this.endEvent = new CustomEvent('glitchWrote', { detail: this })
	}

	write(text, settings) {
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
		settings = {
			...this.settings,
			...this.getPreset(settings),
			...settings,
		}
		this.prevWrongSettings(settings)
		return this.accualWrite(settings)
	}

	getPreset(settings) {
		if (!settings) return {}
		let preset = {}
		switch (settings.preset) {
			case 'default':
				preset = GlitchedWriter.presets.default
				break
			case 'nier':
				preset = GlitchedWriter.presets.nier
				break
			case 'normal':
				preset = GlitchedWriter.presets.normal
				break
			default:
				break
		}
		return preset
	}

	prevWrongSettings = (settings = this.settings) => {
		settings.steps[0] = Math.min(settings.steps[0], settings.steps[1])
		settings.delay[0] = Math.min(settings.delay[0], settings.delay[1])
	}

	stop(restart) {
		this.state.restart = Boolean(restart)
		if (this.state.stop) return false
		this.state.stop = true
	}

	async accualWrite(settings) {
		const { text, el, state } = this,
			after = [...text] || [' '],
			{
				steps,
				delay,
				ghostsProbability: ghostProb,
				className,
				leadingChar,
				instantErase,
				startText,
			} = settings,
			randomSteps = () => random(steps[0], steps[1], 'floor'),
			glitches = settings.glitchesFromString
				? stringWithoutRepeat(
						text +
							el.textContent +
							(settings.combineGlitches ? settings.glitches : ''),
				  )
				: settings.glitches +
				  (settings.combineGlitches ? this.settings.glitches : '')

		let { maxGhosts } = settings

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
		el.classList.add(className)

		textTable.forEach((char, i) => (textTable[i].steps = randomSteps()))

		const getTextToRender = () => {
				const charAtTheEnd = (leadingChar.onTyping
				? state.typing
				: true)
					? leadingChar.char
					: ''
				const stringFromTextTable = textTable.reduce(
					(total, { l, ghosts }) => (total += l + ghosts),
					'',
				)
				return stringFromTextTable + (leadingChar ? charAtTheEnd : '')
			},
			renderText = () => {
				const output = getTextToRender()
				el.textContent = output
				el.setAttribute('data-decrypted-text', output)
			},
			getClitchChar = l =>
				glitches ? glitches[random(0, glitches.length, 'floor')] : l || '',
			lastMatching = after.reduce(
				(last, l, i) =>
					i < textTable.length &&
					last === i - 1 &&
					l.toLowerCase() === textTable[i].l.toLowerCase()
						? i
						: last,
				-1,
			),
			beginSplice = settings.oneAtATime ? textTable.length : lastMatching + 1

		if (
			instantErase &&
			(startText === 'matchingOnly' || startText === 'eraseWhole')
		) {
			const startIndex = startText === 'eraseWhole' ? 0 : lastMatching + 1
			for (let i = startIndex; i < textTable.length; i++) textTable[i].l = ''
			renderText()
		}

		while (textTable.length < after.length)
			textTable.splice(random(beginSplice, textTable.length, 'floor'), 0, {
				l: '',
				steps: randomSteps(),
				ghosts: '',
			})
		while (textTable.length > after.length)
			after.splice(random(beginSplice, after.length, 'floor'), 0, '')

		const results = []

		if (
			!instantErase &&
			(startText === 'matchingOnly' || startText === 'eraseWhole')
		) {
			const from = startText === 'matchingOnly' ? lastMatching : -1
			if (settings.oneAtATime) {
				for (let i = after.length - 1; i > from; i--) {
					results.push(await handleLetter(i, ''))
					textTable[i].steps = randomSteps()
				}
			} else {
				const promiseList = after
					.slice(from + 1)
					.map((l, i) => handleLetter(i, ''))
				results.push(...(await Promise.all(promiseList)))
				textTable.forEach((c, i) => (textTable[i].steps = randomSteps()))
			}
		}
		if (settings.oneAtATime) {
			// eslint-disable-next-line
			for (let i in after) results.push(await handleLetter(i, after[i]))
		} else {
			const promiseList = after.map((l, i) => handleLetter(i, l))
			results.push(...(await Promise.all(promiseList)))
		}

		let result = results.every(r => r)

		const restarting = state.restart
		state.restart = false
		state.typing = false
		el.classList.remove(className)
		renderText()
		// && this.text === getTextToRender()
		if (result && !restarting) {
			result = {
				finished: result,
				restarting,
				element: this.el,
				text,
				description: `${this.el.outerHTML} types: "${text}"`,
				textTable,
			}
			this.textTable = null
			el.dispatchEvent(this.endEvent)
			return result
		}
		return this.write(this.text, settings)

		function handleLetter(i, newL) {
			let [dMin, dMax] = [...delay]
			let [dFirstMin, dFirstMax] = [...settings.firstDelay]
			let isFirst = 1
			if (newL === '') {
				dMin /= 1.5
				dMax /= 1.5
				dFirstMin /= 2
				dFirstMax /= 2
			}

			return new Promise(resolve => {
				const char = textTable[i]
				loop()

				function loop() {
					const timeout =
						random(dMin, dMax) +
						random(dFirstMin, dFirstMax, null, true) * isFirst
					isFirst = 0

					if (char.l === newL && char.ghosts === '') {
						char.steps = 0
						resolve(true)
						return
					}
					if (state.stop) {
						resolve(false)
						return
					}
					setTimeout(() => {
						char.steps--

						char.l =
							char.steps <= 0 || char.l === newL
								? newL
								: getClitchChar(char.l)

						if (char.l === newL && char.ghosts !== '')
							char.ghosts = char.ghosts.slice(0, -1)
						else if (maxGhosts > 0 && Math.random() < ghostProb) {
							char.ghosts += getClitchChar()
							maxGhosts--
						}

						renderText()

						loop()
					}, timeout)
				}
			})
		}
	}
}

const glitchWrite = (htmlElement, string, settings) =>
	new GlitchedWriter(htmlElement, settings).write(string)

const setGlitchedWriter = (htmlElement, settings) =>
	new GlitchedWriter(htmlElement, settings)