'use strict';

var uglify = require('uglify-js');

function compress(code) {
    return uglify.minify(code, {
        fromString: true
    }).code;
}

module.exports = function(e) {
    return compress(e.content);
};
