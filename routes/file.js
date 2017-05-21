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
 * get /library/:libkey?group=:group&sort=:sort
 *
 */
exports.index = function(req, res) {
    var libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)) {
        return res.status(404).send({'error':'Not Found'});
    }

    /*
     * Response object from /library/music/?group=artist,album,title
     *
     *  f: {
     *      group: [
     *          "artist",
     *          "album",
     *          "title"
     *      ],
     *      index: {
     *          artist: {
     *              "Green Day" : [[0,0]]
     *          },
     *          album: {
     *              "21st Century" : [[0,0]]
     *          },
     *          title: {
     *              "21 Guns" : [[0,0]]
     *          }
     *      },
     *      lookup: {
     *          "1234": 0
     *      }
     *      files: [
     *          {
     *              id: "1234",
     *              title: "21 Guns",
     *              artist : "Green Day",
     *              album : "21st Century",
     *          }
     *      ]
     *  }
     *
     */
    var f = {
        group: [],
        index: {},
        lookup: {},
        files: []
    };
    var group = req.query.group;
    var sort = req.query.sort;

    // Sort object passed to Mongo (GroupSort)
    var gs = {};

    // Sort flat results by group first
    // use 'truthy' check for group and sort
    if ( group ) {
        group = group.split(',');

        for (var i=0; i<group.length; i++) {
            gs[group[i]] = 1;
            f.index[group[i]] = {};
        }
    } else {
        group = ['name'];
        f.index[group[0]] = {};
    }

    // add sorting (alphabetical, etc) after
    // applied within each subgroup of the grouping
    if ( sort ) {
        sort = sort.split(',');
        for (var i=0; i<sort.length; i++) {
            // Support only alphabetical A-Z for now
            // Use -1 for Z-A
            gs[sort[i]] = 1;
        }
    } else {
        sort = ['name'];
    }

    // execute query
    file.find({library: libkey}, {library: 0, path: 0, __v:0}).sort(gs).exec(function(err, results) {
        if (err) {
            res.status(500).send([{'error':'Internal Server Error'},
                                 {'error':err}]);
        } else {
            f.group = group;
            f.files = results;

            // Build the index. Brute force update each group
            // info for each file
            for (var i=0; i<f.files.length; i++) {
                for (var j=0; j<group.length; j++) {
                    var key = f.files[i][group[j]];

                    if ( key ) {
                        // Group does not exist in index.
                        // Add the basic [[i,i]] entry
                        if (f.index[group[j]][key] == null) {
                            f.index[group[j]][key] = [[i,i]];
                        } else {
                            var last = f.index[group[j]][key].pop();
                            // This file is adjacent to the current group entry
                            // Modify it from [[x,y], [x,i]]
                            if ((last[1]+1) == i) {
                                last[1]++;
                                f.index[group[j]][key].push(last);
                            // This file is *not* adjacent. Add a new
                            // [i,i] entry giving: [[a,a], [b,b], ... ,[i,i]]
                            } else {
                                f.index[group[j]][key].push(last);
                                f.index[group[j]][key].push([i,i]);
                            }
                        }
                    }
                }
                f.lookup[f.files[i]._id] = i;
            }
            res.send(f);
        }
    });
};

/**
 * get /library/:libkey/:id
 *
 */
exports.show = function(req, res) {
    var libkey = req.params.libkey;
    if (! config.library.hasOwnProperty(libkey)) {
        return res.status(404).send({'error':'Not Found'});
    }

    file.findOne({library: libkey, _id: req.params.id}, {__v:0}).lean().exec(function(err, f) {
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
};

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
};

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
};
