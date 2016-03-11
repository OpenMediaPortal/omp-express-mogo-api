/**
* Testing for stream api
*
* @see jsonProperty to avoid bad mocha checks of returning JSON
* @see test/music to verify that the /music code is working
* @author ojourmel
*/
var request = require('supertest'),
    jsonProperty = require('./jsonProperty');

request = request("http://localhost:8001");

// Use the README.md file for testing purposes
// This file is mounted in .travis-docker-compose.yml
var file = {
    name: "readme",
    format: "text/plain",
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

        // Ugly dependency on /music/ to populate test data
        request
            .post('/music/')
            .set('Content-Type', 'application/json')
            .send(file)
            .end(function (perr, res) {
                file._id = res.body._id;

                // here is the actual test
                request
                    .get('/stream/' + file._id)
                    .expect(200)
                    .expect('Content-Type', new RegExp('^' + file.format + '.*'))
                    .end(function (err, res) {

                        // Clean up test data, again, dependent on /music/
                        request
                            .delete('/music/' + file._id)
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
