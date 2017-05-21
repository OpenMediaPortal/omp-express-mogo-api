/**
 * @fileoverview Generic file serving endpoint
 *
 * Assume paths are relative to the *LIBRARY_ROOT*. This may present some issues
 * when using multiple folders for each music, movie, etc library
 *
 * @author ojourmel
 */

const file = require('../dao/file');
const config = require('../config');
const fs = require('fs');
const path = require('path');


/**
 * get /stream/:id
 *
 */
exports.show = function(req, res) {
    file.findOne({_id: req.params.id}).lean().exec(function(err, f) {
        if (err || !f) {
            res.status(404).send({'error':'Not Found'});
        } else {
            const filepath = path.join(config.LIBRARY_ROOT, f.path);
            const readStream = fs.createReadStream(filepath);

            readStream.on('open', function () {
                res.set({'Content-Type': f.mimetype});
                readStream.pipe(res);
            });

            readStream.on('error', function(err) {
                console.log(err);
                res.status(404).send({'error':'Not Found'});
            });
        }
    });
};
