/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import debounce from 'lodash.debounce'

import GlitchedWriter, { wait, presets } from '../src'
// import GlitchedWriter, { wait, presets } from '../lib/esm'

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input') as HTMLInputElement,
	logsEl = document.getElementById('logs')

const writer = new GlitchedWriter(
	'#glitch_this',
	// { ...presets.encrypted, html: true },
	{ startFrom: 'erase', html: true },
	// 'encrypted',
	// string => console.log(string),
	undefined,
	afterFinish,
)

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
// 	await writer.write('<b>This is</b> the\n<strong>MONEY</strong>: &#163;')
// 	await wait(1200)
// 	// await writer.write('my old friend.')
// 	// await writer.write('Short String')
// 	await writer.write('Please,\n<i>say &colon; something</i>...')
// 	await wait(1500)
// 	// await writer.write('Please, say something')
// 	await writer.write('<u>my old</u> friend.')
// 	inputEl.removeAttribute('disabled')
// })()

let queueIndex = 0
const queue = [
	'This is the only the only the begining',
	'Something farely long',
	'<b>This is</b> the\n<strong>MONEY</strong>: &#163;',
	'my old friend.',
	'Short String',
	'Please,\n<i>say &colon; something</i>...',
]
writer.write(queue[0])
async function afterFinish(string) {
	console.log('FINISHED', string)

	await wait(1000)
	queueIndex++
	if (queueIndex >= queue.length) queueIndex = -1
	writer.write(queue[queueIndex])
}

inputEl.addEventListener(
	'input',
	debounce(() => {
		writer.write(inputEl.value)
	}, 500),
)

textEl.addEventListener(
	'gw-finished',
	e => (logsEl.innerHTML += `<p>${(e as any).detail.string}</p>`),
)

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
