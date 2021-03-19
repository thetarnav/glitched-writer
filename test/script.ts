import debounce from 'lodash.debounce'

// import GlitchedWriter, { WriterDataResponse, wait } from '../src'
import GlitchedWriter, { WriterDataResponse, wait } from '../lib'

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input') as HTMLInputElement,
	logsEl = document.getElementById('logs')

const writer = new GlitchedWriter(textEl)

// eslint-disable-next-line func-names
;(async function () {
	await wait(1200)
	await writer.write('my old friend.').then(logString)
	await wait(1200)
	await writer.write('This is only the beginning.').then(logString)
	await wait(1500)
	await writer.write('Please, say something...').then(logString)
	inputEl.removeAttribute('disabled')
})()

inputEl.addEventListener(
	'input',
	debounce(
		() => {
			writer.write(inputEl.value).then(logString)
		},
		500,
		{
			// maxWait: 1000,
		},
	),
)

// textEl.addEventListener(
// 	'glitchWrote',
// 	e => (logsEl.innerHTML += `<p>${e.detail.text}</p>`),
// )

function logString({ string }: WriterDataResponse) {
	logsEl.innerHTML += `<p>${string}</p>`
}
