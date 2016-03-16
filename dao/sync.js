/**
 * @fileoverview Sync (status) schema
 *
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
});

module.exports = mongoose.model('sync',syncSchema);
