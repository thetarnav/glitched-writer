const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

const config = {}

function generateConfig(name) {
	const compress = name.indexOf('min') > -1
	const innerConfig = {
		entry: './lib/esm/index.js',
		output: {
			path: `${__dirname}/lib/`,
			filename: `${name}.js`,
			sourceMapFilename: `${name}.map`,
			library: 'glitched-writer',
			libraryTarget: 'umd',
		},
		// node: {
		// 	process: false,
		// },
		devtool: 'source-map',
		mode: compress ? 'production' : 'development',
	}
	return innerConfig
}

;['index.min'].forEach(key => {
	config[key] = generateConfig(key)
})

module.exports = config
