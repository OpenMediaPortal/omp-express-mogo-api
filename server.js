/**
 * @fileoverview Open Media Player <br>
 *
 * Primary entry point of the server
 *
 * https://google.github.io/styleguide/javascriptguide.xml
 * @author ojourmel
 */

var express = require('express'),
    logger = require('morgan'),
    music = require('./routes/music'),
    path = require('path');

var app = express();

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    app.use(logger('dev'));
}

// Serve endpoint code
app.get('/music', music.findAll);
app.get('/music/:id', music.findById);
app.post('/music', music.addMusic);
app.put('/music/:id', music.updateMusic);
app.delete('/music/:id', music.deleteMusic);

app.listen(8001);
console.log('Listening on port 8001...');
