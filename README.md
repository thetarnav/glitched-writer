# Glitched Writer

[![npm](https://img.shields.io/npm/v/glitched-writer)](https://www.npmjs.com/package/glitched-writer) [![npm type definitions](https://img.shields.io/npm/types/glitched-writer)](https://www.npmjs.com/package/glitched-writer) [![](https://data.jsdelivr.com/v1/package/npm/glitched-writer/badge?style=rounded)](https://www.jsdelivr.com/package/npm/glitched-writer) [![NPM](https://img.shields.io/npm/l/glitched-writer)](https://www.npmjs.com/package/glitched-writer)
[![npm](https://img.shields.io/npm/dt/glitched-writer)](https://www.npmjs.com/package/glitched-writer)

[![glitched-writer-preview](https://user-images.githubusercontent.com/24491503/67164275-06ab6900-f379-11e9-81ac-cab76dbc8dcd.gif)](https://codepen.io/thetarnav/pen/MWWyPzY)

### What it Glitched Writer:

> **A lightweight, glitched, text writing module. Highly customizable settings. Decoding, decrypting, scrambling, and simply spelling text.**

### Features:

-  Manage text animation of **HTML Element**. Write, pause, play, add, remove and write more!

-  **Highly customizable** behavior. Set of options let you animate the text the way is suits your design.

-  Can be attached to a **HTML Element** for automatic text-displaying.

-  Callback functions firing on finish and every step.

-  Custom Event **gw-finished** will be dispatched on the HTML Element.

-  For styling purposes writer attatches **gw-writing** class to the HTML Element and **data-gw-string attribute** with current string.

-  Possible to write text with **html tags** in it and letterize it into many **span** elements.

-  Written fully in **Typescript**.

---

### SEE DEMOS:

#### [Default (interactive)](https://codepen.io/thetarnav/pen/MWWyPzY) --- [Terminal](https://codepen.io/thetarnav/pen/mdRyqga) --- [Simple Scramble Effect](https://codepen.io/thetarnav/pen/vYgYWbb) --- [Nier Automata Effect](https://codepen.io/thetarnav/pen/OJWNRor)

## Table Of Contents

1. **[Installation](#installation)**
2. **[Usage](#usage)**
   -  [Creating Class Instance](#creating-class-instance)
   -  [Writing](#writing)
   -  [Pausing & Playing](#pausing--playing)
   -  [One-Time-Use](#one-time-use)
   -  [On Text Input](#on-text-input)
   -  [Listening For Events](#listening-for-events)
   -  [Add & Remove](#add--remove)
   -  [Writing HTML](#writing-html)
   -  [Letterize](#letterize)
   -  [Endless option](#endless-animation)
   -  [Available imports](#available-imports)
3. **[Presets](#presets)**
4. **[Options](#customizing-options)**

---

## Installation

Download and install with npm.

```bash
npm i glitched-writer
```

```js
import GlitchedWriter from 'glitched-writer'
```

Or use [Skypack](https://www.skypack.dev/view/glitched-writer) to import without need to install the package.

```js
import GlitchedWriter from 'https://cdn.skypack.dev/glitched-writer'
```

Or use [JsDelivr](https://www.jsdelivr.com/package/npm/glitched-writer) and attach this script link to your html document.

```html
<script src="https://cdn.jsdelivr.net/npm/glitched-writer@2.0.18/lib/index.min.js"></script>
```

## Usage:

### Creating Class Instance

Creating writer class instance:

```js
// Calling GlitchedWriter constructor:
const Writer = new GlitchedWriter(
	htmlElement, // Element / Selector string / undefined
	options, // {...} / Preset name / undefined
	onStepCallback, // (string, data) => {} / undefined
	onFinishCallback, // (string, data) => {} / undefined
)

// Custom options:
const Writer = new GlitchedWriter(htmlElement, {
	interval: [10, 70],
	oneAtATime: true,
	letterize: true,
})

// On-step-callback added:
const Writer = new GlitchedWriter(htmlElement, {}, (string, writerData) => {
	console.log(`Current string: ${string}`)
	console.log('All the class data:', writerData)
})
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

### On Text Input

Don't be afraid to call write method on top of each oder.
New will stop the ongoing.

```js
inputEl.addEventListener('input', () => {
	Writer.write(inputEl.value)
})
```

### Listening For Events

```js
// html element that you passed in writer constructor.
textHtmlElement.addEventListener('gw-finished', e =>
	console.log('finished writing:', e.detail.string),
)
```

### Add & Remove

.add(string) & .remove(number) are methods usefull for quick, slight changes to the displayed text.

```js
// Let's say current text content is: "Hello World"

Writer.add('!!!')
// -> Hello World!!!

Writer.remove(9)
// -> Hello
```

### Writing HTML

(**! Potentially dangerous !**) Let's you write text with html tags in it.

```js
// You need to enable html option.
const Writer = new GlitchedWriter(htmlElement, { html: true })

Writer.write('<b>Be sure to click <a href="...">this!</a></b>')
```

### Letterize

Splits written text into series of span elements. Then writing letters seperately into these child-elements. _Now can be used fully with HTML option!_

```js
// You need to enable html option.
const Writer = new GlitchedWriter(htmlElement, { letterize: true })

Writer.write('Hello there!')
/**
 * The shape of one character:
 * span.gw-char (and .gw-finished when finish typing)
 * 	span.gw-ghosts
 * 	span.gw-letter (also .gw-glitched when it is a "glitched" char.)
 * 	span.gw-ghosts
 */
```

### Endless animation

New option "endless" let's you run the text animation until you disable that function.

This opens the door for some additional effects, like: **Show on hover** (e.g. on secret fields) or **refreshing text** to give it user attention.

```js
// SHOW ON HOVER
// First make the password scramble forever
Writer.options.endless = true
Writer.write('PASSWORD')

// And disable endless option on hover
passEl.addEventListener('mouseover', () => {
	Writer.options.endless = true
})

// REFRESHING:
// let's say you already have el with text 'LOOK AT ME'
// and you want to make it pop
Writer.options.endless = true
Writer.write('LOOK AT ME')
await wait(1500)
Writer.options.endless = false
```

### Available imports

List of all things that can be imported from glitched-writer module.

```ts
import GlitchedWriter, { // <-- GlitchedWriter class
	ConstructorOptions, // <-- Options type
	Callback, // <-- Callback type
	WriterDataResponse, // <-- Type of response in callbacks
	glitchWrite, // <-- One time write funcion
	presets, // <-- Object with all prepared presets of options
	glyphs, // <-- Same but for glyph charsets
	wait, // <-- Ulitity async function, that can be used to wait some time
} from 'glitched-writer'
```

## Presets

To use one of the available presets, You can simply write it's name when creating writer, in the place of options.
Available presets as for now:

-  **[default](https://codepen.io/thetarnav/pen/MWWyPzY)** - Loaded automatically, featured on the GIF up top.

-  **[nier](https://codepen.io/thetarnav/pen/OJWNRor)** - Imitating the way text was appearing in the _NieR: Automata's UI_.

-  **typewriter** - One letter at a time, only slightly glitched.

-  **[terminal](https://codepen.io/thetarnav/pen/mdRyqga)** - Imitating being typed by a machine or a computer.

-  **zalgo** - Inspired by the _"zalgo"_ or _"cursed text"_, Ghost characters mostly includes the unicode combining characters, which makes the text glitch vertically.

-  **[neo](https://codepen.io/thetarnav/pen/vYgYWbb)** - Recreated: _Justin Windle's ["Text Scramble Effect"](https://codepen.io/soulwire/pen/mErPAK)_

-  **encrypted** - Simple Text Scramble effect, suits well displaying secret data, like passwords or card numbers.

```js
new GlitchedWriter(htmlElement, 'terminal')
```

### Importing preset objects

You can import the option object of mentioned presets and tweak them, as well as some glyph sets.

```js
import { presets, glyphs } from 'glitched-writer'

// Extend preset for your needs:
new GlitchedWriter(htmlElement, {
	...presets.typewriter,
	letterize: true,
})
```

## Customizing options

### Types and defaults:

```ts
{
//	name    [min   , max   ] | const   // default
	steps?: [number, number] | number, // [1, 8]
	interval?: [number, number] | number, // [60, 170]
	initialDelay?: [number, number] | number, // [0, 2000]
	changeChance?: number, // 0.6
	ghostChance?: number, // 0.2
	maxGhosts?: number, // '0.2'
	glyphs?: string | string[] | Set<string>, // glyphs.full + glyphs.zalgo
	glyphsFromString?: boolean, // false
	startFrom?: 'matching' | 'previous' | 'erase', // 'matching'
	oneAtATime?: boolean, // false
	html?: boolean, // false
	letterize?: boolean, // false
	fillSpace?: boolean, // true
	endless?: boolean // false
}
```

### Options Description

**Range** values will result in random values for each step for every letter.

**Ghost** are "glitched letters" that gets rendered randomly in the time of writing, but aren't part of final string.

-  **steps** - Number of **minimum** steps it takes one letter to reach it's goal one. Set to 0 if you want them to change to right letter in one step. (int)

-  **interval** - Interval between each step, for every letter. (int: ms)

-  **initialDelay** - first delay each letter must wait before it starts working (int: ms)

-  **changeChance** - Percentage chance for letter to change to glitched one (from glyphs) (p: 0-1)

-  **ghostChance** - Percentage chance for ghost letter to appear (p: 0-1)

-  **maxGhosts** - Maximal number of ghosts to occur

   -  **int** - _(eg. 15) -> this will be the limit._
   -  **float** - _(eg. 0.25) -> Limit = maxGhosts \* goalString.length_

-  **glyphs** - A set of characters that can appear as ghosts or letters can change into them

-  **glyphsFromString** - If you want to add letters from written string to the glyph charset

-  **startFrom** - Decides on witch algorithm to use.

   -  'matching' - _Will scan starting and goal string for matching characters and will try to build character map from that._
   -  'previous' - _Wont do any matching, just converts starting string into character map._
   -  'erase' - _First Erases entire string and then writes from blank space._

-  **oneAtATime** - If writing should take place from left-to-right, letter-by-letter or normally: all-at-once.

-  **html** - _Potentially dangerous option._ If true, written string will be injected as html, not text content. It provides advanced text formating with html tags and more. But be sure to NOT enable it on user-provided content.

-  **letterize** - Instead of injecting written text to "textContent" or "innerHTML", it appends every letter of that text as a child span element. Then changing textContent of that span to current letter. It gives a lot of styling possibilities, as you can style ghosts, letters, and whole chars seperately, depending on current writer and char state.

-  **fillSpace** - Normally if letter gets erased it actually gets replaced with space instead - to make words appear from and disappear into space, rather then sticking to the rest of the words. Set to false if you want to disable this.

-  **endless** - It will make the animation endless. _But why?_ Well, you can disable this option while the animation is running _(writer.options.endless = false)_ and finish the animation.

## Links:

-  [GitHub](https://github.com/thetarnav/glitched-writer 'GitHub')

-  [npm](https://www.npmjs.com/package/glitched-writer 'npm')

-  [JSDelivr](https://www.jsdelivr.com/package/npm/glitched-writer 'JSDelivr')

-  [Codepen DEMO](https://codepen.io/thetarnav/pen/MWWyPzY 'Codepen DEMO')
