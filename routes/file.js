/**
 * @fileoverview file endpoint
 *
 * Uses JSON for post and put requests
 * @author ojourmel
 */

var file = require('../dao/file'),
    config = require('../config'),
    url = require('url');

var typeJson = new RegExp('^application/json');


/**
 * get /library/:libkey
 *
 */
exports.index = function(req, res) {
    var libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)) {
        return res.status(404).send({'error':'Not Found'});
    }

    file.find({library: libkey}).lean().exec(function(err, f) {
        if (err) {
            res.status(500).send([{'error':'Internal Server Error'},
                                 {'error':err}]);
        } else {
            res.send(f);
        }
    });
}

/**
 * get /library/:libkey/:id
 *
 */
exports.show = function(req, res) {
    var libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)) {
        return res.status(404).send({'error':'Not Found'});
    }

    file.findOne({library: libkey, _id: req.params.id}).lean().exec(function(err, f) {
        if (err || !f) {
            res.status(404).send({'error':'Not Found'});
        } else {
            res.send(f);
        }
    });
};

/**
 * post /library/:libkey/
 *
 */
exports.create = function(req, res) {
    var libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)) {
        return res.status(404).send({'error':'Not Found'});
    }
    if (! typeJson.test(req.get('Content-Type'))) {
        return res.status(415).send({'error':'Unsupported Media Type'});
    }

    var f = file.parseJSON(libkey, req.body);
    if (f.library && f.name && f.path && f.mimetype) {
        f.save(function(err){
            if (err) {
                res.status(500).send([{'error':'Internal Server Error'},
                                     {'error':err}]);
            }
            var loc = url.format(
                        {
                            protocol: req.protocol,
                            host: req.get('host'),
                            pathname: req.originalUrl
                        });
            loc += (loc.charAt(loc.length-1) == '/') ? f._id : '/' + f._id;
            res.location(loc);
            res.status(201).send(f.toObject());
        });
    } else {
        res.status(400).send({'error':'Bad Format', 'body':f});
    }
}

/**
 * put /library/:libkey/:id
 *
 */
exports.update = function(req, res) {
    var libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)) {
        return res.status(404).send({'error':'Not Found'});
    }
    if (! typeJson.test(req.get('Content-Type'))) {
        return res.status(415).send({'error':'Unsupported Media Type'});
    }

    file.findOne({library: libkey, _id: req.params.id},function(err, f) {
        if (err || !f) {
            res.status(404).send({'error':'Not Found'});
        } else {

            f = file.parseJSON(libkey, req.body, f);

            if (f.name && f.path && f.mimetype) {
                f.save(function(err){
                    if (err) {
                        res.status(500).send([{'error':'Internal Server Error'},
                                             {'error':err}]);
                    } else {
                        res.send(f.toObject());
                    }
                });
            } else {
                res.status(400).send({'error':'Bad Format'});
            }
        }
    });
}

/**
 * delete /library/:libkey/:id
 *
 */
exports.destroy = function(req, res) {
    var libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)) {
        return res.status(404).send({'error':'Not Found'});
    }

    file.findOne({library: libkey, _id: req.params.id},function(err, f) {
        if (err || !f) {
            res.status(404).send({'error':'Not Found'});
        } else {
            f.remove();
            res.status(204).send();
        }
    });
}
