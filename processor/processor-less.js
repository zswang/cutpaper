'use strict';

var less = require('less');

module.exports = function(e) {
    var options = {
        paths: [e.dirname],
        syncImport: true,
        relativeUrls: true
    };
    var parser = new(less.Parser)(options);
    var content = e.content;
    less.render(content, options, function(error, output) {
        if (error) {
            throw error;
        }
        else {
            content = output.css;
        }
    });
    return content;
};
