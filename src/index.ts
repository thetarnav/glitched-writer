import { random, filterDuplicates } from './utils'
import Options from './options'

class GlitchedWriter {
	static options = new Options()
	options: Options = GlitchedWriter.options

	constructor(options?: Options) {
		if (options) this.options = new Options(options)
	}
}
