/**
 * @fileoverview Music music endpoint
 *
 * @author ojourmel
 */

var music = require('../dao/music');

/**
 * get /music
 *
 */
exports.findAll = function(req, res) {
    music.find().lean().exec(function(err, musics) {
        if (err) {
            res.status(404).send({'error':'Not Found'});
        } else {
            res.send(musics);
        }
    });
}

/**
 * get /music/:id
 *
 */
exports.findById = function(req, res) {
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
exports.addMusic = function(req, res) {

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
            res.send(m.toObject());
        });
    } else {
        res.status(400).send({'error':'Bad Format'});
    }
}

/**
 * put /music/:id
 *
 */
exports.updateMusic = function(req, res) {
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
 * delete /music/:id
 *
 */
exports.deleteMusic = function(req, res) {
    music.findOne({_id: req.params.id},function(err, m) {
        if (err || !m) {
            res.status(404).send({'error':'Not Found'});
        } else {
            m.remove();
            res.status(204).send();
        }
    });
}
