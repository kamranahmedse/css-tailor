var path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

/**
 * Regex to get the required attribute off of the HTML
 * @type {RegExp}
 */
var lookupRegex = /(?:(\bclass\b)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^"'<>\s]+))\s*)+/g;

/**
 * Configuration variables
 * @type {Object}
 */
var config = {
    newLineChar: '\n',
    tabSpacing: 4
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
    regex: /(^[a-z]{1,23})([0-9]{1,4})?/,

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
 * Gets files from the passed path recursively
 *
 * @param dirPath      Path to get the files from
 * @param callback  Function which will be called for every found file
 */
var getFiles = function (dirPath, callback) {

    if (!fs.existsSync(dirPath)) {
        console.error("Path does not exist", dirPath);
        return;
    }

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
            value: pieces[2] + (pieces[3] || 'px')
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
            beautified: '',
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

            // Assemble CSS in the form of minified content, beautified content and object
            tailoredCss['minified'] += css.selector + '{' + css.property + ':' + css.value + '}';
            tailoredCss['beautified'] += css.selector + ' {' + config.newLineChar +
                tabSpacing + css.property + ':' + css.value + ';' + config.newLineChar +
                '}' + config.newLineChar;

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
var getPathHtml = function (location) {

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

module.exports = {

    /**
     * Generate CSS from HTML string
     *
     * @param htmlContent
     * @param options
     * @returns {{}|{minified: '', beautified: '', object: {}}}
     */
    tailorContent: function (htmlContent, options) {

        var extractedValues = extractAttributeValues(lookupRegex, htmlContent);

        if (!extractedValues || extractedValues.length === 0) {
            console.warn('No properties found to tailor CSS');
            return {};
        }

        return generateCss(extractedValues);
    },

    /**
     * Generate CSS for any HTML files at provided paths
     *
     * @param paths Array|string
     * @param options
     * @returns {*|string}
     */
    tailorPath: function (paths, options) {

        var htmlContent = '';

        if (_.isArray(paths)) {
            paths.forEach(function (location) {
                htmlContent += getPathHtml(location);
            });
        } else if (_.isString(paths)) {
            htmlContent += getPathHtml(paths);
        }

        return this.tailorContent(htmlContent, options);
    }

};
