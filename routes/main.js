"use strict";
const express = require('express');
const router = express.Router();
const nconf = require('nconf');

router.route('/')
.get((req, res, next) => {
    const config = nconf.get('config');
    res.render('homepage', {
        context_root: config.context_root
    });
});

module.exports = router;
