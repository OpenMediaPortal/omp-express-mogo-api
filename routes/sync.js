/**
 * @fileoverview Sync endpoint
 *
 * Using the current library, analyze the file system for files which can be served
 * and add them into the database, with the appropriate tags
 *
 * The actual scanning / analysis, is done asynchronously
 *
 * @author ojourmel
 */

var file = require('../dao/file'),
    music = require('../dao/music'),
    sync = require('../dao/sync'),
    config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    walk = require('walk');


/**
 * get /library/sync
 *
 */
exports.index = function(req, res) {
    sync.find().lean().exec(function(err, s) {
        if (err) {
            res.status(404).send({'error':'Not Found'});
        } else {
            res.send(s);
        }
    });
}

/**
 * get /library/:key/sync
 *
 * @example /library/music/sync
 */
exports.show = function(req, res) {
    sync.findOne({library: req.params.key}).lean().exec(function(err, s) {
        if (err || !s) {
            res.status(404).send({'error':'Not Found'});
        } else {
            res.send(s);
        }
    });
}

/**
 * put /library/:key/sync
 *
 * @TODO: Make this code incremental, such that instead of removing all files
 *        and reprocessing, only concider new files in the walk
 */
exports.update = function(req, res) {
    file.remove({_type: req.params.key}, function(err) {
        if (err) {
            return res.status(500).send({'error':'Internal Server Error'},
                                        {'error':err});
        }
        sync.findOne({library: req.params.key}, function(err, s) {
            if (err || !s) {
                return res.status(404).send({'error':'Not Found'});
            } else {
                // We are currently running a sync
                if (s.status.syncing == true) {
                    return res.status(409).send(s.toObject());
                }
                s.status = {
                    syncing: true,
                    syncTime: 0,
                    totalFiles: 0
                };
                s.library = req.params.key;
                s.lastSynced = Date.now();
                s.save(function(err) {
                    if (err) {
                        return res.status(500).send({'error':'Internal Server Error'},
                                                    {'error':err});
                    }
                    if (config.library[req.params.key].length == 0){
                        s.status.syncing = false;
                        s.status.syncTime = Date.now() - s.lastSynced;
                        s.save();
                    }
                    for (var i=0; i < config.library[req.params.key].length; i++){
                        (function(libroot) {
                            // TODO: Add filters and whatnot
                            var walker = walk.walk(libroot);
                            walker.on("files", function (root, stats, next) {
                                var f = new file({ name: stats[0].name,
                                                   format: 'text/plain',
                                                   path: path.join(root, stats[0].name).toString(),
                                                   _type: req.params.key});
                                f.save();
                                s.status.totalFiles++;
                                s.status.syncTime = Date.now() - s.lastSynced;
                                s.save();
                                next();
                            });
                            walker.on("error", function (root, stat, next) {
                                next();
                            });
                            walker.on("end", function () {
                                s.status.syncing = false;
                                s.status.syncTime = Date.now() - s.lastSynced;
                                s.save();
                            });
                        })(config.library[req.params.key][i]);
                    }
                    return res.send(s.toObject());
                });
            }
        });
    });
}

/**
 * delete /library/:key/sync
 *
 */
exports.destroy = function(req, res) {

    // remove all files in the database - this includes music, photos, etc.
    file.remove({_type: req.params.key}, function(err) {
        if (err) {
            return res.status(500).send({'error':'Internal Server Error'},
                                 {'error':err});
        }
        sync.findOne({library: req.params.key}, function(err, s) {
            if (err || !s) {
                return res.status(404).send({'error':'Not Found'});
            }
            s.status = {
                syncing: false,
                syncTime: 0,
                totalFiles: 0
            };
            s.library = req.params.key;
            s.lastSynced = null;
            s.save(function(err){
                if (err) {
                    return res.status(500).send({'error':'Internal Server Error'},
                                                {'error':err});
                }
                res.status(204).send();
            });
        });
    });
}
