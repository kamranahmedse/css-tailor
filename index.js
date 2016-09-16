var path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    util = require('util');

var defaultOptions = {},
    lookupRegex = /(?:(\bclass\b)\s*=\s*("[^"]*"|'[^']*'|[^"'<>\s]+)\s*)+/;

/**
 * Gets files from the passed path recursively
 *
 * @param path      Path to get the files from
 * @param callback  Function which will be called for every found file
 */
var getFiles = function (path, callback) {
    if (!fs.existsSync(path)) {
        console.error("Path does not exist", path);
        return;
    }

    var files = fs.readdirSync(path);
    files.forEach(function (file) {
        var fileName = path.join(path, file),
            stat = fs.lstatSync(fileName);

        if (stat.isDirectory()) {
            getFiles(fileName); //recurse
        } else {
            callback(fileName);
        }
    });
};

module.exports = {

    tailorContent: function (htmlContent, options) {
        console.log(htmlContent);
    },

    tailorPath: function (path, options) {
        var htmlContent = '';
        getFiles(path, function (filePath) {
            var extension = fs.extname(filePath) || '';

            if (extension.toLowerCase() == 'html') {
                htmlContent += fs.readFileSync(filePath);
            }
        });

        this.tailorContent(htmlContent, options);
    }
};
