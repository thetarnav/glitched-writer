# Glitched Writer

![npm](https://img.shields.io/npm/v/glitched-writer) ![npm type definitions](https://img.shields.io/npm/types/glitched-writer) [![](https://data.jsdelivr.com/v1/package/npm/glitched-writer/badge?style=rounded)](https://www.jsdelivr.com/package/npm/glitched-writer) ![NPM](https://img.shields.io/npm/l/glitched-writer)

[![glitched-writer-preview](https://user-images.githubusercontent.com/24491503/67164275-06ab6900-f379-11e9-81ac-cab76dbc8dcd.gif)](https://codepen.io/thetarnav/pen/MWWyPzY)

### What it is:

Glitched, text-writing npm module, with highly customizable settings to get the effect You're looking for. Works for both **web** and **node.js** applications.

### Features:

-  Writes your text, by glitching or spelling it out.

-  Can be attached to a **HTML Element** or simply printed out, by providing callback function. Therefore it can be used anywhere.

-  Highly customizable behavior. Set of options will help you achieve the effect you desire.

-  For styling purposes, while writing: attatches **glitched-writer--writing** class to the HTML Element and **data-string attribute** with current string state.

-  Written in **typescript**.

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
<script src="https://cdn.jsdelivr.net/npm/glitched-writer@1.3.0/glitchedWriter.min.js"></script>
```

## Usage:

### Creating Class Instance

Creating writer class instance:

```js
// Default config and some attaching HTML Element:
const Writer = new GlitchedWriter(htmlElement)

// Same, but with custom options:
const Writer = new GlitchedWriter(htmlElement, {
   interval: [10, 70],
   oneAtATime: true
})

// Same, but with on-step-callback added:
const Writer = new GlitchedWriter(htmlElement, undefined, (string, writerData) => {
   console.log(`Current string: ${string}`)
   console.log('All the class data:' writerData)
})

// Or by using alternative class-creating function:
import { createGlitchedWriter } from 'glitched-writer'

const Writer = createGlitchedWriter(htmlElement, ...)
```

### Writing

Writing stuff with async / await.

```js
import { wait } from 'glitched-writer'

const res = await Writer.write('Welcome')

console.log(`Current string: ${res.string}`)
console.log('All the class data:' res.data)

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

```js
import { glitchWrite } from 'glitched-writer'

glitchWrite('Write this and DISAPER!', htmlElement, options, onStepCallback)
```

## Presets

To use one of the available presets, You can simply write it's name when creating writer, in the place of options.
Available presets as for now:

-  **default** - _It is loaded automatically, ant it is the one from the GIF on top._
-  **nier** - _Imitating the way text was appearing in the NieR: Automata's UI._
-  **typewriter** - _One letter at a time, only slightly glitched._
-  **terminal** - _Imitating being typed by a machine._

```js
new GlitchedWriter(htmlElement, 'nier')
```

### Importing objects

You can import the option object of mentioned presets and tweak them, as well as some glyph sets.

```js
import { presets, glyphs } from 'glitched-writer'

new GlitchedWriter(htmlElement, presets.typewriter)
```

## Customizing options

### Types and defaults:

```ts
{
   steps?: RangeOrNumber // [1, 6]
   interval?: RangeOrNumber // [50, 150]
   initialDelay?: RangeOrNumber // [0, 1500]
   changeChance?: RangeOrNumber // 0.6
   ghostChance?: RangeOrNumber // 0.15
   maxGhosts?: number | 'relative' // 'relative'
   glyphs?: string | string[] | Set<string> // glyphs.full
   glyphsFromString?: 'previous' | 'goal' | 'both' | 'none' // 'none'
   oneAtATime?: boolean // false
   startFrom?: 'matching' | 'previous' | 'erase' // 'matching'
   leadingText?: AppendedText // undefined
   trailingText?: AppendedText // undefined
   reverseOutput?: boolean // false
}

interface AppendedText {
	value: string
	display: 'always' | 'when-typing' | 'when-not-typing'
}
type RangeOrNumber = [number, number] | number
```

### Description

**Range** values will result in random values for each step for every letter.

**Ghost** are letters that gets rendered in the time of writing, but are removed to reach goal string.

-  **steps** - _Number of **minimum** steps it takes one letter to reach it's goal one. Set to 0 if you want them to change to right letter in one step._
-  **interval** - _Interval between each step, for every letter._
-  **initialDelay** - _first delay each letter must wait before it starts working_
-  **changeChance** - _Percentage Chance for letter to change to something else (from glyph charset)_
-  **ghostChance** - _Percentage Chance for ghost letter to appear_
-  **maxGhosts** - _Max number of ghosts for entire string_
-  **glyphs** - _A set of characters that can appear as ghosts or letters can change into them_
-  **glyphsFromString** - _If you want to add letters from string to the glyph charset_
   -  'previous' - appends leters from starting string
   -  'goal' - appends leters from goal string
   -  'both' - appends leters both of them
   -  'none' - leaves the glyph charset be
-  **oneAtATime** - _If writing should take place from left-to-right, letter-by-letter or normally: all-at-once._
-  **startFrom** - _Decides on witch algorithm to use._
   -  'matching' - Will scan starting and goal string for matching characters and will try to build character map from that.
   -  'previous' - Wont do any matching, just converts starting string into character map.
   -  'erase' - First Erases entire string and then writes from blank space.
-  **leadingText** and **trailingText** - _Former adds stuff to the begining and latter to the end._
   -  value - _Whats gets added_
   -  display - _When_: 'always' or 'when-typing' or 'when-not-typing'
-  **reverseOutput** - _should the string output be reversed or not. It's usefull for using the ::first-letter css selector for... well... the last letter_

## Links:

-  [GitHub](https://github.com/thetarnav/glitched-writer 'GitHub')

-  [npm](https://www.npmjs.com/package/glitched-writer 'npm')

-  [JSDelivr](https://www.jsdelivr.com/package/npm/glitched-writer 'JSDelivr')

-  [Codepen DEMO](https://codepen.io/thetarnav/pen/MWWyPzY 'Codepen DEMO')
