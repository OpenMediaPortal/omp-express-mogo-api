/**
* Testing for sync api
*
* @see library/other to verify that the code is working
*
* @author ojourmel
*/

var request = require('supertest'),
    jsonCompare = require('./jsonCompare');

var config;

if ('coverage' == process.env.NODE_ENV) {
    request = request(require('../server')),
    config = require('../config');
} else {
    request = request('http://localhost:8001');
}

var s = {
    status: {
        syncing: false,
        syncTime: 0,
        totalFiles: 0
    },
    library: 'other',
    lastSynced: null
};

describe('sync api', function () {

    it('should be start with empty /sync get', function (done) {
        request
            .get('/sync/')
            .expect(200)
            .expect([], done);
    });

    it('should 404 a bad libkey /sync/:libkey get', function (done) {
        request
            .get('/sync/badlibkey')
            .expect(404, done);
    });

    it('should return a valid libkey /sync/:libkey get', function (done) {
        request
            .get('/sync/other')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.status.syncing , s.status.syncing) ||
                       jsonCompare.property(res.body.status.syncTime , s.status.syncTime) ||
                       jsonCompare.property(res.body.status.totalFiles , s.status.totalFiles) ||
                       jsonCompare.property(res.body.library , s.library);

                if(!r && res.body.lastSynced != null) {
                    r = 'Error: res.body.lastSynced = ' + res.body.lastSynced;
                }

                if (r) {
                    throw new Error(r);
                }
            })
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should return duplicate valid libkey /sync/:libkey get', function (done) {
        request
            .get('/sync/other')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.status.syncing , s.status.syncing) ||
                       jsonCompare.property(res.body.status.syncTime , s.status.syncTime) ||
                       jsonCompare.property(res.body.status.totalFiles , s.status.totalFiles) ||
                       jsonCompare.property(res.body.library , s.library);

                if(!r && res.body.lastSynced != null) {
                    r = 'Error: res.body.lastSynced = ' + res.body.lastSynced;
                }

                if (r) {
                    throw new Error(r);
                }
            })
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should 404 a /sync/ post', function (done) {
        request
            .post('/sync')
            .expect(404, done);
    });

    it('should 404 a bad libkey /sync/:libkey put', function (done) {
        request
            .put('/sync/badlibkey')
            .expect(404, done);
    });

    it('should start and immediately finish an empty libpath /sync/:libkey put', function (done) {
        var lastSynced = Date.now();
        request
            .put('/sync/music')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.status.syncing , false) ||
                       jsonCompare.property(res.body.status.totalFiles, 0) ||
                       jsonCompare.property(res.body.library , 'music');

                if(!r) {
                    if (res.body.lastSynced == null) {
                        r = 'Error: res.body.lastSynced is null';
                    } else if (res.body.lastSynced <= lastSynced) {
                        r = 'Error: invalid lastSynced date: ' + res.body.lastSynced;
                    } else if (res.body.status.syncTime >= 500) {
                        r = 'Error: unusually large sync time for nothing done: ' + res.body.status.syncTime;
                    }
                }

                if (r) {
                    throw new Error(r);
                }
            })
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should start a valid library /sync/:libkey put', function (done) {
        s.status.syncing = true;
        s.lastSynced = Date.now();
        request
            .put('/sync/other')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.status.syncing , s.status.syncing) ||
                       jsonCompare.property(res.body.status.syncTime , s.status.syncTime) ||
                       jsonCompare.property(res.body.status.totalFiles , s.status.totalFiles) ||
                       jsonCompare.property(res.body.library , s.library);

                if(!r) {
                    if (res.body.lastSynced == null) {
                        r = 'Error: res.body.lastSynced is null';
                    } else if (res.body.lastSynced <= s.lastSynced) {
                        r = 'Error: invalid lastSynced date: ' + res.body.lastSynced;
                    }
                }

                if (r) {
                    throw new Error(r);
                }
            })
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should complete a libkey /sync/:libkey get', function (done) {

        // Allow this test to be retried while we wait for the endpoint to finish the sync.
        this.retries(6);
        this.timeout(1000);
        // Force a CPU block to wait. Kindof hacky, but for the sake of testing...
        var end = new Date().getTime() + 500;
        while(new Date().getTime() < end);

        request
            .get('/sync/other')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {

                var r = jsonCompare.property(res.body.status.syncing , false) ||
                       jsonCompare.property(res.body.library , s.library);

                if(!r) {

                    // We cannot test for real files being walked as the walk object is not stubbed
                    if (res.body.lastSynced == null) {
                        r = 'Error: res.body.lastSynced is null';
                    } else if (res.body.lastSynced <= s.lastSynced){
                        r = 'Error: invalid lastSynced date: ' + res.body.lastSynced;
                    } else if (res.body.status.syncTime == 0){
                        r = 'Error: no time spent syncing';
                    } else if (res.body.status.totalFiles == 0){
                        r = 'Error: no files found';
                    }
                }

                if (r) {
                    throw new Error(r);
                }
            })
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should 409 a duplicate request to a running /sync/:libkey put', function (done) {
        request
            .put('/sync/other')
            .end(function (err) {
                if (err) {
                    done(err);
                }

                if ('coverage' == process.env.NODE_ENV) {
                    done();
                } else {
                    // Warning: This is basicaly a using a race condition to test functionality
                    //          and furthermore, this race condition fails on local testing,
                    //          as there are no files to walk
                    request
                        .put('/sync/other')
                        .expect(409, done);
                }
            });
    });

    it('should 404 bad libkey /sycn/:libkey/ delete ', function (done) {
        request
            .delete('/sync/badlibkey')
            .expect(404, done);
    });

    it('should 204 valid /sync/:libkey delete ', function (done) {
        request
            .delete('/sync/other')
            .expect(204, done);
    });

    it('should 204 valid repeated /sync/:libkey delete ', function (done) {
        request
            .delete('/sync/other')
            .expect(204, done);
    });

    it('should 204 valid /sync/ delete ', function (done) {
        request
            .delete('/sync')
            .expect(204, done);
    });

    it('should 204 valid repeated /sync/ delete ', function (done) {
        request
            .delete('/sync')
            .expect(204, done);
    });

    it('should finish with empty /sync/ get', function (done) {
        request
            .get('/sync')
            .expect(200)
            .expect([], done);
    });

});
