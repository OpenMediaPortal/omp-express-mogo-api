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
    config = require('./config'),
    music = require('./routes/music'),
    stream = require('./routes/stream'),
    library = require('./routes/library');

config.load();

var app = express();

if ('development' == config.NODE_ENV) {
    app.use(logger('dev'));
}

// Start a mongoose connection
mongoose.connect(config.MONGO_HOST);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Multer can be used to upload files from multipart/form-data
// app.use(multer({dest:'./uploads/'}).single('photo'));

// Serve endpoint code

/*
 * @TODO: Merge /music/ and /library/ endpoints so that
 *        /library/music/:id get calls music.show
 *        This might require some fancy mongoose modeling
 *        Note that library.show would be overridded with music.index
 *        or some more general file.index
 *
 *        There would have to be some non-generic code when assigning
 *        the various 'extra' file tags for music, movies, etc
 *
 *        Otherwise, the only difference between music.index and tv.index
 *        is the model that is used in MODEL.find().lean).exec(...);
 *
 */
app.get('/music', music.index);
app.get('/music/:id', music.show);
app.post('/music', music.create);
app.put('/music/:id', music.update);
app.patch('/music/:id', music.patch);
app.delete('/music/:id', music.destroy);

app.get('/stream/:id', stream.show);

app.get('/library/', library.index);
app.get('/library/:key', library.show);
app.post('/library', library.create);
app.put('/library/:key', library.update);
app.patch('/library/:key', library.patch);
app.delete('/library/:key', library.destroy);

app.listen(config.API_PORT);
console.log('Listening on port ' + config.API_PORT);
