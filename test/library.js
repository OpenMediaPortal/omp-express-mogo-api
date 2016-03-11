/**
* Testing for library api
*
* @see jsonArray to avoid bad mocha checks of returning JSON
*
* @author ojourmel
*/

var request = require('supertest'),
    jsonArray = require('./jsonArray');

request = request("http://localhost:8001");

// populate the database with a few items:
var lib = {
    MUSIC: ['m1','m2'],
    PHOTOS: ['p1','p2'],
    TV: ['t1','t2'],
    MOVIES: ['mo1','mo'],
    OTHER: ['o1','o2']
}

describe('library api', function () {

    it('should respond to an empty /library get', function (done) {
        request
            .get('/library')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body.MUSIC , []) ||
                       jsonArray.equal(res.body.PHOTOS , []) ||
                       jsonArray.equal(res.body.TV , []) ||
                       jsonArray.equal(res.body.MOVIES , []) ||
                       jsonArray.equal(res.body.OTHER , []);

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

    it('should respond to /library post', function (done) {
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body.MUSIC , lib.MUSIC) ||
                       jsonArray.equal(res.body.PHOTOS , lib.PHOTOS) ||
                       jsonArray.equal(res.body.TV , lib.TV) ||
                       jsonArray.equal(res.body.MOVIES , lib.MOVIES) ||
                       jsonArray.equal(res.body.OTHER , lib.OTHER);

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

    it('should reject non json /library post', function (done) {
        request
            .post('/library')
            .expect(415, done);
    });

    it('should reject non standard keys in /library post', function (done) {
        lib.extra = ['qwer','zxcv'];
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(400, done);

        delete lib.extra;
    });

    it('should reject non array keys in /library post', function (done) {
        lib.TV = {'key':'value'};
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(400, done);
        lib.TV = ['t1','t2'];
    });

    it('should reject non json /library/:key put', function (done) {
        request
            .put('/library/MUSIC')
            .expect(415, done);
    });

    it('should reject non standard keys in /library/:key put', function (done) {
        request
            .put('/library/BADKEY')
            .set('Content-Type', 'application/json')
            .expect(400, done);
    });

    it('should reject non array keys in /library/:key put', function (done) {
        request
            .put('/library/MUSIC')
            .set('Content-Type', 'application/json')
            .send({'key':'value'})
            .expect(400, done);
    });

    it('should respond to valid /library/:key put', function (done) {
        lib.MUSIC = ['tm1','tm2'];
        request
            .put('/library/MUSIC')
            .set('Content-Type', 'application/json')
            .send(lib.MUSIC)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body , lib.MUSIC);
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

    it('should reject non json /library/:key patch', function (done) {
        request
            .patch('/library/MUSIC')
            .expect(415, done);
    });

    it('should reject non standard keys in /library/:key patch', function (done) {
        request
            .patch('/library/BADKEY')
            .set('Content-Type', 'application/json')
            .expect(400, done);
    });

    it('should reject non array keys in /library/:key patch', function (done) {
        request
            .patch('/library/MUSIC')
            .set('Content-Type', 'application/json')
            .send({'key':'value'})
            .expect(400, done);
    });

    it('should respond to valid /library/:key patch', function (done) {
        var extra = ['e1','e2'];
        var combined = lib.MUSIC.concat(extra);
        request
            .patch('/library/MUSIC')
            .set('Content-Type', 'application/json')
            .send(extra)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body , combined);
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

    it('should respond to /library/:key delete ', function (done) {
        request
            .delete('/library/MUSIC')
            .expect(204, done);
    });

    it('should 404 bad key to /library/:key delete ', function (done) {
        request
            .delete('/library/BADKEY')
            .expect(404, done);
    });

    it('should respect delete from /library get', function (done) {
        lib.MUSIC = [];
        request
            .get('/library')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body.MUSIC , lib.MUSIC) ||
                       jsonArray.equal(res.body.PHOTOS , lib.PHOTOS) ||
                       jsonArray.equal(res.body.TV , lib.TV) ||
                       jsonArray.equal(res.body.MOVIES , lib.MOVIES) ||
                       jsonArray.equal(res.body.OTHER , lib.OTHER);

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

    it('should finish with an empty /library post', function (done) {
        lib.MUSIC = [];
        lib.PHOTOS = [];
        lib.TV = [];
        lib.MOVIES = [];
        lib.OTHER = [];
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body.MUSIC , lib.MUSIC) ||
                       jsonArray.equal(res.body.PHOTOS , lib.PHOTOS) ||
                       jsonArray.equal(res.body.TV , lib.TV) ||
                       jsonArray.equal(res.body.MOVIES , lib.MOVIES) ||
                       jsonArray.equal(res.body.OTHER , lib.OTHER);

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
});
