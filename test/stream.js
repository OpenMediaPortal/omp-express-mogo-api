/**
* Testing for stream api
*
* @see test/music to verify that the /music code is working
* @author ojourmel
*/

var request = require('supertest');

if ('coverage' == process.env.NODE_ENV) {
    request = request(require('../server'));
} else {
    request = request('http://localhost:8001');
}

// Use the README.md file for testing purposes
// This file is mounted in .travis-docker-compose.yml
var file = {
    name: "readme",
    mimetype: "text/plain",
    path: "README.md"
};

describe('stream api', function () {

    it('should 404 a bad id /stream/:id get', function (done) {
        request
            .get('/stream/' + 'badid')
            .expect(404, done);
    });


    // chain requests as they are done asynchronously
    it('should respond to /stream/:id get', function (done) {

        // Ugly dependency on /library/music/ to populate test data
        request
            .post('/library/music/')
            .set('Content-Type', 'application/json')
            .send(file)
            .end(function (perr, res) {
                file._id = res.body._id;

                // here is the actual test
                request
                    .get('/stream/' + file._id)
                    .expect(200)
                    .expect('Content-Type', new RegExp('^' + file.mimetype + '.*'))
                    .end(function (err, res) {

                        // Clean up test data, again, dependent on /music/
                        request
                            .delete('/library/music/' + file._id)
                            .end(function (derr, res){

                                if (err) {
                                    done(err);
                                } else {
                                    done();
                                }
                            });
                    });
            });
    });
});
