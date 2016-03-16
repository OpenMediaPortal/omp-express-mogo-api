/**
 * @fileoverview Library endpoint
 *
 * This end point will be used to sync the library paths with the database
 * and will interact with omp-config.yml file
 *
 * @author ojourmel
 */

var file = require('../dao/file'),
    config = require('../config');


var typeJson = new RegExp('^application/json');

/**
 * get /library
 *
 */
exports.index = function(req, res) {
    config.load();
    res.send(config.library);
}

/**
 * get /library/:key
 *
 * @example /library/music
 */
exports.show = function(req, res) {
    var key = req.params.key;
    if (config.library[key]) {
        res.send(config.library[key]);
    } else {
        res.status(404).send({'error':'Not Found'});
    }
}

/**
 * post /library
 *
 * Replace the entire library path
 */
exports.create = function(req, res) {

    if (! typeJson.test(req.get('Content-Type'))) {
        return res.status(415).send({'error':'Unsupported Media Type'});
    }

    var lib = req.body;
    // Disallow library types that are not build in to config
    // and add back the types missing in the res
    for (var prop in lib) {

        if (! config.library.hasOwnProperty(prop)) {
            return res.status(400).send({'error':'Bad Format', 'message':'Invalid Property', 'property':prop});
        }

        if (! (lib[prop] instanceof Array)) {
            return res.status(400).send({'error':'Bad Format', 'message':'Invalid Type', 'property':prop});
        }
    }

    for (var prop in config.library) {
        if (! lib.hasOwnProperty(prop)) {
            lib[prop] = [];
        }
    }

    config.library = lib;
    config.save();
    res.send(config.library);
}

/**
 * put /library/:key
 *
 * Replace the key
 */
exports.update = function(req, res) {

    if (! typeJson.test(req.get('Content-Type'))) {
        return res.status(415).send({'error':'Unsupported Media Type'});
    }

    var prop = req.body;
    if (! config.library.hasOwnProperty(req.params.key)) {
        return res.status(400).send({'error':'Bad Format', 'message':'Invalid Property', 'property':req.params.key});
    }
    if (! (prop instanceof Array)) {
        return res.status(400).send({'error':'Bad Format', 'message':'Invalid Type', 'property':req.params.key});
    }

    config.library[req.params.key] = prop
    config.save();
    res.send(config.library[req.params.key]);
}

/**
 * patch /library/:key
 *
 * Append to the key
 */
exports.patch = function(req, res) {

    if (! typeJson.test(req.get('Content-Type'))) {
        return res.status(415).send({'error':'Unsupported Media Type'});
    }

    var prop = req.body;
    if (! config.library.hasOwnProperty(req.params.key)) {
        return res.status(400).send({'error':'Bad Format', 'message':'Invalid Property', 'property':req.params.key});
    }
    if (! (prop instanceof Array)) {
        return res.status(400).send({'error':'Bad Format', 'message':'Invalid Type', 'property':req.params.key});
    }

    config.library[req.params.key].push.apply(config.library[req.params.key], prop);
    config.save();
    res.send(config.library[req.params.key]);
}

/**
 * delete /library/:key
 *
 */
exports.destroy = function(req, res) {

    if (! config.library.hasOwnProperty(req.params.key)) {
        return res.status(404).send({'error':'Not Found'});
    }

    config.library[req.params.key] = [];
    config.save();
    res.status(204).send();
}
