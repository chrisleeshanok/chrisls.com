"use strict";
const express = require('express');
const nconf = require('nconf');
const redis = require('redis');
const async = require('async');
const BatchedMarkdown = require('batched-markdown');

const router = express.Router();
const redisClient = redis.createClient();

redisClient.on('connect', () => {
    console.log('Redis Connected');
});

router.route('/')
.get((req, res, next) => {
    const config = nconf.get('config');
    const blogs = nconf.get('blogs');

    //Need access to these vars throughout the async process
    let cachedBlogs;
    let fetchFiles = new Array();
    let fsBlogs = new Array();

    async.series({
        getCachedBlogs: (callback) => {
            //Fetch all the redis cache blogs
            redisClient.hgetall('blogs', (err, object) => {
                if (err) {
                    callback(err, null);
                } else {
                    if (!object) {
                        cachedBlogs = {};
                    } else {
                        cachedBlogs = object;
                    }
                }
                callback(null, object);
            });
        },
        getFilenames: (callback) => {
            //If not in cache, add the filename to fetchFiles
            blogs.forEach((blog) => {
                if (cachedBlogs && cachedBlogs[blog.path]) {
                    console.log('- Cache hit on ' + blog.path);
                } else {
                    console.log('- Cache miss on ' + blog.path);
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
                console.log('Adding blog ' + blog.path + ' from cache data');
                blogData.push({blog: cachedBlogs[blog.path]});
            } else {
                console.log('Adding blog ' + blog.path + ' from fs data');
                let blogPath = results.getFilenames.shift();
                let blogHTML = results.goToFileSystem.shift();

                redisClient.hmset('blogs', blogPath, blogHTML); //Cache

                blogData.push({blog: blogHTML});
            }
        });

        res.render('homepage', {
            context_root: config.context_root,
            blog_data: blogData,
            analytics: (process.env.NODE_ENV === 'production')
        });
    });





});

module.exports = router;
