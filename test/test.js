var assert = require('assert');
var tailor = require('../');

describe('tailor-js', function () {

    it('can generate css from html string', function (done) {
        var generatedCss = tailor.tailorContent('<div class="container pt30"></div>');
        var expectedCss = {
            minified: '.pt30{padding-top:30px;}',
            formatted: '[Not Adding - It would be messy to add here]',
            object: {
                ".pt30": {
                    properties: [{
                        property: 'padding-top',
                        value: '30px'
                    }]
                }
            }
        };

        assert.equal(generatedCss.minified, expectedCss.minified);
        done();
    });

    it('returns empty object when there are no required properties', function (done) {
        var generatedCss = tailor.tailorContent('<div class="container"></div>');
        var expectedCss = {
            minified: '',
            formatted: '',
            object: {}
        };

        assert.equal(JSON.stringify(generatedCss), JSON.stringify(expectedCss));
        done();
    });

    it('can read and assign units from selector', function (done) {
        var generatedCss = tailor.tailorContent('<div class="container w30em"></div>');
        var expectedCss = {
            minified: '.w30em{width:30em;}',
            formatted: '[Not Adding - It would be messy to add here]',
            object: {
                ".w30em": {
                    properties: [{
                        property: 'width',
                        value: '30em'
                    }]
                }
            }
        };

        assert.equal(generatedCss.minified, expectedCss.minified);
        done();
    });

    it('can take generate CSS from file', function (done) {
        var generatedCss = tailor.tailorPath(__dirname + '/fixtures/demo-1.html');
        var expectedCss = {
            minified: '.w1200{width:1200px;}',
            formatted: '[Not Adding - It would be messy to add here]',
            object: {
                ".w1200": {
                    properties: [{
                        property: 'width',
                        value: '1200px'
                    }]
                }
            }
        };

        assert.equal(generatedCss.minified, expectedCss.minified);
        done();
    });

    it('can read HTML files from any directory depth and generate CSS', function (done) {
        var generatedCss = tailor.tailorPath(__dirname + '/fixtures/');
        var expectedCss = {
            minified: '.w1200{width:1200px;}.p40{padding:40px;}.mb30{margin-bottom:30px;}',
            formatted: '[Not Adding - It would be messy to add here]',
            object: {
                ".w1200": {
                    properties: [{
                        property: 'width',
                        value: '1200px'
                    }]
                },
                ".p40": {
                    properties: [{
                        property: 'padding',
                        value: '40px'
                    }]
                },
                ".mb30": {
                    properties: [{
                        property: 'margin-bottom',
                        value: '30px'
                    }]
                }
            }
        };

        assert.equal(generatedCss.minified, expectedCss.minified);
        done();
    });

    it('can read HTML and generate CSS from an array of paths', function (done) {
        var generatedCss = tailor.tailorPath([
            __dirname + '/fixtures/demo-1.html',
            __dirname + '/fixtures/sample-dir'
        ]);
        var expectedCss = {
            minified: '.w1200{width:1200px;}.p40{padding:40px;}.mb30{margin-bottom:30px;}',
            formatted: '[Not Adding - It would be messy to add here]',
            object: {
                ".w1200": {
                    properties: [{
                        property: 'width',
                        value: '1200px'
                    }]
                },
                ".p40": {
                    properties: [{
                        property: 'padding',
                        value: '40px'
                    }]
                },
                ".mb30": {
                    properties: [{
                        property: 'margin-bottom',
                        value: '30px'
                    }]
                }
            }
        };

        assert.equal(generatedCss.minified, expectedCss.minified);
        done();
    });
});
