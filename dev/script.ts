// eslint-disable-next-line import/no-extraneous-dependencies
import debounce from 'lodash.debounce'

import GlitchedWriter, { wait, presets } from '../src'
// import GlitchedWriter, { wait } from '../lib'

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input') as HTMLInputElement,
	logsEl = document.getElementById('logs')

const writer = new GlitchedWriter(textEl, { ...presets.zalgo, html: true })

// eslint-disable-next-line func-names
;(async function () {
	await wait(1200)
	await writer.write('<h3>This is only the beginning.</h3>')
	await wait(1200)
	await writer.write('Please, <b>say something</b>...')
	await wait(1500)
	await writer.write('my <i>old</i> friend.')
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
	e => (logsEl.innerHTML += `<p>${e.detail.string}</p>`),
)

// function logString({ string }: WriterDataResponse) {
// 	logsEl.innerHTML += `<p>${string}</p>`
// }
