import GlitchedWriter, { wait, presets } from '../src'

const outputEl = document.querySelector(`#output`),
	Writer = new GlitchedWriter(
		outputEl,
		{
			...presets.terminal,
			interval: 20,
			fillSpace: false,
			glyphs: '',
			glyphsFromString: false,
			maxGhosts: 0,
			ghostChance: 0,
			changeChance: 0,
		},
		string => console.log(string),
		string => console.log('FIN', string),
	)

const phrazes = {
	compiling: 'script: Compiling.',
	compiled: 'script: Compiled successfully.',
	hash: 'Hash: 33d8c38093d5e8261eac',
	package: 'Package: GlitchedWriter',
}

;(async function () {
	await Writer.write(phrazes.compiling)
	await wait(200)
	await Writer.write(phrazes.compiling + '.')
	await wait(200)
	await Writer.write(phrazes.compiling + '..')
	await wait(200)
	await Writer.write(phrazes.compiling + '.')
	await wait(200)
	await Writer.write(phrazes.compiling)
	await wait(200)
	await Writer.write(phrazes.compiling + '.')
	await wait(200)
	await Writer.write(phrazes.compiling + '..')
	await wait(300)
	await Writer.write(phrazes.compiled)
	await wait(100)
	await Writer.write(phrazes.compiled + '\n' + phrazes.hash)
	await wait(100)
	await Writer.write(
		phrazes.compiled + '\n' + phrazes.hash + '\n' + phrazes.package,
	)
	await wait(100)
	// await Writer.write(`
	// script: Compiled successfully.\n
	// Hash: 33d8c38093d5e8261eac\n
	// Package: GlitchedWriter`);
	// await wait(100);
	// await Writer.write("script: Compiled successfully. \nHash: 33d8c38093d5e8261eac\nPackage: GlitchedWriter \nVersion: 2.0.7");
	// await wait(100);
	// const time = Math.round(Math.random() * 1500)
	// await Writer.write(`script: Compiled successfully. \nHash: 33d8c38093d5e8261eac \nPackage: GlitchedWriter \nVersion: 2.0.7 \nTime: ${time}ms`);
})()
