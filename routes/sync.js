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

const file = require('../dao/file');
const sync = require('../dao/sync');
const config = require('../config');
const path = require('path');
const mime = require('mime-types');
const walk = require('walk');


/**
 * get /sync
 *
 */
exports.index = function(req, res) {
    sync.find().lean().exec(function(err, s) {
        if (err) {
            res.status(500).send({'error':'Internal Server Error'},
                                 {'error':err});
        } else {
            res.send(s);
        }
    });
};

/**
 * get /sync/:libkey
 *
 * @example /sync/music
 */
exports.show = function(req, res) {
    const libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)){
        return res.status(404).send({'error':'Not Found'});
    }

    sync.findOne({library: libkey}).lean().exec(function(err, s) {
        if (err) {
            res.status(500).send({'error':'Internal Server Error'},
                                 {'error':err});
        } else if (!s) {
            // Config has this library, but we don't have a sync.
            // Initialize it and move on asynchronously
            s = sync.init(libkey);
            s.save(function(err) {
                if (err) {
                    return res.status(500).send({'error':'Internal Server Error'},
                                                {'error':err});
                }
                res.send(s.toObject());
            });
        } else {
            res.send(s);
        }
    });
};

/**
 * put /sync/:libkey
 *
 * @TODO: Make this code incremental, such that instead of removing all files
 *        and reprocessing, only consider new files in the walk
 *
 * @TODO: Move walking into a separate function to avoid anonymous functions
 */
exports.update = function(req, res) {
    const libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)){
        return res.status(404).send({'error':'Not Found'});
    }

    file.remove({library: libkey}, function(err) {
        if (err) {
            return res.status(500).send({'error':'Internal Server Error'},
                                        {'error':err});
        }

        // sync.init is guarantied to return us a valid sync object
        sync.findOne({library: libkey}, function(err, s) {
            if (err) {
                res.status(500).send({'error':'Internal Server Error'},
                                     {'error':err});
            }

            if (!s) {
                s = sync.init(libkey);
            }

            // We are currently running a sync
            if (s.status.syncing == true) {
                return res.status(409).send(s.toObject());
            }
            // Start a sync
            s.status = {
                syncing: true,
                syncTime: 0,
                totalFiles: 0
            };
            s.library = libkey;
            s.lastSynced = Date.now();
            s.save(function(err) {
                if (err) {
                    return res.status(500).send({'error':'Internal Server Error'},
                                                {'error':err});
                }
                if ((!config.library[libkey].libpath) ||
                    (config.library[libkey].libpath.length == 0)){
                    s.status.syncing = false;
                    s.status.syncTime = Date.now() - s.lastSynced;
                    s.save();
                }

                const l = config.library[libkey].libpath.length;
                for (let i=0; i < l; i++){
                    (function(libroot) {
                        const walker = walk.walk(path.join(config.LIBRARY_ROOT ,libroot).toString());
                        walker.on('file', function (root, stats, next) {
                            const n = stats.name;
                            const m = mime.lookup(stats.name).toString();
                            const p = '/' + path.join(root, stats.name).toString().substr(config.LIBRARY_ROOT.length);

                            if (m.match(config.library[libkey].libmime)) {
                                file.parsePath(libkey, n, p, m, function(f) {
                                    if (f) {
                                        f.save(function (err) {
                                            if (err) {
                                                console.log('Error: ' + err);
                                            }
                                            s.status.totalFiles++;
                                            s.status.syncTime = Date.now() - s.lastSynced;
                                            s.save(function (err) {
                                                if (err) {
                                                    console.log('Error: ' + err);
                                                }
                                                next();
                                            });
                                        });
                                    } else {
                                        next();
                                    }
                                });
                            } else {
                                s.status.syncTime = Date.now() - s.lastSynced;
                                s.save();
                                next();
                            }
                        });
                        walker.on('errors', function (root, stat, next) {
                            next();
                        });
                        walker.on('end', function () {
                            s.status.syncing = false;
                            s.status.syncTime = Date.now() - s.lastSynced;
                            s.save();
                        });
                    })(config.library[libkey].libpath[i]);
                }
                return res.send(s.toObject());
            });
        });
    });
};

/**
 * delete /sync/
 *
 */
exports.destroyAll = function(req, res) {
    file.remove({}, function(err) {
        if (err) {
            return res.status(500).send({'error':'Internal Server Error'},
                                 {'error':err});
        }
        sync.remove({}, function(err) {
            if (err) {
                return res.status(500).send({'error':'Internal Server Error'},
                                     {'error':err});
            }
            res.status(204).send();
        });
    });
};

/**
 * delete /sync/:libkey
 *
 */
exports.destroy = function(req, res) {
    const libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)){
        sync.remove({library: libkey}, function() {
            return res.status(404).send({'error':'Not Found'});
        });
    } else {
        file.remove({library: libkey}, function(err) {
            if (err) {
                return res.status(500).send({'error':'Internal Server Error'},
                                     {'error':err});
            }
            sync.remove({library: libkey}, function(err) {
                if (err) {
                    return res.status(500).send({'error':'Internal Server Error'},
                                         {'error':err});
                }
                res.status(204).send();
            });
        });
    }
};
