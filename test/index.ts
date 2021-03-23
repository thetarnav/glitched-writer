import { JSDOM } from 'jsdom'
import GlitchedWriter from '../src'

const dom = new JSDOM(
	`<!DOCTYPE html><div id="glitch_this">Hello world\nMy Children!</div>`,
)

const el = dom.window.document.querySelector('#glitch_this')

const Writer = new GlitchedWriter(
	el || undefined,
	{},
	string => console.log(`"${string}"`),
	string => console.log('FIN', `"${string}"`),
)

;(async function () {
	await Writer.write('Hello world\nMy Children!\nhash: 2453216363242323435')
	await Writer.write(
		'Hello world\nMy Children!\nhash: 2453216363242323435\nnani Script v10123',
	)
})()
