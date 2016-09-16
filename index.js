var path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

var lookupRegex = /(?:(\bclass\b)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^"'<>\s]+))\s*)+/g;

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
 * @param attrRegex
 * @param htmlContent
 * @returns {Array}
 */
var extractAttributes = function (attrRegex, htmlContent) {
    var matches = [],
        match;

    do {
        match = attrRegex.exec(htmlContent);
        match && match[2] && matches.push(match[2].trim());
    } while (match);

    return _.uniq(matches);
};

module.exports = {

    tailorContent: function (htmlContent, options) {
        var classNames = extractAttributes(lookupRegex, htmlContent);
        console.log(classNames);
    },

    tailorPath: function (paths, options) {

        var htmlContent = '';

        getFiles(paths, function (filePath) {
            var extension = path.extname(filePath) || '';

            if (extension.toLowerCase() == '.html') {
                htmlContent += fs.readFileSync(filePath);
            }
        });

        this.tailorContent(htmlContent, options);
    }

};
