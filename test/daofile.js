/**
* Testing for static dao file functions
*
* @author ojourmel
*/

var request = require('supertest'),
    jsonCompare = require('./jsonCompare'),
    config = require('../config')
    fs = require('fs');

var file = require('../dao/file');

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

        var f = file.parsePath('testlibkey', null, null, null, null);

        if (f != null) {
            throw new Error('Error: expected null file parsed from bad libkey. Got' + f);
        } else {
            done();
        }
    });

    it('should fill in valid basic data', function (done) {
        config.library.testlibkey = {libmime: 'text', libpath: []};


        var path = '/test/path.txt';
        var name = 'path.txt';
        var mime = 'text/plain';

        var f = file.parsePath('testlibkey', name, path, mime, null);

        if (!f) {
            throw new Error('Error: null file');
        }

        f = f.toObject();

        var r = jsonCompare.property(f.library ,'testlibkey' ) ||
                jsonCompare.property(f.name, name) ||
                jsonCompare.property(f.path, path) ||
                jsonCompare.property(f.mimetype, mime);

        if (r) {
            throw new Error(r);
        } else {
            delete config.library.testlibkey;
            done();
        }
    });
});

