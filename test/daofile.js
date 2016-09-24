/**
* Testing for static dao file functions
*
* @author ojourmel
*/

var request = require('supertest'),
    jsonCompare = require('./jsonCompare'),
    config = require('../config'),
    fs = require('fs');

var file = require('../dao/file');

config.LIBRARY_ROOT = process.env.OMP_LIBRARY_ROOT;

describe('file parseJSON', function () {

    it('should reject bad libkey', function (done) {
        delete config.library.testlibkey;

        var f = file.parseJSON('testlibkey', {}, null);

        if (f != null) {
            throw new Error('Error: expected null file parsed from bad libkey. Got' + f);
        } else {
            done();
        }
    });

    it('should reject null libmime', function (done) {
        config.library.testlibkey = {libmime: null, libpath: []};

        try {
            var f = file.parseJSON('testlibkey', {}, null);
        } catch (e) {
            if (f != null) {
                throw new Error('Error: expected null file parsed from bad libmime. Got' + f);
            } else {
                delete config.library.testlibkey;
                done();
            }
        }
    });

    it('should fill in valid basic data', function (done) {
        config.library.testlibkey = {libmime: 'test', libpath: []};

        var body = {
            library: 'testlibkey',
            name: 'testname',
            path: 'testpath',
            mimetype: 'testmimetype'
        };

        var f = file.parseJSON('testlibkey', body, null);

        if (!f) {
            throw new Error('Error: null file');
        }

        f = f.toObject();

        var r = jsonCompare.property(f.library ,body.library ) ||
                jsonCompare.property(f.name, body.name) ||
                jsonCompare.property(f.path, body.path) ||
                jsonCompare.property(f.mimetype, body.mimetype);

        if (r) {
            throw new Error(r);
        } else {
            delete config.library.testlibkey;
            done();
        }
    });

    it('should fill in music data', function (done) {
        config.library.testlibkey = {libmime: 'audio', libpath: []};

        var body = {
            library: 'testlibkey',
            name: 'testname',
            path: 'testpath',
            mimetype: 'testmimetype',
            artist: 'testartist',
            album: 'testalbum',
            year: 'testyear',
            track: '01',
            length: '03'
        };

        var f = file.parseJSON('testlibkey', body, null);

        if (!f) {
            throw new Error('Error: null file');
        }

        f = f.toObject();

        var r = jsonCompare.property(f.library ,body.library ) ||
                jsonCompare.property(f.name, body.name) ||
                jsonCompare.property(f.path, body.path) ||
                jsonCompare.property(f.mimetype, body.mimetype) ||
                jsonCompare.property(f.artist, body.artist) ||
                jsonCompare.property(f.album, body.album) ||
                jsonCompare.property(f.year, body.year) ||
                jsonCompare.property(f.label, body.label);

        if (r) {
            throw new Error(r);
        } else {
            delete config.library.testlibkey;
            done();
        }
    });

    it('should ignore extra data', function (done) {
        config.library.testlibkey = {libmime: 'test', libpath: []};

        var body = {
            library: 'testlibkey',
            name: 'testname',
            path: 'testpath',
            mimetype: 'testmimetype',
            artist: 'testartist',
            album: 'testalbum',
            year: 'testyear',
            label: 'testlabel'
        };

        var f = file.parseJSON('testlibkey', body, null);

        if (!f) {
            throw new Error('Error: null file');
        }

        f = f.toObject();

        var r = jsonCompare.property(f.library ,body.library ) ||
                jsonCompare.property(f.name, body.name) ||
                jsonCompare.property(f.path, body.path) ||
                jsonCompare.property(f.mimetype, body.mimetype) ||
                jsonCompare.property(f.artist, null) ||
                jsonCompare.property(f.album, null) ||
                jsonCompare.property(f.year, null) ||
                jsonCompare.property(f.label, null);

        if (r) {
            throw new Error(r);
        } else {
            delete config.library.testlibkey;
            done();
        }
    });

    it('should overwrite given f object', function (done) {
        config.library.testlibkey = {libmime: 'test', libpath: []};

        var body = {
            library: 'testlibkey',
            name: 'testname',
            path: 'testpath',
            mimetype: 'testmimetype',
            artist: 'testartist',
            album: 'testalbum',
            year: 'testyear',
            label: 'testlabel'
        };

        var orig = new file({
            library: 'testlibkeyOrig',
            name: 'testnameOrig',
            path: 'testpathOrig'
        });

        var f = file.parseJSON('testlibkey', body, orig);

        if (!f) {
            throw new Error('Error: null file');
        }

        f = f.toObject();

        var r = jsonCompare.property(f.library ,body.library ) ||
                jsonCompare.property(f.name, body.name) ||
                jsonCompare.property(f.path, body.path) ||
                jsonCompare.property(f.mimetype, body.mimetype) ||
                jsonCompare.property(orig.library ,body.library ) ||
                jsonCompare.property(orig.name, body.name) ||
                jsonCompare.property(orig.path, body.path) ||
                jsonCompare.property(orig.mimetype, body.mimetype);

        if (r) {
            throw new Error(r);
        } else {
            delete config.library.testlibkey;
            done();
        }
    });
});

describe('file parsePath', function () {
    it('should reject bad libkey', function (done) {
        delete config.library.testlibkey;

        file.parsePath('testlibkey', null, null, null, function(f) {
            if (f != null) {
                throw new Error('Error: expected null file parsed from bad libkey. Got' + f);
            } else {
                done();
            }
        });
    });

    it('should fill in valid basic data', function (done) {
        config.library.testlibkey = {libmime: 'text', libpath: []};

        // This file doesn't exist, but since the libmime is not recognized by
        // dao/file.js, only the baisc information is processed.
        var path = '/test/path.txt';
        var name = 'path.txt';
        var mime = 'text/plain';

        file.parsePath('testlibkey', name, path, mime, function(f) {
            if (!f) {
                throw new Error('Error: null file');
            }

            f = f.toObject();

            var r = jsonCompare.property(f.library ,'testlibkey' ) ||
                    jsonCompare.property(f.name, name) ||
                    jsonCompare.property(f.path, path) ||
                    jsonCompare.property(f.mimetype, mime);

            delete config.library.testlibkey;
            if (r) {
                throw new Error(r);
            } else {
                done();
            }
        });
    });

    it('should parse basic id3 tags', function (done) {

        // Because these tests are done directly to the code - and not through the docker container,
        // use local directory for test files.
        config.library.music = {libmime: 'audio', libpath: ["./"]};

        var path = './id3tagtest.mp3';
        var name = 'id3tagtest.mp3';
        var mime = 'audio/mpeg';

        var t = {
            title: 'Id3TestTitle',
            album: 'Id3TestAlbum',
            artist: 'Id3TestArtist',
            year: 1969,
            genre: 'Rock',
            track: '2',
            length: 90,
            comment: 'Id3TestComment'
        };

        // A valid mp3 file, with the above id3 tags is contained in the following hex string:
        var id3data = Buffer.from('4944330400000000090d545045310000000e00000049643354657374417274697374544954320000000d000000496433546573745469746c6554414c420000000d00000049643354657374416c62756d434f4d4d000000130000005858580049643354657374436f6d6d656e7454434f4e00000005000000526f636b5444524300000005000000313936395452434b000000020000003200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000544147496433546573745469746c6500000000000000000000000000000000000049643354657374417274697374000000000000000000000000000000000049643354657374416c62756d0000000000000000000000000000000000003139363949643354657374436f6d6d656e740000000000000000000000000000000211','hex');

        fs.closeSync(fs.openSync(path, 'w'));
        fs.writeFileSync(path, id3data);

        // Pull the meta data
        file.parsePath('music', name, path, mime, function(f) {

            // immediately remove the test file
            fs.unlink(path);

            if (!f) {
                throw new Error('Error: null file');
            }

            f = f.toObject();

            var r = jsonCompare.property(f.library ,'music' ) ||
                    jsonCompare.property(f.name, name) ||
                    jsonCompare.property(f.path, path) ||
                    jsonCompare.property(f.mimetype, mime) ||
                    jsonCompare.property(f.title, t.title) ||
                    jsonCompare.property(f.album, t.album) ||
                    jsonCompare.property(f.artist, t.artist) ||
                    jsonCompare.property(f.year, t.year) ||
                    jsonCompare.property(f.genre, t.genre) ||
                    // Track should be zero padded
                    jsonCompare.property(f.track, 02) ||
                    // Length is derrived by actual song data, not id3 tags
                    jsonCompare.property(f.length, null) ||
                    jsonCompare.property(f.comment, null);

            if (r) {
                throw new Error(r);
            } else {
                done();
            }
        });
    });
});

