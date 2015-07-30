'use strict';

var fs = require('fs');
var crypto = require('crypto');

function md5(content) {
    var hash = crypto.createHash('md5');
    hash.update(content);
    return hash.digest('hex');
}

function btoa(content) {
    return (new Buffer(content)).toString('base64');
}
function xor(key, text) {
    var dict = md5(key);
    return btoa(text.split('').map(function(i, j) {
        return String.fromCharCode(i.charCodeAt() ^ dict[j % dict.length]);
    }).join(''));
}

module.exports = function(e) {
  return xor(e.attrs.key || 'zswang', e.content);
};
