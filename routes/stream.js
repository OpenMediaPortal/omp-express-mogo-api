/**
 * @fileoverview Generic file serving endpoint
 *
 * Assume paths are relative to the *LIBRARY_ROOT*. This may present some issues
 * when using multiple folders for each MUSIC, MOVIE, etc library
 *
 * @author ojourmel
 */

var file = require('../dao/file'),
    config = require('../config'),
    fs = require('fs'),
    path = require('path');


/**
 * get /serve/:id
 *
 */
exports.show = function(req, res) {
    file.findOne({_id: req.params.id}).lean().exec(function(err, f) {
        if (err || !f) {
            res.status(404).send({'error':'Not Found'});
        } else {
            var filepath = path.join(config.LIBRARY_ROOT, f.path);
            var readStream = fs.createReadStream(filepath);

            readStream.on('open', function () {
                res.set({'Content-Type': f.format});
                readStream.pipe(res);
            });

            readStream.on('error', function(err) {
                console.log(err);
                res.status(404).send({'error':'Not Found'});
            });
        }
    });
}
