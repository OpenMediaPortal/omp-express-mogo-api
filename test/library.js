/**
* Testing for library route api
*
* @see jsonCompare to avoid bad mocha checks of returning JSON
*
* @author ojourmel
*/

var request = require('supertest'),
    jsonCompare = require('./jsonCompare');

/*
 * Use local application for code coverage.
 * Run the primary tests through the docker
 * instance.
 */
if ('coverage' == process.env.NODE_ENV) {
    request = request(require('../server'));
} else {
    request = request('http://localhost:8001');
}

// populate the database with a few items:
var lib = {
    music: {
        libmime: 'audio',
        libpath: ['a1','a2']
    },
    photos: {
        libmime: 'image',
        libpath: ['p1','p2']
    },
    tv: {
        libmime: 'video',
        libpath: []
    },
    movies: {
        libmime: 'video',
        libpath: ['m1','m2']
    },
    other: {
        libmime: '',
        libpath: ['o1','o2']
    }
}


// stubbed version of the server's config object
var config = {
    library: {
        music: {
            libmime: 'audio',
            libpath: []
        },
        photos: {
            libmime: 'image',
            libpath: []
        },
        tv: {
            libmime: 'video',
            libpath: []
        },
        movies: {
            libmime: 'video',
            libpath: []
        },
        other: {
            libmime: 'application/javascript',
            libpath: ["/omp/routes"]
        }
    }
}

describe('library api', function () {
    it('should respond to the default /library get', function (done) {
        request
            .get('/library')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.music.libmime , config.library.music.libmime) ||
                        jsonCompare.array(res.body.music.libpath , config.library.music.libpath) ||
                        jsonCompare.property(res.body.photos.libmime , config.library.photos.libmime) ||
                        jsonCompare.array(res.body.photos.libpath , config.library.photos.libpath) ||
                        jsonCompare.property(res.body.tv.libmime , config.library.tv.libmime) ||
                        jsonCompare.array(res.body.tv.libpath , config.library.tv.libpath) ||
                        jsonCompare.property(res.body.movies.libmime , config.library.movies.libmime) ||
                        jsonCompare.array(res.body.movies.libpath , config.library.movies.libpath) ||
                        jsonCompare.property(res.body.other.libmime , config.library.other.libmime) ||
                        jsonCompare.array(res.body.other.libpath , config.library.other.libpath);

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
                var r = jsonCompare.property(res.body.music.libmime , lib.music.libmime) ||
                        jsonCompare.array(res.body.music.libpath , lib.music.libpath) ||
                        jsonCompare.property(res.body.photos.libmime , lib.photos.libmime) ||
                        jsonCompare.array(res.body.photos.libpath , lib.photos.libpath) ||
                        jsonCompare.property(res.body.tv.libmime , lib.tv.libmime) ||
                        jsonCompare.array(res.body.tv.libpath , lib.tv.libpath) ||
                        jsonCompare.property(res.body.movies.libmime , lib.movies.libmime) ||
                        jsonCompare.array(res.body.movies.libpath , lib.movies.libpath) ||
                        jsonCompare.property(res.body.other.libmime , lib.other.libmime) ||
                        jsonCompare.array(res.body.other.libpath , lib.other.libpath);

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

    it('should reject missing libmime in /library post', function (done) {
        lib.tv = {libpath: []};
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(400, done);
        lib.tv = {libmime: 'video', libpath: []};
    });

    it('should reject null libmime in /library post', function (done) {
        lib.tv = {libmime: null, libpath: []};
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(400, done);
        lib.tv = {libmime: 'video', libpath: []};
    });

    it('should reject missing libpath in /library post', function (done) {
        lib.tv = {libmime: ''};
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(400, done);
        lib.tv = {libmime: 'video', libpath: []};
    });

    it('should reject non array libpath in /library post', function (done) {
        lib.tv = {libmime: '', libpath: "/path" };
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(lib)
            .expect(400, done);
        lib.tv = {libmime: 'video', libpath: []};
    });

    it('should reject non json /library put', function (done) {
        request
            .put('/library/tv')
            .expect(415, done);
    });

    it('should reject missing libmime in /library put', function (done) {
        lib.tv = {libpath: []};
        request
            .put('/library/tv')
            .set('Content-Type', 'application/json')
            .send(lib.tv)
            .expect(400, done);
        lib.tv = {libmime: 'video', libpath: []};
    });

    it('should reject null libmime in /library put', function (done) {
        lib.tv = {libmime: null, libpath: []};
        request
            .put('/library/tv')
            .set('Content-Type', 'application/json')
            .send(lib.tv)
            .expect(400, done);
        lib.tv = {libmime: 'video', libpath: []};
    });

    it('should reject missing libpath in /library put', function (done) {
        lib.tv = {libmime: ''};
        request
            .put('/library/tv')
            .set('Content-Type', 'application/json')
            .send(lib.tv)
            .expect(400, done);
        lib.tv = {libmime: 'video', libpath: []};
    });

    it('should reject non array libpath in /library put', function (done) {
        lib.tv = {libmime: '', libpath: "/path" };
        request
            .put('/library/tv')
            .set('Content-Type', 'application/json')
            .send(lib.tv)
            .expect(400, done);
        lib.tv = {libmime: 'video', libpath: []};
    });

    it('should respond to /library/:libkey put', function (done) {
        request
            .put('/library/other')
            .set('Content-Type', 'application/json')
            .send(lib.other)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.libmime , lib.other.libmime) ||
                        jsonCompare.array(res.body.libpath , lib.other.libpath);

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

    it('should 404 bad libkey to /library/:libkey delete ', function (done) {
        request
            .delete('/library/BADKEY')
            .expect(404, done);
    });

    it('should respond to /library/:libkey delete ', function (done) {
        request
            .delete('/library/music')
            .expect(204, done);
    });

    it('should 404 duplicate /library/:libkey delete ', function (done) {
        request
            .delete('/library/music')
            .expect(404, done);
    });

    it('should respect delete from /library get', function (done) {
        request
            .get('/library/music')
            .expect(404, done);
    });

    it('should finish with an empty /library post', function (done) {
        request
            .post('/library')
            .set('Content-Type', 'application/json')
            .send(config.library)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.music.libmime , config.library.music.libmime) ||
                        jsonCompare.array(res.body.music.libpath , config.library.music.libpath) ||
                        jsonCompare.property(res.body.photos.libmime , config.library.photos.libmime) ||
                        jsonCompare.array(res.body.photos.libpath , config.library.photos.libpath) ||
                        jsonCompare.property(res.body.tv.libmime , config.library.tv.libmime) ||
                        jsonCompare.array(res.body.tv.libpath , config.library.tv.libpath) ||
                        jsonCompare.property(res.body.movies.libmime , config.library.movies.libmime) ||
                        jsonCompare.array(res.body.movies.libpath , config.library.movies.libpath) ||
                        jsonCompare.property(res.body.other.libmime , config.library.other.libmime) ||
                        jsonCompare.array(res.body.other.libpath , config.library.other.libpath);

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
