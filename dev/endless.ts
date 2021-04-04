import GlitchedWriter, { glitchWrite } from '../src'

const numbers = []

for (let i = 0; i < 16; i++) {
	numbers.push(Math.floor(Math.random() * 10))
}

glitchWrite(numbers.splice(0, 4).join(''), '#group-one', 'encrypted')

glitchWrite(numbers.splice(0, 4).join(''), '#group-two', 'encrypted')

const secretWriter = new GlitchedWriter('#secret', 'encrypted'),
	numbersEl = document.querySelector('.number'),
	infoEl = document.querySelector('.show-info')

hide()

numbersEl.addEventListener('mouseenter', () => {
	secretWriter.options.endless = false
	infoEl.classList.add('hide')
})

numbersEl.addEventListener('mouseleave', hide)

function hide() {
	secretWriter.options.endless = true
	secretWriter.write(numbers.join(''))
	infoEl.classList.remove('hide')
}

setTimeout(() => {
	// secretWriter.extendOptions({
	// 	glyphs: '/*-+-=!@#%^&*(({}[],<>/?:"',
	// })
	secretWriter.options = {
		glyphs: '/*-+-=!@#%^&*(({}[],<>/?:"',
	}
}, 5000)
