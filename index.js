'use strict';
const express = require('express');
const consolidate = require('consolidate');
const main_router = require('./routes/main');

//Instantiate
const app = express();

//View Engine dustjs-linkedin
app.engine('dust', consolidate.dust);
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

//Routing
app.use(main_router);

//Start Server
app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port ' + (process.env.PORT || 3000));
});
