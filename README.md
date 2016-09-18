# css-tailor
[![Build Status](https://secure.travis-ci.org/kamranahmedse/css-tailor.png?branch=master)](https://travis-ci.org/kamranahmedse/css-tailor)
> Automatically generate CSS from your HTML classes

Utility that turns the classes applied upon the **DOM elements to CSS**. So that you don't have to manually write the CSS for those minor UI enhancements like increasing the padding, adding a little margin, changing the font size, applying a border radius, pumping up the line-height a bit etc. 

## Install

> If you are looking for usage as a preprocessor, check [gulp-css-tailor](https://github.com/kamranahmedse/gulp-css-tailor)

```bash
$ npm install --save-dev css-tailor
```

## Usage

> All you have to do is specify the CSS class on an element: CSS will be generated and written to a CSS file of your liking or returned for any programmatical use.

All you have to do is specify any HTML class as follows

```
[formula][value][unit] # If you donot provide the unit, `px` will be used.
```

For example; `mt25` translates to `margin-top: 25px`, `fs14px` to `font-size: 14px;` etc. 

The list of supported formulae and examples are given in a section ahead

#### From a Directory

You can provide the path in the form of

- `string` Path to a single file or a directory
- `array` An array of directory paths, file paths or a mix of both the directory and file paths

```js
var tailor = require('css-tailor');

// Will generate the output file [if required] and return the generated CSS
var generatedCss = tailor.generatePathCss('resources/html/', options)
```

#### From HTML string

Also you can generate CSS from the HTML string

```js
var tailor = require('css-tailor');

// Will generate the output file [if required] and return the generated CSS
var generatedCss = tailor.generateCss('<html>...</html>', options)
```

**Options**
Both the functions above accept an object as a second argument having following options. (Values specified below are the defaults)

```js
var options = {
    tabSpacing: 4,          // Tab spacing for the formatted CSS
    outputPath: '',         // Path to the output file where CSS is to be generated
    minifyOutput: false,    // Whether to minify the output while generating CSS
    setImportant: false     // Will add the `!important` flag to all the CSS properties
};
```

## Suppored Formulae

Currently supported styles are as follows.

| Formula | CSS Property     | Example Usage                                    |
|---------|------------------|--------------------------------------------------|
| `p`     | `padding`        | `p10` will translate to `padding: 10px`          |
| `pt`    | `padding-top`    | `pt20` will translate to `padding-top: 20px;`    |
| `pb`    | `padding-bottom` | `pb10` will translate to `padding-bottom: 10px;` |
| `pr`    | `padding-right`  | `pr20` will translate to `padding-right: 20px;`  |
| `pl`    | `padding-left`   | `pl23` will translate to `padding-left: 23px;`   |
| `m`     | `margin`         | `m20` will translate to `margin: 20px`           |
| `mt`    | `margin-top`     | `mt20` will translate to `margin-top: 20px;`     |
| `mb`    | `margin-bottom`  | `mb20` will translate to `margin-bottom: 20px;`  |
| `ml`    | `margin-left`    | `ml50` will translate to `margin-left: 50px;`    |
| `mr`    | `margin-right`   | `mr30` will translate to `margin-right: 30px;`   |
| `w`     | `width`          | `w200` will translate to `width: 200px`          |
| `h`     | `height`         | `h60` will translate to `height: 60px;`          |
| `br`    | `border-radius`  | `br5` will translate to `border-radius: 5px;`    |
| `fs`    | `font-size`      | `fs15` will translate to `font-size: 15px`       |
| `fw`    | `font-weight`    | `fw400` will translate to `font-weight: 400px`   |
| `lh`    | `line-height`    | `lh20em` will translate to `line-height: 20em`   |
| `t`     | `top`            | `t6` will translate to `top: 6px;`               |
| `l`     | `left`           | `l30` will translate to `left: 30px`             |
| `b`     | `bottom`         | `b20em` will translate to `bottom: 20em;`        |
| `r`     | `right`          | `r20em` will translate to `right: 20em;`         |


## Notes for Units

All the default CSS units are supported. You can specify it and relevant CSS unit will be used
 
- Units including `px, pt, em, p, vh, vw, vmin, ex, cm, in, mm, pc` will translate to the same unit in CSS 
- If you don't provide any unit `px` will be used
- If you need `%` specify it as `p` e.g. `w50p` will get translated to `width: 50%`
- If no unit is needed, specify `n` e.g. `fw600n` will translate to `font-weight: 600`

## License

MIT &copy; [Kamran Ahmed](http://kamranahmed.info) 
