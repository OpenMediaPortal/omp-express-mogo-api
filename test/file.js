/**
* Testing for file api, located at /library/:libkey
*
* @see jsonProperty to avoid bad mocha checks of returning JSON
*
* @author ojourmel
*/

var request = require('supertest'),
    jsonCompare = require('./jsonCompare');

/*
 * Use local application for code coverage. Note that
 * a mongodb server will still need to be up. Set
 * the express server to run on 8002 to allow for
 * side by side coverage and testing.
 *
 * Run the primary tests through the docker instance.
 */
if ('coverage' == process.env.NODE_ENV) {
    request = request(require('../server'));
} else {
    request = request('http://localhost:8001');
}

// populate the database with a few items:
var music = {
    name: "TestName",
    title: "TestTitle",
    year: "0000",
    artist: "TestArtist",
    album: "TestAlbum",
    mimetype: "TestMimeType",
    path: "TestPath"
};

var extra = {
    name: "ExtraName",
    title: "ExtraTitle",
    year: "9999",
    artist: "ExtraArtist",
    album: "ExtraAlbum",
    mimetype: "ExtraMimeType",
    path: "ExtraPath",
    extra: "Extra"

};

var emptyResp = {
    group: ["name"],
    index: { "name": {} },
    lookup: {},
    files: []
};

var groupsort = {
    group: ["g1", "g2"],
    index: { "g1": {},
             "g2": {} },
    lookup: {},
    files: []
};

describe('file (/library/:libkey) api', function () {

    it('should respond to an empty /library/music get', function (done) {
        request
            .get('/library/music')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(emptyResp, done);
    });

    it('should respect group and sort to /library/music get', function (done) {
        request
            .get('/library/music?group=g1,g2&sort=s1,s2')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(groupsort, done);
    });

    it('should 404 a bad libkey to /library/:libkey post', function (done) {
        request
            .post('/library/badlibkey/')
            .set('Content-Type', 'application/json')
            .expect(404, done);
    });

    it('should 415 a bad to /library/:libkey post', function (done) {
        request
            .post('/library/music/')
            .set('Content-Type', 'text/plain')
            .expect(415, done);
    });

    it('should respond to /library/music post', function (done) {
        request
            .post('/library/music')
            .set('Content-Type', 'application/json')
            .send(music)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.name , music.name) ||
                       jsonCompare.property(res.body.title , music.title) ||
                       jsonCompare.property(res.body.year , music.year) ||
                       jsonCompare.property(res.body.artist , music.artist) ||
                       jsonCompare.property(res.body.album , music.album) ||
                       jsonCompare.property(res.body.mimetype , music.mimetype) ||
                       jsonCompare.property(res.body.path , music.path);

                if (r) {
                    throw new Error(r);
                }
            })
            .end(function (err, res) {
                music._id = res.body._id;
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should strip extra fields from /library/music post', function (done) {
        request
            .post('/library/music')
            .set('Content-Type', 'application/json')
            .send(extra)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect(function(res) {

                var r = jsonCompare.property(res.body.name , extra.name) ||
                       jsonCompare.property(res.body.title , extra.title) ||
                       jsonCompare.property(res.body.year , extra.year) ||
                       jsonCompare.property(res.body.artist , extra.artist) ||
                       jsonCompare.property(res.body.album , extra.album) ||
                       jsonCompare.property(res.body.mimetype , extra.mimetype) ||
                       jsonCompare.property(res.body.path , extra.path) ||
                       jsonCompare.property(res.body.extra , null);

                if (r) {
                    throw new Error(r);
                }

            })
            .end(function (err, res) {
                extra._id = res.body._id;
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should 400 empty path /library/music post', function (done) {
        var tmp = {
            name: 'empty.exe',
            mimetype: 'exe'
        }

        request
            .post('/library/music')
            .set('Content-Type', 'application/json')
            .send(tmp)
            .expect(400, done);
    });

    it('should 400 empty name /library/music post', function (done) {
        var tmp = {
            mimetype: 'exe',
            path: '/path/'
        }
        request
            .post('/library/music')
            .set('Content-Type', 'application/json')
            .send(tmp)
            .expect(400, done);
    });

    it('should 400 empty mimetype /library/music post', function (done) {
        var tmp = {
            name: 'name',
            path: '/path/'
        }
        request
            .post('/library/music')
            .set('Content-Type', 'application/json')
            .send(tmp)
            .expect(400, done);
    });

    it('should 400 empty path /library/music put', function (done) {
        var tmp = {
            name: 'empty',
            mimetype: 'exe'
        }

        request
            .put('/library/music/' + music._id)
            .set('Content-Type', 'application/json')
            .send(tmp)
            .expect(400, done);
    });

    it('should 400 empty name /library/music put', function (done) {
        var tmp = {
            mimetype: 'exe',
            path: '/path/'
        }
        request
            .put('/library/music/' + music._id)
            .set('Content-Type', 'application/json')
            .send(tmp)
            .expect(400, done);
    });

    it('should 400 empty mimetype /library/music put', function (done) {
        var tmp = {
            name: 'name',
            path: '/path/'
        }
        request
            .put('/library/music/' + music._id)
            .set('Content-Type', 'application/json')
            .send(tmp)
            .expect(400, done);
    });

    it('should respond to /library/music get', function (done) {
        request
            .get('/library/music')
            .expect(200, done);
    });

    it('should 404 a bad libkey to /library/:libkey/:id get', function (done) {
        request
            .get('/library/badlibkey/id')
            .expect(404, done);
    });

    it('should 404 a bad id to /library/music/:id get', function (done) {
        request
            .get('/library/music/' + 'not here')
            .expect(404, done);
    });

    it('should respond to /library/music/:id get ', function (done) {
        request
            .get('/library/music/' + music._id)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {

                var r = jsonCompare.property(res.body.name , music.name) ||
                       jsonCompare.property(res.body.title , music.title) ||
                       jsonCompare.property(res.body.year , music.year) ||
                       jsonCompare.property(res.body.artist , music.artist) ||
                       jsonCompare.property(res.body.album , music.album) ||
                       jsonCompare.property(res.body.mimetype , music.mimetype) ||
                       jsonCompare.property(res.body.path , music.path);

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

    it('should 404 a bad libkey to /library/:libkey/:id put', function (done) {
        request
            .put('/library/badlibkey/' + 'not here')
            .set('Content-Type', 'application/json')
            .expect(404, done);
    });

    it('should 415 a bad /library/:libkey/:id put', function (done) {
        request
            .put('/library/music/id')
            .set('Content-Type', 'text/plain')
            .expect(415, done);
    });

    it('should 404 a bad id to /library/music/:id put', function (done) {
        request
            .put('/library/music/' + 'not here')
            .set('Content-Type', 'application/json')
            .expect(404, done);
    });

    it('should respond to /library/music/:id put ', function (done) {
        music.year = "2222";
        delete music.artist;

        request
            .put('/library/music/' + music._id)
            .set('Content-Type', 'application/json')
            .send(music)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.name , music.name) ||
                       jsonCompare.property(res.body.title , music.title) ||
                       jsonCompare.property(res.body.year , music.year) ||
                       jsonCompare.property(res.body.artist , music.artist) ||
                       jsonCompare.property(res.body.album , music.album) ||
                       jsonCompare.property(res.body.mimetype , music.mimetype) ||
                       jsonCompare.property(res.body.path , music.path);

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

    it('should respect put changes to /library/music/:id get ', function (done) {
        request
            .get('/library/music/' + music._id)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonCompare.property(res.body.name , music.name) ||
                       jsonCompare.property(res.body.title , music.title) ||
                       jsonCompare.property(res.body.year , music.year) ||
                       jsonCompare.property(res.body.artist , music.artist) ||
                       jsonCompare.property(res.body.album , music.album) ||
                       jsonCompare.property(res.body.mimetype , music.mimetype) ||
                       jsonCompare.property(res.body.path , music.path);

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

    it('should respond to (music) /library/music/:id delete ', function (done) {
        request
            .delete('/library/music/' + music._id)
            .expect(204, done);
    });

    it('should respond to (extra) /library/music/:id delete ', function (done) {
        request
            .delete('/library/music/' + extra._id)
            .expect(204, done);
    });

    it('should 404 missing ids to /library/music/:id delete ', function (done) {
        request
            .delete('/library/music/' + music._id)
            .expect(404, done);
    });

    it('should 404 bad libkey /library/:libkey/:id delete ', function (done) {
        request
            .delete('/library/badlibkey/' + music._id)
            .expect(404, done);
    });

    it('should finish empty /library/music get', function (done) {
        request
            .get('/library/music')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(emptyResp, done);
    });

});
