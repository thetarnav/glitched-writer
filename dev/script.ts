// eslint-disable-next-line import/no-extraneous-dependencies
import debounce from 'lodash.debounce'

import GlitchedWriter, { wait, presets } from '../src'
// import GlitchedWriter, { wait } from '../lib'

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input') as HTMLInputElement,
	logsEl = document.getElementById('logs')

const writer = new GlitchedWriter(
	'#glitch_this',
	{ ...presets.encrypted, html: true },
	// 'encrypted',
	string => console.log(string),
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
;(async function () {
	await wait(1200)
	// await writer.write('This is the only the only the begining')
	// await writer.write('Something farely long')
	await writer.write('<b>This is</b> the\n<strong>MONEY</strong>: &#163;')
	await wait(1200)
	// await writer.write('my old friend.')
	// await writer.write('Short String')
	await writer.write('Please,\n<i>say &colon; something</i>...')
	await wait(1500)
	// await writer.write('Please, say something')
	await writer.write('<u>my old</u> friend.')
	inputEl.removeAttribute('disabled')
})()

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

// function logString({ string }: WriterDataResponse) {
// 	logsEl.innerHTML += `<p>${string}</p>`
// }
