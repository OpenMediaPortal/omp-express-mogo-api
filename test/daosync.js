/**
* Testing for static dao sync functions
*
* @author ojourmel
*/

const jsonCompare = require('./jsonCompare');
const config = require('../config');

const sync = require('../dao/sync');

describe('sync init', function () {

    it('should reject bad libkey', function (done) {
        delete config.library.testlibkey;

        const s = sync.init('testlibkey', null);

        if (s != null) {
            throw new Error('Error: expected null sync parsed from bad libkey. Got' + s);
        } else {
            done();
        }
    });

    it('should fill in valid basic data given null', function (done) {
        config.library.testlibkey = {libmime: 'test', libpath: []};

        let s = sync.init('testlibkey', null);

        if (!s) {
            throw new Error('Error: null sync');
        }

        s = s.toObject();

        const r = jsonCompare.property(s.status.syncing, false) ||
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

        let s = new sync();

        s.status = { syncing: true, syncTime: -1, totalFiles: -1};
        s.library = 'oldlibrary';
        s.lastSynced = Date.now();

        s = sync.init('testlibkey', s);

        if (!s) {
            throw new Error('Error: null sync');
        }

        s = s.toObject();

        const r = jsonCompare.property(s.status.syncing, false) ||
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
