"use strict";
const express = require('express');
const nconf = require('nconf');
const BatchedMarkdown = require('batched-markdown');

const router = express.Router();

router.route('/')
.get((req, res, next) => {
    const config = nconf.get('config');
    const blogs = nconf.get('blogs');

    let blogFiles = new Array();

    blogs.forEach(function(blog) {
        blogFiles.push(blog.path);
    });

    BatchedMarkdown.parseFiles(blogFiles)
        .then(function(result) {

            let blogs = new Array();
            result.forEach(function(blog) {
                blogs.push({
                    blog: blog
                });
            });

            res.render('homepage', {
                context_root: config.context_root,
                blog_data: blogs,
                analytics: (process.env.NODE_ENV === 'production')
            });
        })
        .catch(function(error) {
            console.log(error);
            res.sendStatus(500);
        });

});

module.exports = router;
