/**
 * @fileoverview Open Media Player <br>
 *
 * Primary entry point of the server
 *
 * https://google.github.io/styleguide/javascriptguide.xml
 * @author ojourmel
 */

// Load global node packages
var NODE_PATH = process.env.NODE_PATH
var express = require(NODE_PATH + 'express'),
    logger = require(NODE_PATH + 'morgan'),
    bodyParser = require(NODE_PATH + 'body-parser'),
    multer = require(NODE_PATH + 'multer'),
    mongoose = require(NODE_PATH + 'mongoose'),
    music = require('./routes/music');

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

app.listen(8001);
console.log('Listening on port 8001...');
