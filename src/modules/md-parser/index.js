'use strict';

var marked = require('marked');
var fs = require('fs');

var MDParser = {
    parseFile: function(path) {

        var parsePromise = new Promise(function(resolve, reject) {
            if (!path) {
                reject(new Error('No path to MD file specified'));
            }

            fs.readFile(path, 'utf8', function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(marked(data));
                }
            });
        });

        return parsePromise;
    }
};

module.exports = MDParser;
