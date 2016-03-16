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
    file = require('./routes/file'),
    music = require('./routes/music'),
    stream = require('./routes/stream'),
    library = require('./routes/library'),
    sync = require('./routes/sync'),
    syncdb = require('./dao/sync');

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

app.get('/library/sync', sync.index);
app.get('/library/:key/sync', sync.show);
app.put('/library/:key/sync/', sync.update);
app.delete('/library/:key/sync', sync.destroy);

app.get('/library/', library.index);
app.get('/library/:key', library.show);
app.post('/library', library.create);
app.put('/library/:key', library.update);
app.patch('/library/:key', library.patch);
app.delete('/library/:key', library.destroy);


// Initialize sync objects
for (var k in config.library) {
    // Use an inline function to create a unique closure for the
    // property k, which will be used in the async calls to the db.
    (function(key) {
        syncdb.findOne({library: key}).lean().exec(function(err, s) {
            if (err) {
                throw new Error(err);
            }
            if (!s) {
                s = new syncdb({
                    status: {
                        syncing: false,
                        syncTime: 0,
                        totalFiles: 0
                    },
                    library: key,
                    lastSynced: null
                });
                s.save (function(err){
                    if (err) {
                        throw new Error(err);
                    }
                });
            }
        });
    })(k);
}

app.listen(config.api_port);
console.log('Listening on port ' + config.api_port);
