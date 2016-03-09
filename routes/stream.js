/**
 * @fileoverview Generic file serving endpoint
 *
 * @author ojourmel
 */

var LIBRARYROOT = process.env.LIBRARY_ROOT;
var file = require('../dao/file'),
    fs = require('fs'),
    path = require('path');


/**
 * get /serve/:id
 *
 */
exports.serve = function(req, res) {
    file.findOne({_id: req.params.id}).lean().exec(function(err, f) {
        if (err || !f) {
            res.status(404).send({'error':'Not Found'});
        } else {
            var filepath = path.join(LIBRARYROOT, f.path);
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
