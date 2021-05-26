/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import debounce from 'lodash.debounce'

import GlitchedWriter, { wait, presets, glyphs, CustomOptions } from '../src'
import { clamp } from '../src/utils'
// import GlitchedWriter, { wait, presets } from '../lib/esm'

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input') as HTMLInputElement,
	logsEl = document.getElementById('logs')

const pToVal = (p: number, zero: number, hundred: number): number =>
	p * (hundred - zero) + zero

const genGlyph: CustomOptions['genGlyph'] = (char, base) => {
		const { stepsLeft: n, gl } = char
		let l = '_'
		if (n < 2 && gl !== '') l = base()
		else if (n < 5) l = '/'
		return l
	},
	genDelay: CustomOptions['genDelay'] = char => {
		const { index } = char
		return index * 40
	},
	genInterval: CustomOptions['genInterval'] = (char, base) => {
		let n = base() * 1.5
		n = pToVal(char.stepsLeft / 8, 20, 120)
		return n
	}

const writer = new GlitchedWriter(
	'#glitch_this',
	// { ...presets.encrypted, html: true },
	{
		...presets.neo,
		glyphs: glyphs.lowercase + glyphs.numbers,
		steps: [3, 8],
		fillSpace: false,
		html: true,
		letterize: true,
		genGlyph,
		genDelay,
		genInterval,
	},
	// { html: true, letterize: true },
	// 'encrypted',
	// (string, data) => {
	// 	const { done, todo, percent } = data.writer.state.progress
	// 	console.log(`${done}/${todo} - ${Math.round(percent * 100)}`)
	// },
	afterFinish,
)

writer.addCallback('start', string => {
	console.log('Started Writing...', string)
})
;(async function () {
	// await wait(800)
	// await writer.write('<b>MY PASSWORD</b>')
	// await wait(1000)
	// writer.options.endless = true
	// writer.write('<b>MY PASSWORD</b>')
	// await wait(1500)
	// writer.options.endless = false
	// await writer.write('<b>This is</b> the\n<strong>MONEY</strong>: &#163;')
	// await wait(1200)
	// await writer.write('my old friend.')
	// // await writer.write('Please,\n<i>say something</i>...')
	// await wait(1500)
	// await writer.write('Please, say something')
	// // await writer.write('<u>my old</u> friend.')
	// inputEl.removeAttribute('disabled')
})()

// console.log(writer)

// // eslint-disable-next-line func-names
// ;(async function () {
// 	await wait(1200)
// 	// await writer.write('This is the only the only the begining')
// 	// await writer.write('Something farely long')
// 	await writer.write(
// 		'<b>This is</b> the\n<strong>MONEY</strong>: &#163; + <br/>',
// 	)
// 	await wait(1200)
// 	// await writer.write('my old friend.')
// 	// await writer.write('Short String')
// 	await writer.write('')
// 	await wait(1500)
// 	// await writer.write('Please, say something')
// 	await writer.write('<u>my old</u> friend.')
// 	inputEl.removeAttribute('disabled')
// })()

// let queueIndex = 0
const queue = [
	'This is the only &#163; the <strong>only</strong> the begining',
	'Something farely long',
	'Something super mega long, omg!!',
	'<b>This is</b> the\n<strong>MONEY</strong>: &#163;',
	"Roget's 21st Century Thesaurus, Third Edition Copyright © 2013 by the Philip Lief Group.",
	'Short String',
	'Please,\n<i>say &colon; something</i>...',
]
// writer.write(queue[0])
async function afterFinish(string, data) {
	// const { done, todo, percent } = data.writer.state.progress
	// console.log(`${done}/${todo} - ${Math.round(percent * 100)}`)
	console.log('FINISHED', string)

	// await wait(1000)
	// queueIndex++
	// if (queueIndex >= queue.length) queueIndex = 0
	// writer.write(queue[queueIndex])
}

// writer.queueWrite('.writer-texts', 1000, true)
writer.queueWrite(queue, 1000, true)

inputEl.addEventListener(
	'input',
	debounce(() => {
		writer.write(inputEl.value)
	}, 500),
)

// textEl.addEventListener(
// 	'gw-finished',
// 	e => (logsEl.innerHTML += `<p>${(e as any).detail.string}</p>`),
// )

const pause = (() => {
	let paused = false
	return () => {
		paused = !paused
		paused ? writer.pause() : writer.play()
	}
})()

window.addEventListener('keypress', e => {
	e.code === 'Space' && pause()
})

// function logString({ string }: WriterDataResponse) {
// 	logsEl.innerHTML += `<p>${string}</p>`
// }
