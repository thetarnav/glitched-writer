import debounce from 'lodash.debounce'

import GlitchedWriter, { wait } from '../../src'
// import GlitchedWriter, { wait } from '../lib'

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input') as HTMLInputElement,
	logsEl = document.getElementById('logs')

const writer = new GlitchedWriter(textEl, {
	html: true,
	startFrom: 'erase',
	initialDelay: [0, 500],
	interval: [10, 50],
	steps: [1, 3],
})

// eslint-disable-next-line func-names
;(async function () {
	await wait(1200)
	await writer.write('<i>my old friend.</i>')
	await wait(1200)
	await writer.write('This is only <b>the beginning.</b>')
	await wait(1500)
	await writer.write('<i>Please</i>,</br>say something...')
	inputEl.removeAttribute('disabled')
})()

inputEl.addEventListener(
	'input',
	debounce(() => {
		writer.write(inputEl.value)
	}, 500),
)

textEl.addEventListener(
	'gw_finished',
	e => (logsEl.innerHTML += `<p>${e.detail.string}</p>`),
)

// function logString({ string }: WriterDataResponse) {
// 	logsEl.innerHTML += `<p>${string}</p>`
// }
