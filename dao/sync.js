/**
 * @fileoverview Sync (status) schema
 *
 * @TODO: Find out why a sync object with no library key is always being inserted into the database
 * @author ojourmel
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('../config');

var syncSchema = new Schema({
    status: {
        syncing: {type: Boolean },
        syncTime: {type: Number },
        totalFiles: {type: Number }
    },
    library: {type: String },
    lastSynced: {type: Date, default: Date.now }
}, { id : false });

syncSchema.statics.init = function(libkey, s) {
    if (config.library.hasOwnProperty(libkey)) {
        if (!s) {
            s = new this();
        }
        s.status = {
                    syncing: false,
                    syncTime: 0,
                    totalFiles: 0
                    };
        s.library = libkey;
        s.lastSynced = null;
    }

    return s;
}

module.exports = mongoose.model('sync',syncSchema);
