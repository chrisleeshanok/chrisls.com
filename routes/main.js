"use strict";
const express = require('express');
const nconf = require('nconf');
const Parser = require('../src/modules/md-parser');

const router = express.Router();

router.route('/')
.get((req, res, next) => {
    const config = nconf.get('config');
    const blogs = nconf.get('blogs');

    const blog = Parser.parseFile(blogs[0].path)
    .then(
        function(result) {
            res.render('homepage', {
                context_root: config.context_root,
                blog_data: result
            });
        },
        function(error) {
            res.sendStatus(500);
        }
    );
});

module.exports = router;
