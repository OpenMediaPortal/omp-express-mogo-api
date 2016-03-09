/**
 * @fileoverview Music dao (model)
 *
 * @author ojourmel
 */

var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    fileSchema = require('./file').schema,
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var musicSchema = fileSchema.extend({
    year: {type: String },
    artist: {type: String },
    album: {type: String },
    label: {type: String }
});

module.exports = mongoose.model('music', musicSchema);
