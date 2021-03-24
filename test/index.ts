import { JSDOM } from 'jsdom'
import GlitchedWriter from '../src'

const dom = new JSDOM(
	`<!DOCTYPE html><div id="glitch_this">Girls &#38; Bois</div>`,
)

const el = dom.window.document.querySelector('#glitch_this')

const Writer = new GlitchedWriter(
	el || undefined,
	{ html: true },
	string => console.log(`"${string}"`),
	string => console.log('FIN', `"${string}"`),
)

;(async function () {
	await Writer.write(
		'Hello world &#38; My Children! </br> \thash: 2453216363242323435',
	)
})()
