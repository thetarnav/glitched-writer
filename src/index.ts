import { random, filterDuplicates } from './utils'
import Options from './options'

class GlitchedWriter {
	options: Options = new Options()

	constructor(options?: Options) {
		if (options) this.options = new Options(options)
	}
}
