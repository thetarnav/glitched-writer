// eslint-disable-next-line import/no-extraneous-dependencies
import debounce from 'lodash.debounce'

import GlitchedWriter, { wait, presets } from '../src'
// import GlitchedWriter, { wait } from '../lib'

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input') as HTMLInputElement,
	logsEl = document.getElementById('logs')

const writer = new GlitchedWriter(
	textEl,
	{ ...presets.zalgo, html: true, letterize: true },
	string => console.log(string),
)

// eslint-disable-next-line func-names
;(async function () {
	await wait(1200)
	await writer.write('<b>This is</b> the <strong>MONEY</strong>: &#163;')
	await wait(1200)
	await writer.write('Please, <i>say something</i>...')
	await wait(1500)
	await writer.write('my old friend.')
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
