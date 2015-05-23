'use strict';

var SVGO = require('svgo');
var svgo = new SVGO({
    plugins: [{
        cleanupIDs: {
            remove: false
        }
    }]
});

function compress(source) {
    var result = source;
    svgo.optimize(source, function(svgjs) {
        if (svgjs.error) {
            return;
        }
        result = svgjs.data;
    });
    return result;
}

module.exports = function(e) {
    return compress(e.content);
};
