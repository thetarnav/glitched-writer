const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

const config = {}

function generateConfig(name) {
	const compress = name.indexOf('min') > -1
	const innerConfig = {
		entry: './lib/index.js',
		output: {
			path: `${__dirname}/dist/`,
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

;['index', 'index.min'].forEach(key => {
	config[key] = generateConfig(key)
})

module.exports = config
