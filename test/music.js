/**
* Testing for music api
*
* @see jsonProperty to avoid bad mocha checks of returning JSON
*
* @author ojourmel
*/
var request = require('supertest'),
    jsonProperty = require('./jsonProperty');

// Connect to an alread running instance of the app
// This includes are running docker-compose instance
request = request("http://localhost:8001");

// populate the database with a few items:
var music = {
    name: "TestName",
    year: "0000",
    artist: "TestArtist",
    album: "TestAlbum",
    label: "TestLabel",
    format: "TestFormat",
    path: "TestPath"
};

var extra = {
    name: "ExtraName",
    year: "9999",
    artist: "ExtraArtist",
    album: "ExtraAlbum",
    label: "ExtraLabel",
    format: "ExtraFormat",
    path: "ExtraPath",
    extra: "Extra"

};

describe('music api', function () {

    it('should respond to an empty /music get', function (done) {
        request
            .get('/music')
            .expect([])
            .expect(200, done);
    });

    it('should respond to /music post', function (done) {
        request
            .post('/music')
            .set('Content-Type', 'application/json')
            .send(music)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonProperty.equal(res.body.name , music.name) ||
                       jsonProperty.equal(res.body.year , music.year) ||
                       jsonProperty.equal(res.body.artist , music.artist) ||
                       jsonProperty.equal(res.body.album , music.album) ||
                       jsonProperty.equal(res.body.label , music.label) ||
                       jsonProperty.equal(res.body.format , music.format) ||
                       jsonProperty.equal(res.body.path , music.path);

                if (r) {
                    throw new Error(r);
                }
            })
            .expect(200)
            .end(function (err, res) {
                music._id = res.body._id;
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should strip extra fields from /music post', function (done) {
        request
            .post('/music')
            .set('Content-Type', 'application/json')
            .send(extra)
            .expect('Content-Type', /json/)
            .expect(function(res) {

                var r = jsonProperty.equal(res.body.name , extra.name) ||
                       jsonProperty.equal(res.body.year , extra.year) ||
                       jsonProperty.equal(res.body.artist , extra.artist) ||
                       jsonProperty.equal(res.body.album , extra.album) ||
                       jsonProperty.equal(res.body.label , extra.label) ||
                       jsonProperty.equal(res.body.format , extra.format) ||
                       jsonProperty.equal(res.body.path , extra.path) ||
                       jsonProperty.equal(res.body.extra , null);

                if (r) {
                    throw new Error(r);
                }

            })
            .expect(200)
            .end(function (err, res) {
                extra._id = res.body._id;
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should 400 empty path /music post', function (done) {
        var tmp = {
            name: 'empty',
            format: 'exe',
            year: 'thing'
        }

        request
            .post('/music')
            .set('Content-Type', 'application/json')
            .send(tmp)
            .expect(400, done);
    });

    it('should 400 empty name /music post', function (done) {
        var tmp = {
            year: 'thing',
            format: 'exe',
            path: '/path/'
        }
        request
            .post('/music')
            .set('Content-Type', 'application/json')
            .send(tmp)
            .expect(400, done);
    });

    it('should 400 empty format /music post', function (done) {
        var tmp = {
            name: 'name',
            year: 'thing',
            path: '/path/'
        }
        request
            .post('/music')
            .set('Content-Type', 'application/json')
            .send(tmp)
            .expect(400, done);
    });

    it('should respond to /music get', function (done) {
        request
            .get('/music')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('should 404 a bad id to /music get', function (done) {
        request
            .get('/music/' + 'not here')
            .expect('Content-Type', /json/)
            .expect(404, done);
    });

    it('should respond to /music/:id get ', function (done) {
        request
            .get('/music/' + music._id)
            .expect('Content-Type', /json/)
            .expect(function(res) {

                var r = jsonProperty.equal(res.body.name , music.name) ||
                       jsonProperty.equal(res.body.year , music.year) ||
                       jsonProperty.equal(res.body.artist , music.artist) ||
                       jsonProperty.equal(res.body.album , music.album) ||
                       jsonProperty.equal(res.body.label , music.label) ||
                       jsonProperty.equal(res.body.format , music.format) ||
                       jsonProperty.equal(res.body.path , music.path);

                if (r) {
                    throw new Error(r);
                }

            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });


    it('should respond to /music/:id put ', function (done) {
        music.year = "1111";

        request
            .put('/music/' + music._id)
            .set('Content-Type', 'application/json')
            .send(music)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonProperty.equal(res.body.name , music.name) ||
                       jsonProperty.equal(res.body.year , music.year) ||
                       jsonProperty.equal(res.body.artist , music.artist) ||
                       jsonProperty.equal(res.body.album , music.album) ||
                       jsonProperty.equal(res.body.label , music.label) ||
                       jsonProperty.equal(res.body.format , music.format) ||
                       jsonProperty.equal(res.body.path , music.path);

                if (r) {
                    throw new Error(r);
                }
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should 404 a bad id to /music put', function (done) {
        request
            .put('/music/' + 'not here')
            .expect('Content-Type', /json/)
            .expect(404, done);
    });

    it('should respect put changes to /music/:id get ', function (done) {
        request
            .get('/music/' + music._id)
            .expect('Content-Type', /json/)
            .expect(function(res) {
                var r = jsonProperty.equal(res.body.name , music.name) ||
                       jsonProperty.equal(res.body.year , music.year) ||
                       jsonProperty.equal(res.body.artist , music.artist) ||
                       jsonProperty.equal(res.body.album , music.album) ||
                       jsonProperty.equal(res.body.label , music.label) ||
                       jsonProperty.equal(res.body.format , music.format) ||
                       jsonProperty.equal(res.body.path , music.path);

                if (r) {
                    throw new Error(r);
                }
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });

    it('should respond to (music) /music/:id delete ', function (done) {
        request
            .delete('/music/' + music._id)
            .expect(204, done);
    });

    it('should respond to (extra) /music/:id delete ', function (done) {
        request
            .delete('/music/' + extra._id)
            .expect(204, done);
    });

    it('should 404 missing ids to /music/:id delete ', function (done) {
        request
            .delete('/music/' + music._id)
            .expect(404, done);
    });

    it('should finish empty /music get', function (done) {
        request
            .get('/music')
            .expect([])
            .expect(200, done);
    });

});
