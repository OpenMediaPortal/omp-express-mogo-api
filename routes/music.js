/**
 * @fileoverview Music music endpoint
 *
 * @TODO: Use JSON for post, put and patch requests
 * @author ojourmel
 */

var music = require('../dao/music'),
    url = require('url');

/**
 * get /music
 *
 */
exports.index = function(req, res) {
    music.find().lean().exec(function(err, m) {
        if (err) {
            res.status(404).send({'error':'Not Found'});
        } else {
            res.send(m);
        }
    });
}

/**
 * get /music/:id
 *
 */
exports.show = function(req, res) {
    music.findOne({_id: req.params.id}).lean().exec(function(err, m) {
        if (err || !m) {
            res.status(404).send({'error':'Not Found'});
        } else {
            res.send(m);
        }
    });
};

/**
 * post /music
 *
 */
exports.create = function(req, res) {

    var m = new music({ name: req.body.name,
                        year: req.body.year,
                        artist: req.body.artist,
                        album: req.body.album,
                        label: req.body.label,
                        format: req.body.format,
                        path: req.body.path});

    if (m.name && m.path && m.format) {
        m.save(function(err){
            if (err) {
                res.status(500).send({'error':'Internal Server Error'},
                                     {'error':err});
            }
            var loc = url.format(
                        {
                            protocol: req.protocol,
                            host: req.get('host'),
                            pathname: req.originalUrl
                        });
            loc += (loc.charAt(loc.length-1) == '/') ? m._id : '/' + m._id;
            res.location(loc);
            res.status(201).send(m.toObject());
        });
    } else {
        res.status(400).send({'error':'Bad Format'});
    }
}

/**
 * put /music/:id
 *
 */
exports.update = function(req, res) {
    music.findOne({_id: req.params.id},function(err, m) {
        if (err || !m) {
            res.status(404).send({'error':'Not Found'});
        } else {
            m.name = req.body.name;
            m.year = req.body.year;
            m.artist = req.body.artist;
            m.album = req.body.album;
            m.label = req.body.label;
            m.format = req.body.format;
            m.path = req.body.path;

            if (m.name && m.path && m.format) {
                m.save(function(err){
                    if (err) {
                        res.status(500).send({'error':'Internal Server Error'},
                                             {'error':err});
                    } else {
                        res.send(m.toObject());
                    }
                });
            } else {
                res.status(400).send({'error':'Bad Format'});
            }
        }
    });
}

/**
 * patch /music/:id
 *
 */
exports.patch = function(req, res) {
    music.findOne({_id: req.params.id},function(err, m) {
        if (err || !m) {
            res.status(404).send({'error':'Not Found'});
        } else {
            m.name = req.body.name || m.name;
            m.year = req.body.year || m.year;
            m.artist = req.body.artist || m.artist;
            m.album = req.body.album || m.album;
            m.label = req.body.label || m.label;
            m.format = req.body.format || m.format;
            m.path = req.body.path || m.path;

            if (m.name && m.path && m.format) {
                m.save(function(err){
                    if (err) {
                        res.status(500).send({'error':'Internal Server Error'},
                                             {'error':err});
                    } else {
                        res.send(m.toObject());
                    }
                });
            } else {
                res.status(400).send({'error':'Bad Format'});
            }
        }
    });
}

/**
 * delete /music/:id
 *
 */
exports.destroy = function(req, res) {
    music.findOne({_id: req.params.id},function(err, m) {
        if (err || !m) {
            res.status(404).send({'error':'Not Found'});
        } else {
            m.remove();
            res.status(204).send();
        }
    });
}
