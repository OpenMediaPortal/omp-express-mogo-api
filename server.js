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
    stream = require('./routes/stream'),
    library = require('./routes/library'),
    sync = require('./routes/sync'),
    syncdb = require('./dao/sync'),
    filedb = require('./dao/file');

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

// CORS
// @see http://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Serve endpoint code
app.get('/sync', sync.index);
app.get('/sync/:libkey', sync.show);
app.put('/sync/:libkey', sync.update);
app.delete('/sync/', sync.destroyAll);
app.delete('/sync/:libkey', sync.destroy);

app.get('/library', library.index);
app.post('/library', library.create);
app.put('/library/:libkey', library.update);
app.delete('/library/:libkey', library.destroy);

app.get('/library/:libkey', file.index);
app.get('/library/:libkey/:id', file.show);
app.post('/library/:libkey', file.create);
app.put('/library/:libkey/:id', file.update);
app.delete('/library/:libkey/:id', file.destroy);

app.get('/stream/:id', stream.show);

module.exports = app.listen(config.api_port, function () {
    console.log('Listening on port ' + config.api_port);
});
