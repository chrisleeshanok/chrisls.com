"use strict";
const express = require('express');
const router = express.Router();
const nconf = require('nconf');
const marked = require('marked');
const fs = require('fs');

router.route('/')
.get((req, res, next) => {
    const config = nconf.get('config');
    const blogs = nconf.get('blogs');

    var blog = fs.readFile(blogs[0].path, 'utf8', (err, data) => {
        if (err) throw err;

        const blog = marked(data);
        res.render('homepage', {
            context_root: config.context_root,
            blog_data: blog
        });
    });

});

module.exports = router;
