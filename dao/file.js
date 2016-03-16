/**
 * @fileoverview Generic file schema
 *
 * @author ojourmel
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var fileSchema = new Schema({
    name: {type: String },
    format: {type: String },
    path: {type: String },
    _type: {type: String }
}, { collection : 'files', discriminatorKey : '_type' });

module.exports = mongoose.model('file',fileSchema);
