# Glitched Writer

[![npm](https://img.shields.io/npm/v/glitched-writer)](https://www.npmjs.com/package/glitched-writer)
[![npm type definitions](https://img.shields.io/npm/types/glitched-writer)](https://www.npmjs.com/package/glitched-writer)
[![](https://data.jsdelivr.com/v1/package/npm/glitched-writer/badge?style=rounded)](https://www.jsdelivr.com/package/npm/glitched-writer)
[![bundle size](https://img.shields.io/bundlephobia/minzip/glitched-writer)](https://bundlephobia.com/result?p=glitched-writer)
[![npm](https://img.shields.io/npm/dt/glitched-writer)](https://www.npmjs.com/package/glitched-writer)

[![glitched-writer-preview](https://user-images.githubusercontent.com/24491503/67164275-06ab6900-f379-11e9-81ac-cab76dbc8dcd.gif)](https://glitched-writer.site)

### What is Glitched Writer:

> **A lightweight npm module for writing text to HTML elements. Highly customizable settings. Decoding, decrypting, scrambling, and simply spelling out text.**

### Features:

-  Manages text animation of **HTML Element**. Write, pause, play, add, remove and write some more!

-  **Highly customizable** behavior. Set of options let you animate the text the way is suits your design.

-  Adding Callback functions to fire on writer events (start, step, finish).

-  Custom Event **gw-finished** will be dispatched on the HTML Element.

-  For styling purposes writer attatches **gw-writing** class to the HTML Element and **data-gw-string attribute** with current string.

-  Handles **html tags** & **html entities** (e.g. \<br/\>, \<a href="#"\>link\</a\>, \&#59;, \&amp;).

-  Can letterize string it into many **span** elements inside the parent element.

-  Written in **Typescript**.

---

### >>> [PLAYGROUND](https://glitched-writer.site) <<< | >>> [DEMOS](https://codepen.io/collection/XWVEEa) <<< | >>> [NPM](https://www.npmjs.com/package/glitched-writer) <<< | >>> [Vue component](https://www.npmjs.com/package/vue-glitched-writer) <<<

---

## Table Of Contents

1. **[Installation](#installation)**
2. **[Usage](#usage)**
   -  [Creating Class Instance](#creating-class-instance)
   -  [Writing](#writing)
   -  [Queue Writing](#queue-writing)
   -  [Pausing & Playing](#pausing--playing)
   -  [One-Time-Use](#one-time-use)
   -  [On Text Input](#on-text-input)
   -  [Callbacks | Events](#callbacks-|-events)
   -  [Add & Remove](#add--remove)
   -  [Writing HTML](#writing-html)
   -  [Letterize](#letterize)
   -  [Endless option](#endless-animation)
   -  [Changing options after creation](#changing-options-post-initialization)
   -  [CSS Tricks](#optimizing-css---preventing-layour-shifts)
   -  [Available imports](#available-imports)
3. **[Presets](#presets)**
4. **[Options](#customizing-behavior)**
   -  [Effect style](#stylistic-options)
   -  [Control](#control-options)
   -  [Generators](#generator-options)

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

## CDN

You can also attach script tag with src pointing to CDN, like [JsDelivr](https://www.jsdelivr.com/package/npm/glitched-writer).

```html
<script src="https://cdn.jsdelivr.net/npm/glitched-writer/lib/index.min.js"></script>
```

In result, the **GlitchedWriter** object will be available in your code, this object contains all named exports, [listed here](#available-imports).

```js
// use create method to create new instance.
const writer = GlitchedWriter.create(Element, options, finishCB)
```

## Usage:

### Creating Class Instance

Creating writer class instance:

```js
// Calling GlitchedWriter constructor:
const writer = new GlitchedWriter(
	htmlElement, // Element / Selector string / undefined
	options, // {...} / Preset name / undefined
	onFinishCallback, // (string, data) => {} / undefined
)

// Custom options:
const writer = new GlitchedWriter(htmlElement, {
	interval: [10, 70],
	oneAtATime: true,
	letterize: true,
})

// On-finish-callback added:
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

### Queue Writing

If you have prepared array of texts to write - in a loop, or one time - you can pass them all to the .write() method and initiate a Queue.

```js
const phrases = ['First, write this.', 'Then this.', 'And finally this!']

writer.queueWrite(phrases, 1000, true)

/**
 * 1. @param texts
 * - string[] - Array of strings to write
 * - HTMLElement - the parent element with the paragraphs
 * - string - query selector pointing to that element
 * 2. @param queueInterval - Time to wait between writing each texts [ms]
 * 3. @param loop - boolean | Callback | number - What to do when the queue has ended.
 * - false -> stop;
 * - true -> continue looping;
 * - Callback -> stop and fire the callback.
 * - number -> wait number ms and than continue
 */
```

#### Texts from HTML (SEO Friendly)

Instead of using the `string` array, you can place an `div` with your queue as `paragraphs` on the page. Then pass it to the queueWrite function as first param.
This allows bots and search engines, as well as users with JavaScript disabled, to see your text on the page.

```html
<div id="phrases" style="display: none;">
	<p>Welcome!</p>
	<p>to my <b>awesome</b> website.</p>
</div>
<!-- will read as: ['Welcome!', 'to my <b>awesome</b> website.'] -->
```

```js
writer.queueWrite('#phrases', queueInterval, loop)
```

### Pausing & Playing

You can pause and resume playing at any time.

```js
Writer.write('Some very cool header.').then(({ status, message }) => {
	// this will run when the writing stops.
	console.log(`${status}: ${message}`)
})

setTimeout(
	() => Writer.pause(), // will stop writing
	1000,
)

setTimeout(async () => {
	const { string } = await Writer.play() // continue writing
	console.log('Completed:', string) // will log after finished writing
}, 2000)
```

### One-Time-Use

For quick one-time writing.

```js
import { write, queueWrite } from 'glitched-writer'

write('Write this and BEGONE!', htmlElement, options, stepCB, finishCB)

queueWrite(texts, htmlElement, options, interval, loop, stepCB, finishCB)
```

### On Text Input

Don't be afraid to call write method on top of each oder.
New will stop the ongoing. But, it's good to `debounce` the event handler.

```js
import debounce from 'lodash.debounce'

const onInput = debounce(() => writer.write(inputEl.value), 500)

inputEl.addEventListener('input', onInput)
```

### Callbacks | Events

```js
// your html element:
textHtmlElement.addEventListener('gw-finished', e =>
	console.log('finished writing:', e.detail.string),
)

/**
 * Adding callbacks: writer.addCallback(type, callback)
 *
 * @param type "start" | "step" | "finish"
 * @param callback your callback function: (string, writerData) => {}
 */

const startCB = string => console.log('Started writing:', string)
// add
writer.addCallback('start', startCB)
// remove
writer.removeCallback('start', startCB)
```

### Add & Remove

`.add(string)` & `.remove(number)` are methods usefull for quick changes to the previous text.

```js
// Let's say current text content is: "Hello World"

Writer.add('!!!')
// -> Hello World!!!

Writer.remove(9)
// -> Hello
```

### Writing HTML

(**! Potentially dangerous !**) Let's you write text with html tags in it. Don't use on user-generated content.

```js
// You need to enable html option.
const Writer = new GlitchedWriter(htmlElement, { html: true })

Writer.write('<b>Be sure to click <a href="...">this!</a></b>')
```

### Letterize

Splits written text into series of `<span>` elements. Then writing letters seperately into these child-elements.

```js
// You need to enable html option.
const Writer = new GlitchedWriter(htmlElement, { letterize: true })

Writer.write('Hello there!')
/**
 * The shape of one Char:
 * span.gw-char (+ .gw-finished when compleated | .gw-changed with each change)
 * 	span.gw-ghosts
 * 	span.gw-letter (+ .gw-glitched when is a glitched letter)
 * 	span.gw-ghosts
 */
```

### Endless animation

Option `endless` let's you run the text animation until you disable that function.

This opens the door for some additional effects, like: **Show on hover** (e.g. on secret fields) or **refreshing text** to give it user attention.

Here is a [live example](https://codepen.io/thetarnav/pen/oNBLpxb).

```js
// SHOW ON HOVER
// First make the password scramble forever
writer.endless(true)
writer.write('PASSWORD')

// And disable endless option on hover
passEl.addEventListener('mouseover', () => writer.endless(false))
```

### Changing options post initialization

Options can be changed in 2 ways after instance creation.

```js
// Extending current options
writer.options.extend({
	html: true,
	maxGhosts: 10,
	// the rest will stay the same
})

// Reseting options
writer.options.set({
	letterize: true,
	oneAtATime: 4,
	// the rest will be set to default
})
```

### Optimizing CSS - Preventing Layour Shifts

Changing text rapidly can cause a lot of layout shift. These are few css tricks worth considering when using this package:

```css
// 1. "Warn" the browser that the text-content
// will be changing
.gw {
	will-change: contents;
}

// 2. It's good to make the element position absolute or fixed
// so it wont influence the rest of the layout
.gw {
	position: fixed;
}

// 3. Make the width and height constant,
// so it doesn't shift while writing
.gw {
	width: 80ch;
	height: 6rem;
}

// 4. If you can't or don't want to,
// then you should tell css that it will change,
// so it can prepare resources to handle it
.gw {
	will-change: contents, height, width;
}
```

### Available imports

List of all things that can be imported from `glitched-writer` module.

```ts
import GlitchedWriter, { // <-- GlitchedWriter class
	CustomOptions, // <-- Options type
	Callback, // <-- Callbacks type
	WriterDataResponse, // <-- Type of a data response in callbacks
	write, // <-- One time, standalone write function
	queueWrite, // <-- Standalone queue write function
	presets, // <-- Object with all prepared presets of options
	glyphs, // <-- Some glyph sets
	wait, // <-- Ulitity promise function, that can be used to wait some time
	create, // <-- Function serving as an alternative way to create GlitchedWriter instance.
} from 'glitched-writer'
```

---

## Presets

To use one of the available presets, You can simply write it's name when creating writer, in the place of options.
Available presets, as for now:

-  **[default](https://codepen.io/thetarnav/pen/MWWyPzY)** - Loaded automatically, featured on the GIF up top.

-  **[nier](https://codepen.io/thetarnav/pen/OJWNRor)** - Imitating the way text was appearing in the _NieR: Automata's UI_.

-  **[typewriter](https://codepen.io/thetarnav/pen/qBRpQpQ)** - Simple but feels like being written by a human: one letter at a time, with erasing enabled by default.

-  **[terminal](https://codepen.io/thetarnav/pen/mdRyqga)** - Similar to the typewriter preset but more "robotic". Characters flow smoothly (with stable interval), but with little "stutering" here and there.

-  **zalgo** - Inspired by the _"zalgo"_ or _"cursed text"_, Ghost characters mostly includes the unicode combining characters, which makes the text glitch vertically. Requires high "maxGhosts" to look good.

-  **[neo](https://codepen.io/thetarnav/pen/vYgYWbb)** - Recreated: _Justin Windle's ["Text Scramble Effect"](https://codepen.io/soulwire/pen/mErPAK)_

-  **[encrypted](https://codepen.io/thetarnav/pen/oNBLpxb)** - Simple Text Scramble effect, suits well displaying secret data, like passwords or card numbers. And generally looks good for more "casual" usecases - where you don't want too much "layout shifting", caused by rapid characters number changing.

-  **bitbybit** - Writes text word by word, in rhythmic but stattering manner.

-  **[cosmic](https://codepen.io/thetarnav/pen/ExWgYer)** - Text slowly appears from and vanishes to the hollowness of space. Use with preserved sequences of white space _(white-space: pre-wrap;)_

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

---

## Customizing behavior

There are many options you can tweak to customize the writting effect. Check out the [playground website](https://glitched-writer.site/) I've made, where you can test both presets and options.

**Range** values will result in random values for each step for every letter.

**Ghost** are "glitched letters" that gets rendered randomly in the time of writing, but aren't part of final string.

### Stylistic Options:

> \- options that set the visual effect.

```ts
steps?: [number, number] | number, // [1, 8]
interval?: [number, number] | number, // [60, 170]
delay?: [number, number] | number, // [0, 2000]
changeChance?: number, // 0.6
ghostChance?: number, // 0.2
maxGhosts?: number, // '0.2'
oneAtATime?: boolean | number | 'word', // 0 | false
glyphs?: string | string[] | Set<string>, // glyphs.full + glyphs.zalgo
glyphsFromText?: boolean, // false
fillSpace?: boolean, // true
mode?: 'normal' | 'matching' | 'erase' | 'clear', // 'matching'
```

-  **steps** - Number of **minimum** steps it takes one letter to reach it's goal one. Set to 0 if you want them to change to right letter in one step. (int)

-  **interval** - Interval between each step, for every letter. (int: ms)

-  **delay** - first delay each letter must wait before it starts working (int: ms)

-  **changeChance** - Chance of letter being replaced by a glitched character (p: 0-1)

-  **ghostChance** - Chance for ghost letter to appear (p: 0-1)

-  **maxGhosts** - Maximal number of ghosts to occur

   -  **int** - _(eg. 15) -> this will be the limit._
   -  **float** - _(eg. 0.25) -> Limit = maxGhosts \* goalString.length_

-  **oneAtATime** - Without this option enabled, letters in your string will animate all at once. Enabling this option, by setting it to **true** or any **intiger larger than 0**, will cause the string to be written from letter by letter, left to right. Number value, signifies how many letters will be typed at once.

   -  **"word"** - _now you can also set is to "word". Instead of writing letter by letter, or couple of letters, writer will divide goal text by words._

-  **glyphs** - A set of characters that can appear as ghosts or letters can change into them

-  **glyphsFromText** - If you want to add letters from written text to the glyph charset

-  **fillSpace** - With this **enabled** if letter gets erased ny replacing with space - to keep the same "width" of previous string, and to make letters _"disappear in space"_. If **disabled**, every letter will "stick" to the rest. To make it more clear (hopefully), here is an example "frame" of writing: **"Something farely long"** -> **"Short String"**.

   -  false - "XOSh8rt S3rinFv"
   -  true - " X OSh8rt S3rinF v "

-  **mode** - Writing mode - decides on how to prepare the Char Table.

   -  'matching' - _Will scan starting and goal string for matching characters and will try to build character map from that. Requires ghosts enabled (>0) to take effect_
   -  'normal' - _Wont do any matching, just converts starting string into character map._
   -  'erase' - _First Erases entire string and then writes your text._
   -  'erase_smart' - _Same as erase, but saves the matching begginging letters_
   -  'clear' - _Instantly deletes entire textContent and then writes your text._

### Control Options:

> \- options that control writer behavior.

```ts
html?: boolean, // false
letterize?: boolean, // false
endless?: boolean // false
fps?: number, // 60
```

-  **html** - _Potentially dangerous option._ If true, written string will be injected as html, not text content. It provides advanced text formating with html tags and more. But be sure to NOT enable it on user-provided content.

-  **letterize** - Instead of injecting written text to "textContent" or "innerHTML", it appends every letter of that text as a child span element. Then changing textContent of that span to current letter. It gives a lot of styling possibilities, as you can style ghosts, letters, and whole chars seperately, depending on current writer and char state.

-  **endless** - It will make the animation endless. _But why?_ Well, you can disable this option while the animation is running _( writer.endless(false) )_ and finish the animation when you want.

-  **fps** - Animation loop is done using requestAnimationFrame, with fps you can controll the maximum framerate of writing animation. Only actually matters for high refresh monitors. _(! wont have an effect with letterize enabled !_)

### Generator Options:

> \- custom functions used to generate variables contextually, for use in writing.

```ts
/**
 * @param char - Char for which to generate value
 * @param base - default function generating that value
 */

// generaing ghost/glitched char
genGlyph?: (char: Char, base: Function) => string

genDelay?: (char: Char, base: Function) => number // [ms]

genInterval?: (char: Char, base: Function) => number // [ms]
```

## The End - couple of final words

Thanks for checking out the Glitched Writer. Let me know, if you are using it somewhere - would love to see it working out there.

If you have any questions, just create new [discusion](https://github.com/thetarnav/glitched-writer/discussions) or [issue](https://github.com/thetarnav/glitched-writer/issues). Or just send me an email at gthetarnav@gmail.com, if you want.

Presets or feature ideas are also welcome :)
