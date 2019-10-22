const { wait } = require('./utility.js')
const _ = {
	debounce: require('lodash.debounce'),
}
const { setGlitchedWriter, glitchWrite } = require('../glitchedWriter')

const textEl = document.getElementById('glitch_this'),
	inputEl = document.getElementById('input'),
	logsEl = document.getElementById('logs')

wait(1200)
	.then(() =>
		glitchWrite(textEl, 'my old friend.', {
			stepsMin: 7,
			stepsMax: 10,
			glitches: '',
			glitchesFromString: true,
		}),
	)
	.then(() => wait(1200))
	.then(() =>
		glitchWrite(textEl, 'This is only the beginning', { glitches: null }),
	)
	.then(() => wait(1500))
	.then(() => glitchWrite(textEl, 'Please, say something...'))
	.then(() => inputEl.removeAttribute('disabled'))

const displayWriter = setGlitchedWriter(textEl, {
	ghostLettersProbability: 0,
	maxGhostLetters: 0,
	glitches: '',
})

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
