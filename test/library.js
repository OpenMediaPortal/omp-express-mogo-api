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
    music: ['m1','m2'],
    photos: ['p1','p2'],
    tv: ['t1','t2'],
    movies: ['mo1','mo'],
    other: ['o1','o2']
}

describe('library api', function () {

    it('should respond to an empty /library get', function (done) {
        request
            .get('/library')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body.music , []) ||
                       jsonArray.equal(res.body.photos , []) ||
                       jsonArray.equal(res.body.tv , []) ||
                       jsonArray.equal(res.body.movies , []) ||
                       jsonArray.equal(res.body.other , []);

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
                var r = jsonArray.equal(res.body.music , lib.music) ||
                       jsonArray.equal(res.body.photos , lib.photos) ||
                       jsonArray.equal(res.body.tv , lib.tv) ||
                       jsonArray.equal(res.body.movies , lib.movies) ||
                       jsonArray.equal(res.body.other , lib.other);

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
        lib.tv = {'key':'value'};
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(400, done);
        lib.tv = ['t1','t2'];
    });

    it('should reject non json /library/:key put', function (done) {
        request
            .put('/library/music')
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
            .put('/library/music')
            .set('Content-Type', 'application/json')
            .send({'key':'value'})
            .expect(400, done);
    });

    it('should respond to valid /library/:key put', function (done) {
        lib.music = ['tm1','tm2'];
        request
            .put('/library/music')
            .set('Content-Type', 'application/json')
            .send(lib.music)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body , lib.music);
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
            .patch('/library/music')
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
            .patch('/library/music')
            .set('Content-Type', 'application/json')
            .send({'key':'value'})
            .expect(400, done);
    });

    it('should respond to valid /library/:key patch', function (done) {
        var extra = ['e1','e2'];
        var combined = lib.music.concat(extra);
        request
            .patch('/library/music')
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
            .delete('/library/music')
            .expect(204, done);
    });

    it('should 404 bad key to /library/:key delete ', function (done) {
        request
            .delete('/library/BADKEY')
            .expect(404, done);
    });

    it('should respect delete from /library get', function (done) {
        lib.music = [];
        request
            .get('/library')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body.music , lib.music) ||
                       jsonArray.equal(res.body.photos , lib.photos) ||
                       jsonArray.equal(res.body.tv , lib.tv) ||
                       jsonArray.equal(res.body.movies , lib.movies) ||
                       jsonArray.equal(res.body.other , lib.other);

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
        lib.music = [];
        lib.photos = [];
        lib.tv = [];
        lib.movies = [];
        lib.other = [];
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonArray.equal(res.body.music , lib.music) ||
                       jsonArray.equal(res.body.photos , lib.photos) ||
                       jsonArray.equal(res.body.tv , lib.tv) ||
                       jsonArray.equal(res.body.movies , lib.movies) ||
                       jsonArray.equal(res.body.other , lib.other);

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
