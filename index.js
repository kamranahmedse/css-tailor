'use strict';

var path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  _ = require('lodash');

/**
 * Regex to get the required attribute values off of the HTML
 * @type {RegExp}
 */
var lookupRegex = /(?:(\bclass\b)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^"'<>\s]+))\s*)+/g;

/**
 * Configuration variables
 *
 * @type {Object}
 */
var config = {},
  lazyHtml = '',      // Will be holding `HTML` string when running in lazy generation
  lazyPaths = [],     // Will be holding `paths` when running in lazy generation
  defaults = {
    newLineChar: '\n',
    tabSpacing: 4,
    outputPath: '',
    minifyOutput: false,
    setImportant: false
  };

/**
 * Mapping for the numerical properties to their respective CSS property. Later on we may
 * have another object for full property values i.e. pos-r for position relative etc.
 *
 * @type {Object}
 */
var propertyMapping = {

  /**
   * Regex to check if some property value is tailorable for any of the properties below.
   * @note The regex only matches the numerical valued properties. It will be modified later on
   *       to support other properties as well e.g. pos-r: "position: relative" etc.
   *
   * @type {RegExp}
   */
  regex: /(^[a-z]{1,23})([0-9]{1,4})(\w*)/,

  /**
   * Aliases mapping to their relevant CSS properties
   */
  t: 'top',
  b: 'bottom',
  l: 'left',
  r: 'right',

  w: 'width',
  h: 'height',

  p: 'padding',
  m: 'margin',

  br: 'border-radius',
  fs: 'font-size',
  fw: 'font-weight',
  lh: 'line-height',

  mt: 'margin-top',
  mb: 'margin-bottom',
  ml: 'margin-left',
  mr: 'margin-right',

  pt: 'padding-top',
  pb: 'padding-bottom',
  pl: 'padding-left',
  pr: 'padding-right'
};

/**
 * Defines the mapping for characters to their relevant units
 *
 * @type {Object}
 */
var unitMapping = {
  default: 'px',      // If no mapping found or empty unit given then use this
  px: 'px',
  pt: 'pt',
  em: 'em',
  p: '%',
  vh: 'vh',
  vw: 'vw',
  vmin: 'vmin',
  ex: 'ex',
  cm: 'cm',
  in: 'in',
  mm: 'mm',
  pc: 'pc',
  n: ''       // None
};

/**
 * Gets files from the passed path recursively
 *
 * @param dirPath      Path to get the files from
 * @param callback  Function which will be called for every found file
 */
var getFiles = function (dirPath, callback) {

  var files = fs.readdirSync(dirPath);
  files.forEach(function (file) {
    var fileName = path.join(dirPath, file),
      stat = fs.lstatSync(fileName);

    if (stat.isDirectory()) {
      getFiles(fileName, callback); //recurse
    } else {
      callback(fileName);
    }
  });
};

/**
 * Extracts the attribute values from the passed HTML content
 *
 * @param attrRegex
 * @param htmlContent
 * @returns {Array}
 */
var extractAttributeValues = function (attrRegex, htmlContent) {

  var matches = [],
    match;

  do {
    match = attrRegex.exec(htmlContent);
    match && match[2] && matches.push(match[2]);

  } while (match);

  return _.uniq(matches);
};

/**
 * Gets the mapping for the
 *
 * @param actualUnit
 * @returns {string}
 */
var getUnit = function (actualUnit) {
  actualUnit = actualUnit || '';
  actualUnit = actualUnit.trim();

  return (unitMapping[actualUnit] === undefined) ? unitMapping.default : unitMapping[actualUnit];
};

/**
 * Gets the mapped CSS from the provided property if possible; Otherwise null
 *
 * @param property
 * @returns {null|Object}
 */
var getMappedCss = function (property) {

  var pieces = property.match(propertyMapping.regex),
    cssProperty = pieces && propertyMapping[pieces[1]];

  return cssProperty && {
      selector: '.' + property,
      property: cssProperty,
      value: pieces[2] + getUnit(pieces[3] || unitMapping.default) + (config.setImportant ? ' !important' : '')
    };
};

/**
 * Generates the CSS from the extracted attribute values
 *
 * @param extractedValues
 * @returns {Object}
 */
var generateCss = function (extractedValues) {

  var tabSpacing = _.repeat(' ', config.tabSpacing),
    tailoredCss = {
      minified: '',
      formatted: '',
      object: {}
    };

  // For each of the extracted attribute values, parse each value
  extractedValues.forEach(function (attrValue) {

    attrValue = attrValue.replace(/\s+/g, ' ');
    var valueItems = attrValue.split(' ');

    // Since each value can have multiple properties (e.g. `p10 mt40`)
    // Split each value and iterate to generate any possible CSS
    valueItems.forEach(function (valueItem) {

      var css = getMappedCss(valueItem);
      if (!css) {
        return;
      }

      // Assemble CSS in the form of minified content, formatted content and object
      tailoredCss['minified'] += css.selector + '{' + css.property + ':' + css.value + ';}';
      tailoredCss['formatted'] += css.selector + ' {' + config.newLineChar +
        tabSpacing + css.property + ': ' + css.value + ';' + config.newLineChar +
        '}' + config.newLineChar + config.newLineChar;

      tailoredCss['object'][css.selector] = {
        properties: [
          {
            property: css.property,
            value: css.value
          }
        ]
      };
    });
  });

  return tailoredCss;
};

/**
 * Gets the file content if it is an HTML file
 *
 * @param filePath
 * @returns {string}
 */
var readHtmlFile = function (filePath) {

  var extension = path.extname(filePath) || '',
    html = '';

  if (extension.toLowerCase() == '.html') {
    html = fs.readFileSync(filePath);
  }

  return html;
};

/**
 * Gets the HTML content from the passed path
 *
 * @param location
 * @returns {string}
 */
var pathToHtml = function (location) {

  if (!_.isString(location)) {
    throw 'Error! pathToHtml: Location must be string ' + (typeof location) + ' given';
  }

  var htmlContent = '',
    lstat = fs.lstatSync(location);

  if (lstat.isDirectory()) {
    getFiles(location, function (filePath) {
      htmlContent += readHtmlFile(filePath);
    });
  } else if (lstat.isFile()) {
    htmlContent += readHtmlFile(location);
  }

  return htmlContent;
};

/**
 * Creates the output file using the generated CSS
 * @param css
 */
var createOutputFile = function (css) {

  if (!css || !config.outputPath) {
    return;
  }


  var contents = config.minifyOutput ? css.minified : css.formatted,
    outputPath = config.outputPath;

  if (!_.endsWith(outputPath, '.css')) {
    throw 'Error! Full output path is required including css filename e.g. /assets/css/tailored.css';
  }

  mkdirp.sync(path.dirname(outputPath));
  fs.writeFileSync(outputPath, contents);
};

/**
 * Generates HTML from the given paths
 *
 * @param paths
 * @returns {string}
 */
var pathsToHtml = function (paths) {

  var htmlContent = '';

  if (_.isArray(paths)) {
    paths.forEach(function (location) {
      htmlContent += pathToHtml(location);
    });
  } else if (_.isString(paths)) {
    htmlContent += pathToHtml(paths);
  }

  return htmlContent;
};

/**
 * Updates the options
 *
 * @param options
 */
var updateOptions = function (options) {
  var tempDefaults = _.cloneDeep(defaults);

  options = options || {};
  config = _.merge(tempDefaults, options);
};

module.exports = {

  /**
   * Pushes HTML for the lazy generation
   *
   * @param htmlContent
   */
  pushHtml: function (htmlContent) {
    lazyHtml += htmlContent;
  },

  /**
   * Pushes path for the lazy generation
   * 
   * @param path
   */
  pushPath: function (path) {
    lazyPaths.push(path);
  },

  /**
   * Generates CSS from the lazily set content
   *
   * @returns {{}|{minified: '', formatted: '', object: {}}}
   */
  generateLazy: function (options) {

    if (_.isEmpty(lazyHtml) && _.isEmpty(lazyPaths)) {
      throw 'Error! No HTML or path given for lazy generation';
    }

    updateOptions(options);

    var htmlContent = '';

    htmlContent += pathsToHtml(lazyPaths);
    htmlContent += lazyHtml;

    // Reset lazy variables
    lazyPaths = '';
    lazyHtml = [];

    return this.generateCss(htmlContent);
  },

  /**
   * Generate CSS from HTML string
   *
   * @param htmlContent
   * @param options
   * @returns {{}|{minified: '', formatted: '', object: {}}}
   */
  generateCss: function (htmlContent, options) {

    updateOptions(options);

    var extractedValues = extractAttributeValues(lookupRegex, htmlContent),
      generatedCss = {};

    if (!extractedValues || extractedValues.length === 0) {
      return {
        minified: '',
        formatted: '',
        object: {}
      };
    }

    generatedCss = generateCss(extractedValues);

    createOutputFile(generatedCss);

    return generatedCss;
  },

  /**
   * Generate CSS for any HTML files at provided paths
   *
   * @param paths Array|string
   * @param options
   * @returns {*|string}
   */
  generatePathCss: function (paths, options) {

    if (_.isEmpty(paths)) {
      throw 'Error! path is required';
    }

    var htmlContent = pathsToHtml(paths);

    return this.generateCss(htmlContent, options);
  }

};
