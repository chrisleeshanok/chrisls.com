"use strict";
const express = require('express');
const nconf = require('nconf');
const redis = require('redis');
const async = require('async');
const BatchedMarkdown = require('batched-markdown');

const router = express.Router();
const redisClient = redis.createClient();

redisClient.on('connect', () => {
    console.info('Redis Connected');
});

router.route('/')
.get((req, res, next) => {
    //TODO: cleanup after cache implementation
    const requestTime = new Date();
    console.info('Request started at ' + requestTime.toString());
    const config = nconf.get('config');
    const blogs = nconf.get('blogs');
    const CACHING_DISABLED = req.query.hasOwnProperty('nocache');

    //Need access to these vars throughout the async process
    let cachedBlogs;
    let fetchFiles = new Array();
    let fsBlogs = new Array();

    async.series({
        getCachedBlogs: (callback) => {
            //Get Cached Entries
            if (CACHING_DISABLED) {
                console.log('Caching Disabled');
                cachedBlogs = {};
                callback(null, {});
            } else {
                redisClient.hgetall('blogs', (err, object) => {
                    if (err) {
                        console.log(err);
                        cachedBlogs = {};
                        callback(null, {}); //Just move on without the cache
                    } else {
                        if (!object) {
                            cachedBlogs = {};
                        } else {
                            cachedBlogs = object;
                        }
                    }
                    callback(null, object);
                });
            }

        },
        getFilenames: (callback) => {
            //Assemble list of uncached filenames to retrieve
            blogs.forEach((blog) => {
                if (cachedBlogs && cachedBlogs[blog.path]) {
                    console.info('- Cache hit on ' + blog.path);
                } else {
                    console.info('- Cache miss on ' + blog.path);
                    fetchFiles.push(blog.path);
                }
            });
            callback(null, fetchFiles);

        },
        goToFileSystem: (callback) => {
            //Fetch the missing cached files
            BatchedMarkdown.parseFiles(fetchFiles)
                .then((result) => {
                    callback(null, result);
                })
                .catch((error) => {
                    callback(err, null);
                });
        }
    },
    (err, results) => {

        if (err) {
            console.log(err);
            res.sendStatus(500);
        }

        let blogData = new Array();

        //Batched Markdown is guaranteed to return blogs in requested order
        blogs.forEach((blog) => {
            if (cachedBlogs[blog.path]) {
                console.info('Adding blog ' + blog.path + ' from cache data');
                blogData.push({blog: cachedBlogs[blog.path]});
            } else {
                console.info('Adding blog ' + blog.path + ' from fs data');
                let blogPath = results.getFilenames.shift();
                let blogHTML = results.goToFileSystem.shift();

                if (!CACHING_DISABLED) {
                    redisClient.hmset('blogs', blogPath, blogHTML); //Cache
                }

                blogData.push({blog: blogHTML});
            }
        });

        res.render('homepage', {
            context_root: config.context_root,
            blog_data: blogData,
            analytics: (process.env.NODE_ENV === 'production')
        });
        console.info('Request completed in ' + ((new Date()).getTime() - requestTime.getTime()) + 'ms');
    });





});

module.exports = router;
