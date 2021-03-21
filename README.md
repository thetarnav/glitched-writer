# Glitched Writer

[![npm](https://img.shields.io/npm/v/glitched-writer)](https://www.npmjs.com/package/glitched-writer) [![npm type definitions](https://img.shields.io/npm/types/glitched-writer)](https://www.npmjs.com/package/glitched-writer) [![](https://data.jsdelivr.com/v1/package/npm/glitched-writer/badge?style=rounded)](https://www.jsdelivr.com/package/npm/glitched-writer) [![NPM](https://img.shields.io/npm/l/glitched-writer)](https://www.npmjs.com/package/glitched-writer)

[![glitched-writer-preview](https://user-images.githubusercontent.com/24491503/67164275-06ab6900-f379-11e9-81ac-cab76dbc8dcd.gif)](https://codepen.io/thetarnav/pen/MWWyPzY)

### What it is:

Glitched, text-writing npm module, with highly customizable settings to get the effect You're looking for. Works for both **web** and **node.js** applications.

### Features:

-  Writes your text, by glitching or spelling it out.

-  Highly customizable behavior. Set of options will help you achieve the effect you desire.

-  Can be attached to a **HTML Element** for automatic text-displaying.

-  Callback functions for every step and finish.

-  Events **gw-finished** and **gw-step** are dispatched on the HTML Element.

-  For styling purposes, while writing: attatches **gw-writing** class to the HTML Element and **data-gw-string attribute** with current string state.

-  Written in **Typescript**.

---

## Installation

Download package through npm.

```bash
npm i glitched-writer
```

Then import GlitchedWriter class in the JavaScript file.

```js
import GlitchedWriter from 'glitched-writer'
```

Or use the CDN and attach this script link to your html document.

```html
<script src="https://cdn.jsdelivr.net/npm/glitched-writer@2.0.6/lib/index.min.js"></script>
```

## Usage:

### Creating Class Instance

Creating writer class instance:

```js
// Calling GlitchedWriter constructor:
const Writer = new GlitchedWriter(htmlElement, options, onStepCallback, onFinishCallback)

// Custom options:
const Writer = new GlitchedWriter(htmlElement, {
   interval: [10, 70],
   oneAtATime: true
})

// On-step-callback added:
const Writer = new GlitchedWriter(htmlElement, undefined, (string, writerData) => {
   console.log(`Current string: ${string}`)
   console.log('All the class data:', writerData)
})

// Using alternative class-creating function:
import { createGlitchedWriter } from 'glitched-writer'

const Writer = createGlitchedWriter(htmlElement, ...)
```

### Writing

Writing stuff and waiting with async / await.

```js
import { wait } from 'glitched-writer'

// Wrap this in some async function:
// Or use .then() instead.
const res = await Writer.write('Welcome')

console.log(`Finished writing: ${res.string}`)
console.log('All the writer data:', res)

await wait(1200) // additional simple promise to wait some time

await Writer.write('...to Glitch City!')
```

### Text Input

Don't be afraid to call write method on top of each oder.
Newer will stop the ongoing one.

```js
inputEl.addEventListener('input', () => {
	Writer.write(inputEl.value)
})
```

### Pausing & Playing

```js
Writer.write('Some very cool header.').then(({ status, message }) => {
	// this will run when the writing stops.
	console.log(`${status}: ${message}`)
})

setTimeout(() => {
	Writer.pause() // will stop writing
}, 1000)

setTimeout(async () => {
	await Writer.play() // continue writing

	console.log(Writer.string) // will log after finished writing
}, 2000)
```

### One-Time-Use

For quick one-time writing.

```js
import { glitchWrite } from 'glitched-writer'

glitchWrite('Write this and DISAPER!', htmlElement, options, ...)
```

### Listening For Events

```js
textHtmlElement.addEventListener('gw_finished', e =>
	console.log('finished writing:', e.detail.string),
)

textHtmlElement.addEventListener('gw_step', e =>
	console.log('current step:', e.detail.string),
)
```

### Writing HTML

New (**experimental & potentially dangerous**) config option let's you write text with html tags in it.

```js
// You need to enable html option.
const Writer = new GlitchedWriter(htmlElement, { html: true })

Writer.write('<b>Be sure to click <a href="...">this!</a></b>')
```

### Available imports

List of all things that can be imported from glitched-writer module.

```ts
import GlitchedWriter, { // <-- GlitchedWriter class
	ConstructorOptions, // <-- Options type
	Callback, // <-- Callback type
	WriterDataResponse, // <-- Type of response in callbacks
	createGlitchedWriter, // <-- Alternative to creating writer class instance
	glitchWrite, // <-- One time write funcion
	presets, // <-- Object with all prepared presets of options
	glyphs, // <-- Same but for glyph charsets
	wait, // <-- Ulitity async function, that can be used to wait some time
} from 'glitched-writer'
```

## Presets

To use one of the available presets, You can simply write it's name when creating writer, in the place of options.
Available presets as for now:

-  **default** - _It is loaded automatically, ant it is the one from the GIF on top._
-  **nier** - _Imitating the way text was appearing in the NieR: Automata's UI._
-  **typewriter** - _One letter at a time, only slightly glitched._
-  **terminal** - _Imitating being typed by a machine._
-  **zalgo** - _Inspired by the "zalgo" or "cursed text", Ghost characters mostly includes the unicode combining characters, which makes the text glitch vertically._

```js
new GlitchedWriter(htmlElement, 'nier')
```

### Importing preset objects

You can import the option object of mentioned presets and tweak them, as well as some glyph sets.

```js
import { presets, glyphs } from 'glitched-writer'

new GlitchedWriter(htmlElement, presets.typewriter)
```

## Customizing options

### Types and defaults:

```ts
{
   steps?: RangeOrNumber, // [1, 8]
   interval?: RangeOrNumber, // [60, 170]
   initialDelay?: RangeOrNumber, // [0, 2000]
   changeChance?: RangeOrNumber, // 0.6
   ghostChance?: RangeOrNumber, // 0.2
   maxGhosts?: number, // '0.2'
   glyphs?: string | string[] | Set<string>, // glyphs.full + glyphs.zalgo
   glyphsFromString?: boolean // false
   startFrom?: 'matching' | 'previous' | 'erase', // 'matching'
   oneAtATime?: boolean, // false
   html?: boolean, // false
   fillSpace?: boolean // true,
}

type RangeOrNumber = [number, number] | number
```

### Options Description

**Range** values will result in random values for each step for every letter.

**Ghost** are letters that gets rendered in the time of writing, but are removed to reach goal string.

-  **steps** - _Number of **minimum** steps it takes one letter to reach it's goal one. Set to 0 if you want them to change to right letter in one step._
-  **interval** - _Interval between each step, for every letter._
-  **initialDelay** - _first delay each letter must wait before it starts working_
-  **changeChance** - _Percentage Chance for letter to change to something else (from glyph charset)_
-  **ghostChance** - _Percentage Chance for ghost letter to appear_
-  **maxGhosts** - _Maximal number of ghosts to occur_
   -  **int** - _(eg. 15) -> this will be the limit._
   -  **float** - _(eg. 0.25) -> Limit = maxGhosts \* goalString.length_
-  **glyphs** - _A set of characters that can appear as ghosts or letters can change into them_
-  **glyphsFromString** - _If you want to add letters from written string to the glyph charset_
-  **startFrom** - _Decides on witch algorithm to use._
   -  'matching' - Will scan starting and goal string for matching characters and will try to build character map from that.
   -  'previous' - Wont do any matching, just converts starting string into character map.
   -  'erase' - First Erases entire string and then writes from blank space.
-  **oneAtATime** - _If writing should take place from left-to-right, letter-by-letter or normally: all-at-once._
-  **html** - Potentially dangerous option. If true, written string will be injected as html, not text content. It provides advanced text formating with html tags and more. But be sure to not enable it on user-provided content.
-  **fillSpace** - _Normally if letter gets erased it actually gets replaced with space instead - to make words appear from and disappear into space, rather then sticking to the rest of the words. Set to false if you want to disable this._

## Links:

-  [GitHub](https://github.com/thetarnav/glitched-writer 'GitHub')

-  [npm](https://www.npmjs.com/package/glitched-writer 'npm')

-  [JSDelivr](https://www.jsdelivr.com/package/npm/glitched-writer 'JSDelivr')

-  [Codepen DEMO](https://codepen.io/thetarnav/pen/MWWyPzY 'Codepen DEMO')
