// import { random, filterDuplicates } from './utils'
import Options from './options'
// @ts-ignore
import Char from './char'

// @ts-ignore
class GlitchedWriter {
	options: Options = new Options()

	constructor(options?: Options) {
		if (options) this.options = new Options(options)
	}
}

const example = new Char('l', 'G', new Options(), (string: string) => {
	console.log(string)
})

example.play().then(() => console.log('finished in index'))
// while (!example.finished) {
// 	example.proceed()
// 	console.log(example.string)
// }
// console.log('Finished')
