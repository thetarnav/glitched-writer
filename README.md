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

## Usage:

### Installation

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

-  Standalone function call with .then:

`glitchWrite( htmlElement, 'text to write' ).then(console.log)`

-  Creating GlitchedWriter class instance for later use:

`const writerObject = setGlitchedWriter( htmlElement, { glitches: 'cUsToM gLiTcH cHaRs', stepsMax: 10} )`

-  Writing using instance: (glitchesFromString <- means that glitched characters will be taken from the inputed text characters)

`writerObject.write( 'message', {glitchesFromString: true} )`

-  Adding event listener (**e.detail** holds Object with usefull **text** property):

`htmlElement.addEventListener('glitchWrote', e => console.log( e.detail.text ))`

---

#### settings _/w defaults_:

| setting | default |

| ------------ | ------------ |

| steps | [0, 6] _(min & max)_ |

| delay | [140, 400] _(min & max)_ |

| firstDelay | [0, 1700] |

| ghostsProbability | 0.1 |

| maxGhosts | 7 |

| glitches | 'ABCDĐEFGHIJKLMNOPQRSTUVWXYZabcdđefghijklmnopqrstuvwxyzĄąĆćŻżŹźŃńóŁłАБВГҐДЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрстћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈέΉίϊΐΊόΌύΰϋΎΫΏĂÂÊÔƠƯăâêôơư 一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何 ĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/&<-+÷×=>$€£¥¢:;,.\* •°·…±†‡æ«»¦¯—–~˜¨_øÞ¿▬▭▮▯┐└╛╟╚╔╘╒╓┘┌░▒▓○‼' |

| glitchesFromString | false |

| oneAtATime | false |

| startText | **'previous'** _(or anything rly)_, 'matchingOnly', 'eraseWhole' |

| instantErase | false |

| combineGlitches | false |

| preset | 'default', 'nier', 'normal' |

| className | 'glitch-writing' |

| leadingChar | { char: '', onTyping: false } |

---

#### Links:

-  [GitHub](https://github.com/thetarnav/glitched-writer 'GitHub')

-  [npm](https://www.npmjs.com/package/glitched-writer 'npm')

-  [JSDelivr](https://www.jsdelivr.com/package/npm/glitched-writer 'JSDelivr')

-  [Codepen DEMO](https://codepen.io/thetarnav/pen/MWWyPzY 'Codepen DEMO')# Glitched Writer

[![](https://data.jsdelivr.com/v1/package/npm/glitched-writer/badge)](https://www.jsdelivr.com/package/npm/glitched-writer)

[![glitched-writer-preview](https://user-images.githubusercontent.com/24491503/67164275-06ab6900-f379-11e9-81ac-cab76dbc8dcd.gif)](https://codepen.io/thetarnav/pen/MWWyPzY)

### What it does:

-  Edits **textContent** of chosen html element with a (custom or not) set of "glitched" characters until it writes wanted text.

-  Can be used as an object (instance of **GlitchedWriter** class) so that on multiple write function calls the writing process will be automatically reset and write the lastest inputed message.

-  The write function is an asynchronous so .then can be used.

-  Finished writing will cause CustomEvent **glitchWrote** dispatch on html element.

-  The html element gets **glitch-writing** class for the process of writing.

---

### Code Examples:

-  Standalone function call with .then:

`glitchWrite( htmlElement, 'text to write' ).then(console.log)`

-  Creating GlitchedWriter class instance for later use:

`const writerObject = setGlitchedWriter( htmlElement, { glitches: 'cUsToM gLiTcH cHaRs', stepsMax: 10} )`

-  Writing using instance: (glitchesFromString <- means that glitched characters will be taken from the inputed text characters)

`writerObject.write( 'message', {glitchesFromString: true} )`

-  Adding event listener (**e.detail** holds Object with usefull **text** property):

`htmlElement.addEventListener('glitchWrote', e => console.log( e.detail.text ))`

---

#### settings _/w defaults_:

| setting | default |

| ------------ | ------------ |

| steps | [0, 6] _(min & max)_ |

| delay | [140, 400] _(min & max)_ |

| firstDelay | [0, 1700] |

| ghostsProbability | 0.1 |

| maxGhosts | 7 |

| glitches | 'ABCDĐEFGHIJKLMNOPQRSTUVWXYZabcdđefghijklmnopqrstuvwxyzĄąĆćŻżŹźŃńóŁłАБВГҐДЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрстћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈέΉίϊΐΊόΌύΰϋΎΫΏĂÂÊÔƠƯăâêôơư 一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何 ĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/&<-+÷×=>$€£¥¢:;,.\* •°·…±†‡æ«»¦¯—–~˜¨_øÞ¿▬▭▮▯┐└╛╟╚╔╘╒╓┘┌░▒▓○‼' |

| glitchesFromString | false |

| oneAtATime | false |

| startText | **'previous'** _(or anything rly)_, 'matchingOnly', 'eraseWhole' |

| instantErase | false |

| combineGlitches | false |

| preset | 'default', 'nier', 'normal' |

| className | 'glitch-writing' |

| leadingChar | { char: '', onTyping: false } |

---

#### Links:

-  [GitHub](https://github.com/thetarnav/glitched-writer 'GitHub')

-  [npm](https://www.npmjs.com/package/glitched-writer 'npm')

-  [JSDelivr](https://www.jsdelivr.com/package/npm/glitched-writer 'JSDelivr')

-  [Codepen DEMO](https://codepen.io/thetarnav/pen/MWWyPzY 'Codepen DEMO')
