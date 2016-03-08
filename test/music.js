/**
* Testing for music api
*
* @see jsonEqual to avoid bad mocha checks of returning JSON
*
* @author ojourmel
*/
var request = require('supertest');

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
    path: "TestPath"
};

var extra = {
    name: "ExtraNaem",
    year: "9999",
    artist: "TestArtist",
    album: "TestAlbum",
    label: "TestLabel",
    path: "TestPath",
    extra: "EXTRA"

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
                var r = jsonEqual(res.body.name , music.name) ||
                       jsonEqual(res.body.year , music.year) ||
                       jsonEqual(res.body.artist , music.artist) ||
                       jsonEqual(res.body.album , music.album) ||
                       jsonEqual(res.body.label , music.label) ||
                       jsonEqual(res.body.path , music.path)

                if (r){
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

                var r = jsonEqual(res.body.name , extra.name) ||
                       jsonEqual(res.body.year , extra.year) ||
                       jsonEqual(res.body.artist , extra.artist) ||
                       jsonEqual(res.body.album , extra.album) ||
                       jsonEqual(res.body.label , extra.label) ||
                       jsonEqual(res.body.path , extra.path) ||
                       jsonEqual(res.body.extra , null);

                if (r){
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

                var r = jsonEqual(res.body.name , music.name) ||
                       jsonEqual(res.body.year , music.year) ||
                       jsonEqual(res.body.artist , music.artist) ||
                       jsonEqual(res.body.album , music.album) ||
                       jsonEqual(res.body.label , music.label) ||
                       jsonEqual(res.body.path , music.path)

                if (r){
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
                var r = jsonEqual(res.body.name , music.name) ||
                       jsonEqual(res.body.year , music.year) ||
                       jsonEqual(res.body.artist , music.artist) ||
                       jsonEqual(res.body.album , music.album) ||
                       jsonEqual(res.body.label , music.label) ||
                       jsonEqual(res.body.path , music.path)

                if (r){
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
                var r = jsonEqual(res.body.name , music.name) ||
                       jsonEqual(res.body.year , music.year) ||
                       jsonEqual(res.body.artist , music.artist) ||
                       jsonEqual(res.body.album , music.album) ||
                       jsonEqual(res.body.label , music.label) ||
                       jsonEqual(res.body.path , music.path)

                if (r){
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

/**
 * @TODO Make this function global to all testing scripts
 *
 */
function jsonEqual(j1, j2)
{
    if (j1 != j2) {
        return "Error: " + j1 + " != " + j2;
    } else {
        return null;
    }
}
