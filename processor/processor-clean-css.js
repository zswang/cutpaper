'use strict';

var CleanCSS = require('clean-css');
var AutopreFixer = require('autoprefixer-core');

function compress(source) {
    return AutopreFixer.process(new CleanCSS().minify(source).styles, {
        browsers: ['Android', 'iOS', 'ChromeAndroid', 'FirefoxAndroid', 'ExplorerMobile']
    }).css;
}

module.exports = function(e) {
    return compress(e.content);
};
