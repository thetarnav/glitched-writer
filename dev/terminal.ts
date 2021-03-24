import GlitchedWriter, { wait, presets } from '../src'
import { random } from '../src/utils'

const outputEl = document.querySelector(`#output`),
	Writer = new GlitchedWriter(outputEl, {
		...presets.terminal,
		html: true,
	})

const date = new Date()

;(async function () {
	await Writer.write('script: Compiling.')
	await wait(200)
	await Writer.add('.')
	await wait(200)
	await Writer.add('.')
	await wait(200)
	await Writer.remove(1)
	await wait(200)
	await Writer.remove(1)
	await wait(200)
	await Writer.add('.')
	await wait(200)
	await Writer.add('.')
	await wait(300)
	await Writer.write(`script: Compiled successfully.
hash: ${Date.now()}
package: <a href="https://www.npmjs.com/package/glitched-writer" target="_blank">GlitchedWriter</a>
version: 2.0.7
time: ${random(0, 1500, 'round')}ms
                                Asset       Size  Chunks                    Chunk Names
                             <i>index.js</i>    ${random(
											10,
											50,
											'round',
										)}.3 MB       3  <strong>[emitted]</strong>  <strong>[big]</strong>  index
                         <i>dashboard.js</i>    6.${random(
										1,
										10,
										'round',
									)} MB       1  <strong>[emitted]</strong>  <strong>[big]</strong>  dashboard
 <i>0.81c79b4db476a98d272f.hot-update.js</i>    ${random(
		40,
		100,
		'round',
 )}.4 kB       0  <strong>[emitted]</strong>         project
 <i>81c79b4db476a98d272f.hot-update.json</i>   52 bytes          <strong>[emitted]</strong>
                        <i>manifest.json</i>  ${random(
									100,
									300,
									'round',
								)} bytes          <strong>[emitted]</strong>
./app/javascript/common/components/Termianl.js 2.42 kB {0} {1} <strong>[built]</strong>

<b>Welcome To Glitched Terminal!</b> (v 2.0.7)
${date.getDate()}/${
		date.getMonth() + 1
	}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}
Documentation: type "help"

`)
})()
