const { wait } = require('./utility.js')
const _ = {
	debounce: require('lodash.debounce'),
}
const { setGlitchedWriter, glitchWrite } = require('../glitchedWriter')

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input'),
	logsEl = document.getElementById('logs')

const displayWriter = setGlitchedWriter(textEl, {
	preset: 'normal',
	className: 'other',
})

wait(1200)
	.then(() =>
		displayWriter.write('my old friend.', {
			preset: 'nier',
			startText: false,
		}),
	)
	.then(() => wait(1200))
	.then(() =>
		glitchWrite(textEl, 'This is only the beginning', { glitches: null }),
	)
	.then(() => wait(1500))
	.then(() => glitchWrite(textEl, 'Please, say something...'))
	.then(() => inputEl.removeAttribute('disabled'))

inputEl.addEventListener(
	'input',
	_.debounce(() => displayWriter.write(inputEl.value), 500, {
		maxWait: 1000,
	}),
)

textEl.addEventListener(
	'glitchWrote',
	e => (logsEl.innerHTML += `<p>${e.detail.text}</p>`),
)
