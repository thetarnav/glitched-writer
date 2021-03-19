import debounce from 'lodash.debounce'

import GlitchedWriter, { wait } from '../src'
// import GlitchedWriter, { WriterDataResponse, wait } from '../lib'

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input') as HTMLInputElement,
	logsEl = document.getElementById('logs')

const writer = new GlitchedWriter(textEl)

// eslint-disable-next-line func-names
;(async function () {
	await wait(1200)
	await writer.write('my old\nfriend.')
	await wait(1200)
	await writer.write('This is only the\nbeginning.')
	await wait(1500)
	await writer.write('Please,\n\tsay something...')
	inputEl.removeAttribute('disabled')
})()

inputEl.addEventListener(
	'input',
	debounce(
		() => {
			writer.write(inputEl.value)
		},
		500,
		{
			// maxWait: 1000,
		},
	),
)

textEl.addEventListener(
	'gw_finished',
	e => (logsEl.innerHTML += `<p>${e.detail.string}</p>`),
)

// function logString({ string }: WriterDataResponse) {
// 	logsEl.innerHTML += `<p>${string}</p>`
// }
