/**
 * @fileoverview Library endpoint
 *
 * This end point will be used to sync the library paths with the database
 * and will interact with omp-config.yml file
 *
 * @author ojourmel
 *
 */

const file = require('../dao/file');
const sync = require('../dao/sync');
const config = require('../config');


const typeJson = new RegExp('^application/json');

/**
 * get /library
 *
 */
exports.index = function(req, res) {
    config.load();
    res.send(config.library);
};

/**
 * post /library
 *
 * Replace the entire library path
 */
exports.create = function(req, res) {

    if (! typeJson.test(req.get('Content-Type'))) {
        return res.status(415).send({'error':'Unsupported Media Type'});
    }
    config.library = {};

    const lib = req.body;
    for (const prop in lib) {
        if ((!lib[prop].hasOwnProperty('libmime')) ||
            (lib[prop].libmime == null) ||
            (!lib[prop].hasOwnProperty('libpath')) ||
            (!(lib[prop].libpath instanceof Array))) {
            return res.status(400).send({'error':'Bad Format', 'message':'Invalid Type', 'property':prop});
        }

        config.library[prop] = {libmime: lib[prop].libmime, libpath: lib[prop].libpath};
    }
    config.save();
    res.send(config.library);
};

/**
 * put /library/:libkey
 *
 * Replace the libkey
 */
exports.update = function(req, res) {
    const libkey = req.params.libkey;

    if (! typeJson.test(req.get('Content-Type'))) {
        return res.status(415).send({'error':'Unsupported Media Type'});
    }

    const prop = req.body;
    if ((!prop.hasOwnProperty('libmime')) ||
        (prop.libmime == null) ||
        (!prop.hasOwnProperty('libpath')) ||
        (!(prop.libpath instanceof Array))) {
        return res.status(400).send({'error':'Bad Format', 'message':'Invalid Type', 'property':prop});
    }

    config.library[libkey] = prop;
    config.save();
    res.send(config.library[libkey]);
};

/**
 * delete /library/:libkey
 *
 */
exports.destroy = function(req, res) {
    const libkey = req.params.libkey;

    if (! config.library.hasOwnProperty(libkey)) {
        return res.status(404).send({'error':'Not Found'});
    }

    file.remove({library: libkey}, function() {
        sync.remove({library: libkey}, function() {
            delete config.library[libkey];
            config.save();
            res.status(204).send();
        });
    });
};
