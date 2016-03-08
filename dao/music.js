/**
 * @fileoverview Music dao (model)
 *
 * @author ojourmel
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var musicSchema = new Schema({
    name: {type: String },
    year: {type: String },
    artist: {type: String },
    album: {type: String },
    label: {type: String },
    path: {type: String }
});

module.exports = mongoose.model('music', musicSchema);
