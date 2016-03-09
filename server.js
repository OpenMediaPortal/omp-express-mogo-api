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
    bodyParser = require('body-parser'),
    multer = require('multer'),
    mongoose = require('mongoose'),
    music = require('./routes/music'),
    stream = require('./routes/stream');

var app = express();

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    app.use(logger('dev'));
}


// Start a mongoose connection
mongoose.connect('omp-mongo');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Multer can be used to upload files from multipart/form-data
// app.use(multer({dest:'./uploads/'}).single('photo'));

// Serve endpoint code
app.get('/music', music.findAll);
app.get('/music/:id', music.findById);
app.post('/music', music.addMusic);
app.put('/music/:id', music.updateMusic);
app.delete('/music/:id', music.deleteMusic);

app.get('/stream/:id', stream.serve);

app.listen(8001);
console.log('Listening on port 8001...');
