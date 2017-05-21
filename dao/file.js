/**
 * @fileoverview Generic file schema
 *
 * Includes a 'library' which should correspond to keys in the config.library object
 * @author ojourmel
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../config.js'),
    path = require('path'),
    fs = require('fs'),
    id3 = require('musicmetadata');

var fileSchema = new Schema({
    library: {type: String },
    name: {type: String },
    mimetype: {type: String },
    path: {type: String },
    title: {type: String },
    year: {type: String },
    artist: {type: String },
    album: {type: String },
    genre: {type: String },
    track: {type: String },
    length: {type: String }
}, { collection : 'files' });


/*
 * Given a library, json object, and an (option) file object,
 * fill in the relevant meta data
 *
 * If no file object is given, an new one is created.
 *
 * This method is used in conjunction with an "edit" feature of
 * items via the web interface. Thus, one could update out-of-data
 * meta data related to a song or movie.
 *
 * One might want to add additional meta data, which is not currently
 * supported. Consider adding arbitrary meta data fields at a future time.
 * This could conflict with the current use of 'Schema'.
 */
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

                f.title = body.title;
                f.artist = body.artist;
                f.album = body.album;
                f.year = body.year;
                f.genre = body.genre;
                f.track = body.track;
                f.length = body.length;

            } else if (lm == 'video') {

            } else if (lm == 'photo') {

            } else if (lm == '') {

            }
        } else {
            throw new Error('Invalid config format: ' + config.toObject);
        }
    }

    return f;
};



/*
 * Given a library, name, path, mimetype, create a new
 * file object, and fill in the relevant meta data
 *
 * If the mimetype is 'audio', parse the id3 tags, with some sanitation
 *
 * There are several different libraries that can be used for id3 tag parsing.
 * They each have their own advantages and drawbacks.
 *
 * id3js (https://github.com/43081j/id3)
 *    Crashes on some files. PR to fix open for 2+ years: https://github.com/43081j/id3/pull/19
 *    Async Read only
 *
 * jsmediatags (https://github.com/aadsm/jsmediatags)
 *    Seems to fail if no tags are found, or unsupported media types are parsed
 *    Read only
 *
 * musicmetadata (https://github.com/leetreveil/musicmetadata)
 *    A fork of work derived from JavaScript-ID3-Reader, the predecessor to jsmediatags
 *    Is very slow: https://github.com/leetreveil/musicmetadata/issues/115
 *    Does not seem to warn if no meta data is found: https://github.com/leetreveil/musicmetadata/issues
 *    Read only
 *
 * libtag (https://github.com/nikhilm/node-taglib)
 *    Javascript bindings to LibTag, but does not build on new Node versions.
 *    Seems to be unmaintained
 *    PR to fix open for 6+ months: https://github.com/nikhilm/node-taglib/pull/63
 *    LibTag, cmake, and git dependency, and c++ compilation issues.
 *    Read and write capabilities.
 *
 * libtag2 (https://github.com/voltraco/node-taglib2)
 *    Seems to be more maintained than libtag
 *    Uses a significantly reduced future set as part of the rewrite
 *    Sync read/write only
 *    Has same TagLib dependency and compilation issues as libtag
 *    Read and write capabilities.
 *
 * Current implementation uses musicmetadata. Preference would be libtag, if development continues.
 * id3js also seems to be reasonable, but only if development continues
 *
 * @TODO: Handle bad libkey errors
 * @TODO: Handle fallback parsing
 *
 * @TODO: Add 'video' mimetype meta data parsing
 * @TODO: Add 'image' mimetype meta data parsing
 * @TODO: Add generic meta data parsing
 *
 */
fileSchema.statics.parsePath = function(libkey, n, p, m, callback) {

    if (config.library.hasOwnProperty(libkey)) {

        var f = new this();

        f.library = libkey;
        f.name = n;
        f.path = p;
        f.mimetype = m;

        var lm = config.library[libkey].libmime;

        if (lm == 'audio') {

            var stream = fs.createReadStream(path.join(config.LIBRARY_ROOT, p));
            // Join the Docker container's LIBRARY_ROOT with the real fs file path
            id3(stream, {autoClose: true}, function (err, tags) {
                if (err) {
                    console.log('Metadata parse failed on file: ' + p);
                    callback(null);
                    return;
                }
                stream.close();

                if (tags.title) {
                    f.title = tags.title;
                }
                if (tags.album) {
                    f.album = tags.album;
                }
                if (tags.artist) {
                    f.artist = tags.artist;
                }
                if (tags.year) {
                    f.year = tags.year;
                }
                if (tags.genre) {
                    f.genre = tags.genre;
                }
                if (tags.track) {
                    f.track = tags.track.no;
                }
                if (tags.length) {
                    f.length = tags.length;
                }

                // Parse "2/16" and "2" into "02" format
                if (f.track) {
                    // Grab the first number
                    f.track = f.track.match(/\d+/)[0];
                    // Pad zero or one '0'
                    f.track = ('0'+f.track).substring(f.track.length-1);
                }
                callback(f);
            });

        } else if (lm == 'image') {
            // parse image tags, or pull from path
        } else if (lm == 'video') {
            // parse video tags, or pull from path
        } else if (lm == '') {
            // pull from path
        } else {
            // fallback
            callback(f);
        }
    } else {
        callback(null);
    }
};

module.exports = mongoose.model('file',fileSchema);
