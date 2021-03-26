import { JSDOM } from 'jsdom'
import GlitchedWriter, { wait } from '../src'

const dom = new JSDOM(
	`<!DOCTYPE html><div id="glitch_this">Girls &#38; Bois</div>`,
)

const el = dom.window.document.querySelector('#glitch_this')

const Writer = new GlitchedWriter(
	el || undefined,
	{ html: true },
	string => console.log(`"${el?.textContent}"`),
	string => console.log('FIN', `"${el?.textContent}"`),
)

;(async function () {
	await wait(1200)
	await Writer.write('<b>This is</b> the <strong>MONEY</strong>: &#163;')
	await wait(1200)
	await Writer.write('Please, <i>say something</i>...')
	await wait(1500)
	await Writer.write('my old friend.')
})()
