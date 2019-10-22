# Glitched Writer
[![](https://data.jsdelivr.com/v1/package/npm/glitched-writer/badge)](https://www.jsdelivr.com/package/npm/glitched-writer)

![glitched-writer-preview](https://user-images.githubusercontent.com/24491503/67164275-06ab6900-f379-11e9-81ac-cab76dbc8dcd.gif)

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

`const writerObject = setGlitchedWriter( htmlElement, { glitches: 'cUsToM gLiTcH cHaRs', stepsMax: 10} )`

- Writing using instance: (glitchesFromString <- means that glitched characters will be taken from the inputed text characters)

`writerObject.write( 'message', {glitchesFromString: true} )`

- Adding event listener (**e.detail** holds Object with usefull **text** property):

`htmlElement.addEventListener('glitchWrote', e => console.log( e.detail.text ))`

------------

#### settings:
###### defaults:
|  setting  | default  |
| ------------ | ------------ |
|  stepsMin  |  0  |
|  stepsMax |  6   |
| delayMin |  140 |
| delayMax  | 400  |
| ghostsProbability  | 0.1  |
| maxGhosts  |  7 |
| glitches  | 'ABCDĐEFGHIJKLMNOPQRSTUVWXYZabcdđefghijklmnopqrstuvwxyzĄąĆćŻżŹźŃńóŁłАБВГҐДЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрстћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωάΆέΈέΉίϊΐΊόΌύΰϋΎΫΏĂÂÊÔƠƯăâêôơư一二三四五六七八九十百千上下左右中大小月日年早木林山川土空田天生花草虫犬人名女男子目耳口手足見音力気円入出立休先夕本文字学校村町森正水火玉王石竹糸貝車金雨赤青白数多少万半形太細広長点丸交光角計直線矢弱強高同親母父姉兄弟妹自友体毛頭顔首心時曜朝昼夜分週春夏秋冬今新古間方北南東西遠近前後内外場地国園谷野原里市京風雪雲池海岩星室戸家寺通門道話言答声聞語読書記紙画絵図工教晴思考知才理算作元食肉馬牛魚鳥羽鳴麦米茶色黄黒来行帰歩走止活店買売午汽弓回会組船明社切電毎合当台楽公引科歌刀番用何ĂÂÊÔƠƯăâêôơư1234567890‘?’“!”(%)[#]{@}/&<-+÷×=>$€£¥¢:;,.* •°·…±†‡æ«»¦¯—–~˜¨_øÞ¿▬▭▮▯┐└╛╟╚╔╘╒╓┘┌░▒▓○‼'  |
| glitchesFromString  |  false |
| oneAtATime  |  false |
| clearStart  |  false |


------------

#### Links:

- [GitHub](https://github.com/thetarnav/glitched-writer "GitHub")
- [npm](https://www.npmjs.com/package/glitched-writer "npm")
- [JSDelivr](https://www.jsdelivr.com/package/npm/glitched-writer "JSDelivr")
- [Codepen DEMO](https://codepen.io/thetarnav/pen/MWWyPzY "Codepen DEMO")
