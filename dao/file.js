/**
 * @fileoverview Generic file schema
 *
 * Includes a 'library' which should correspond to keys in the config.library object
 * @author ojourmel
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../config.js'),
    path = require('path');

var fileSchema = new Schema({
    library: {type: String },
    name: {type: String },
    mimetype: {type: String },
    path: {type: String },
    year: {type: String },
    artist: {type: String },
    album: {type: String },
    label: {type: String }
}, { collection : 'files' });

fileSchema.statics.parseJSON = function(libkey, body, f) {

    if (config.library.hasOwnProperty(libkey)) {
        var lm = config.library[libkey].libmime;
        if (lm || lm == '') {
            if (!f) {
                f = new this();
            }

            f.library = libkey;
            f.name = body.name;
            f.path = body.path;
            f.mimetype = body.mimetype;

            if (lm == 'audio') {

                f.artist = body.artist;
                f.album = body.album;
                f.year = body.year;
                f.label = body.label;

            } else if (lm == 'video') {

            } else if (lm == 'photo') {

            } else if (lm == '') {

            }
        } else {
            throw new Error("Invalid config format: " + config.toObject);
        }
    }

    return f;
}

fileSchema.statics.parsePath = function(libkey, p, n, t, f) {

    if (config.library.hasOwnProperty(libkey)) {

        if (!f) {
            f = new this();
        }

        f.library = libkey;
        f.name = n;
        f.path = p;
        f.mimetype = t;

        var lm = config.library[libkey].libmime;

        if (lm == 'audio') {
            // parse mp3 tags, or pull from path
        } else if (lm == 'image') {
            // parse image tags, or pull from path
        } else if (lm == 'video') {
            // parse video tags, or pull from path
        } else if (lm == '') {
            // pull from path
        }
    }

    return f;
}

module.exports = mongoose.model('file',fileSchema);
