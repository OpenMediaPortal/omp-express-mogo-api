/**
* Testing for static dao sync functions
*
* @author ojourmel
*/

var request = require('supertest'),
    jsonCompare = require('./jsonCompare'),
    config = require('../config')
    fs = require('fs');

var sync = require('../dao/sync');

describe('sync init', function () {

    it('should reject bad libkey', function (done) {
        delete config.library.testlibkey;

        var s = sync.init('testlibkey', null);

        if (s != null) {
            throw new Error('Error: expected null sync parsed from bad libkey. Got' + f);
        } else {
            done();
        }
    });

    it('should fill in valid basic data given null', function (done) {
        config.library.testlibkey = {libmime: 'test', libpath: []};

        var s = sync.init('testlibkey', null);

        if (!s) {
            throw new Error('Error: null sync');
        }

        s = s.toObject();

        var r = jsonCompare.property(s.status.syncing, false) ||
                jsonCompare.property(s.status.syncTime, '0') ||
                jsonCompare.property(s.status.totalFiles, '0') ||
                jsonCompare.property(s.library, 'testlibkey') ||
                jsonCompare.property(s.lastSynced, null);

        if (r) {
            throw new Error(r);
        } else {
            delete config.library.testlibkey;
            done();
        }
    });

    it('should overwrite valid basic data given existing', function (done) {
        config.library.testlibkey = {libmime: 'test', libpath: []};

        var s = new sync();

        s.status = { syncing: true, syncTime: -1, totalFiles: -1};
        s.library = 'oldlibrary';
        s.lastSynced = Date.now();

        s = sync.init('testlibkey', s);

        if (!s) {
            throw new Error('Error: null sync');
        }

        s = s.toObject();

        var r = jsonCompare.property(s.status.syncing, false) ||
                jsonCompare.property(s.status.syncTime, '0') ||
                jsonCompare.property(s.status.totalFiles, '0') ||
                jsonCompare.property(s.library, 'testlibkey') ||
                jsonCompare.property(s.lastSynced, null);

        if (r) {
            throw new Error(r);
        } else {
            delete config.library.testlibkey;
            done();
        }
    });
});
