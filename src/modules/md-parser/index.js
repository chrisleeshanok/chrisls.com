'use strict';

var marked = require('marked');
var fs = require('fs');
var async = require('async');

var MDParser = {
    /*
    parseFile
        input: path to markdown file
        returns: a promise containing either markdown as an html string or an error
    */
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
    },
    /*
    parseFiles
        input: array object containing paths to multiple markdown files
        returns: a promise containing either all markdown as an html string or an error
    */
    parseFiles: function(paths) {
        var self = this;
        var parsePromise = new Promise(function(resolve, reject) {

            if (!paths || paths.length < 1) {
                reject(new Error('Paths array to parseFiles empty or non-existant'));
            }

            var parseOne = function(path, callback) {
                self.parseFile(path).then(
                    function(result) {
                        callback(null, result);
                    },
                    function(error) {
                        callback(error, null);
                    }
                );
            }

            async.map(paths, parseOne, function(err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        return parsePromise;
    }

};

module.exports = MDParser;
