const assert = require('assert');
const tailor = require('../');
const fs = require('fs');
const path = require('path');

describe('tailor-js', function () {
  it('can generate css from html string', function (done) {
    const generatedCss = tailor.generateCss('<div class="container pt30"></div>');
    const expectedCss = {
      minified: '.pt30{padding-top:30px;}',
      formatted: '[Not Adding - It would be messy to add here]',
      object: {
        '.pt30': {
          properties: [{
            property: 'padding-top',
            value: '30px'
          }]
        }
      }
    };

    assert.equal(generatedCss.minified, expectedCss.minified);
    assert.equal(JSON.stringify(generatedCss.object), JSON.stringify(expectedCss.object));

    done();
  });

  it('can optionally set all styles to important', function (done) {
    const generatedCss = tailor.generateCss('<div class="container pt30"></div>', {
      setImportant: true
    });
    const expectedCss = {
      minified: '.pt30{padding-top:30px !important;}',
      formatted: '[Not Adding - It would be messy to add here]',
      object: {
        '.pt30': {
          properties: [{
            property: 'padding-top',
            value: '30px !important'
          }]
        }
      }
    };

    assert.equal(generatedCss.minified, expectedCss.minified);
    assert.equal(JSON.stringify(generatedCss.object), JSON.stringify(expectedCss.object));

    done();
  });

  it('returns empty object when there are no required properties', function (done) {
    const generatedCss = tailor.generateCss('<div class="container"></div>');
    const expectedCss = {
      minified: '',
      formatted: '',
      object: {}
    };

    assert.equal(JSON.stringify(generatedCss), JSON.stringify(expectedCss));
    assert.equal(JSON.stringify(generatedCss.object), JSON.stringify(expectedCss.object));

    done();
  });

  it('can read and assign units from selector', function (done) {
    const generatedCss = tailor.generateCss('<div class="container w30em fs40"><span class="head fw600n"></span><span class="w40p"></span></div>');
    const expectedCss = {
      minified: '.w30em{width:30em;}.fs40{font-size:40px;}.fw600n{font-weight:600;}.w40p{width:40%;}',
      formatted: '[Not Adding - It would be messy to add here]',
      object: {
        '.w30em': {
          properties: [{
            property: 'width',
            value: '30em'
          }]
        },
        '.fs40': {
          properties: [{
            property: 'font-size',
            value: '40px'
          }]
        },
        '.fw600n': {
          properties: [{
            property: 'font-weight',
            value: '600'
          }]
        },
        '.w40p': {
          properties: [{
            property: 'width',
            value: '40%'
          }]
        }
      }
    };

    assert.equal(generatedCss.minified, expectedCss.minified);
    assert.equal(JSON.stringify(generatedCss.object), JSON.stringify(expectedCss.object));
    done();
  });

  it('can take HTML from file and generate CSS', function (done) {
    const generatedCss = tailor.generatePathCss(__dirname + '/fixtures/demo-1.html');
    const expectedCss = {
      minified: '.w1200{width:1200px;}',
      formatted: '[Not Adding - It would be messy to add here]',
      object: {
        '.w1200': {
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
    const generatedCss = tailor.generatePathCss(__dirname + '/fixtures/sample-dir-2/');
    const expectedCss = {
      minified: '.p40{padding:40px;}.mb30{margin-bottom:30px;}.w1200{width:1200px;}',
      formatted: '[Not Adding - It would be messy to add here]',
      object: {
        '.p40': {
          properties: [{
            property: 'padding',
            value: '40px'
          }]
        },
        '.mb30': {
          properties: [{
            property: 'margin-bottom',
            value: '30px'
          }]
        },
        '.w1200': {
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

  it('can read HTML and generate CSS from an array of paths', function (done) {
    const generatedCss = tailor.generatePathCss([
      __dirname + '/fixtures/demo-1.html',
      __dirname + '/fixtures/sample-dir'
    ]);
    const expectedCss = {
      minified: '.w1200{width:1200px;}.p40{padding:40px;}.mb30{margin-bottom:30px;}',
      formatted: '[Not Adding - It would be messy to add here]',
      object: {
        '.w1200': {
          properties: [{
            property: 'width',
            value: '1200px'
          }]
        },
        '.p40': {
          properties: [{
            property: 'padding',
            value: '40px'
          }]
        },
        '.mb30': {
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

  it('can lazily generate CSS', function (done) {

    tailor.pushHtml('<div class="container pt30"></div>');
    tailor.pushHtml('<div class="container mb40"></div>');
    tailor.pushPath(__dirname + '/fixtures/demo-1.html');

    const generatedCss = tailor.generateLazy();
    const expectedCss = {
      minified: '.w1200{width:1200px;}.pt30{padding-top:30px;}.mb40{margin-bottom:40px;}',
      formatted: '[Not Adding - It would be messy to add here]',
      object: {
        '.w1200': {
          properties: [{
            property: 'width',
            value: '1200px'
          }]
        },
        '.pt30': {
          properties: [{
            property: 'padding-top',
            value: '30px'
          }]
        },
        '.mb40': {
          properties: [{
            property: 'margin-bottom',
            value: '40px'
          }]
        }
      }
    };

    assert.equal(generatedCss.minified, expectedCss.minified);
    assert.equal(JSON.stringify(generatedCss.object), JSON.stringify(expectedCss.object));

    done();
  });

  it('can generate minified CSS file', function (done) {

    const outputFilePath = __dirname + '/fixtures/sample-dir/assets/css/tailored.min.css',
      generatedCss = tailor.generatePathCss(__dirname + '/fixtures/', {
        outputPath: outputFilePath,
        minifyOutput: true
      });

    const expectedCss = {
      minified: '.w1200{width:1200px;}.p40{padding:40px;}.mb30{margin-bottom:30px;}',
      formatted: '[Not Adding - It would be messy to add here]',
      object: {
        '.w1200': {
          properties: [{
            property: 'width',
            value: '1200px'
          }]
        },
        '.p40': {
          properties: [{
            property: 'padding',
            value: '40px'
          }]
        },
        '.mb30': {
          properties: [{
            property: 'margin-bottom',
            value: '30px'
          }]
        }
      }
    };

    const lstat = fs.lstatSync(outputFilePath);
    assert.equal(lstat.isFile(), true);

    const generatedContent = fs.readFileSync(outputFilePath);
    assert.equal(generatedContent, expectedCss.minified);

    // Remove any existing generated file
    fs.unlinkSync(outputFilePath);
    fs.rmdirSync(__dirname + '/fixtures/sample-dir/assets/css');
    fs.rmdirSync(__dirname + '/fixtures/sample-dir/assets');

    done();
  });

  it('can generate formatted CSS file', function (done) {

    const outputFilePath = __dirname + '/fixtures/sample-dir/assets/css/tailored.css',
      generatedCss = tailor.generatePathCss(__dirname + '/fixtures/', {
        outputPath: outputFilePath,
        minifyOutput: false
      });

    const expectedCss = {
      minified: '.w1200{width:1200px;}.p40{padding:40px;}.mb30{margin-bottom:30px;}',
      formatted: '.w1200 {\n    width: 1200px;\n}\n\n.p40 {\n    padding: 40px;\n}\n\n.mb30 {\n    margin-bottom: 30px;\n}\n\n',
      object: {
        '.w1200': {
          properties: [{
            property: 'width',
            value: '1200px'
          }]
        },
        '.p40': {
          properties: [{
            property: 'padding',
            value: '40px'
          }]
        },
        '.mb30': {
          properties: [{
            property: 'margin-bottom',
            value: '30px'
          }]
        }
      }
    };

    const lstat = fs.lstatSync(outputFilePath);
    assert.equal(lstat.isFile(), true);

    const generatedContent = fs.readFileSync(outputFilePath);
    assert.equal(generatedContent, expectedCss.formatted);

    // Remove any existing generated file
    fs.unlinkSync(outputFilePath);
    fs.rmdirSync(__dirname + '/fixtures/sample-dir/assets/css');
    fs.rmdirSync(__dirname + '/fixtures/sample-dir/assets');

    done();
  });
});
