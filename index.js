'use strict';
const express = require('express');
const consolidate = require('consolidate');
const main_router = require('./routes/main');
const nconf = require('nconf');

//nconf configuration
nconf.argv().env();
nconf.file({ file: 'config/config.json' });

//grab config file
const config = nconf.get('config');

//Instantiate
const app = express();

//View Engine dustjs-linkedin
app.engine('dust', consolidate.dust);
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

//Routing
app.use(main_router);

//Statics
app.use('/public', express.static(__dirname + '/public'));

//Start Server
app.listen(process.env.PORT || config.port, () => {
    console.log('Listening on port ' + (process.env.PORT || config.port));
});
