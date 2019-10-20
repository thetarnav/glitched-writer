# Glitched Writer
[![](https://data.jsdelivr.com/v1/package/npm/glitched-writer/badge)](https://www.jsdelivr.com/package/npm/glitched-writer)

### What it does:

- Edits **textContent** of chosen html element with a (custom or not) set of "glitched" characters until it writes wanted text.
- Can be used as an object (instance of **GlitchedWriter** class) so that on multiple write function calls the writing process will be automatically reset and write the lastest inputed message.
- The write function is an asynchronous so .then can be used.
- Finished writing will cause CustomEvent **glitchWrote** dispatch on html element.
- The html element gets **glitch-writing** class for the process of writing.

------------

### Code Examples:
- Standalone function call with .then:

`glitchWrite( htmlElement, 'text to write' ).then(console.log)`

- Creating GlitchedWriter class instance for later use:

`const writerObject = setGlitchedWriter( htmlElement, 'cUsToM gLiTcH cHaRs', {stepsMax: 10} )`

- Writing using instance: ('' <- means that glitched characters will be taken from the inputed text characters)

`writerObject.write( 'message', '' )`

- Adding event listener (**e.detail** holds Object with usefull **text** property):

`htmlElement.addEventListener('glitchWrote', e => console.log( e.detail.text ))`

------------

### Links:

- [GitHub](https://github.com/thetarnav/glitched-writer "GitHub")
- [npm](https://www.npmjs.com/package/glitched-writer "npm")
- [JSDelivr](https://www.jsdelivr.com/package/npm/glitched-writer "JSDelivr")
- [Codepen DEMO](https://codepen.io/thetarnav/pen/MWWyPzY "Codepen DEMO")
