/**
 * @fileoverview Config and constants for OMP
 *
 * Uses yml parser to interact with omp-config.yml
 *
 * @author ojourmel
 */

var fs = require('fs'),
    yaml = require('js-yaml');

var config = {};

// A few constants can be set by the environment
config.CONFIG_PATH = process.env.OMP_CONFIG_PATH || './omp-config.yml';
config.NODE_ENV = process.env.NODE_ENV || 'development';
config.MONGO_HOST = process.env.OMP_MONGO_HOST || 'omp-mongo';
config.LIBRARY_ROOT = process.env.OMP_LIBRARY_ROOT || '/srv/data/';


// initalize all possible options so that we can freeze config
config.raw = {};
config.api_port = 8001;
config.library = {};
config.library.music = [];
config.library.photos = [];
config.library.tv = [];
config.library.movies = [];
config.library.other = [];

// Throw an exception on bad config path
config.load = function() {
    this.raw = yaml.safeLoad(fs.readFileSync(this.CONFIG_PATH));
    this.library = this.raw.library;
    this.api_port = this.raw.api_port;
}

config.save = function() {
    this.raw.library = this.library;
    this.raw.api_port = this.api_port;
    fs.writeFileSync(this.CONFIG_PATH, yaml.safeDump(this.raw, {indent: 4}));
}

/*
 * Set constants.
 * The values set in CONFIG_PATH however, are not frozen
 * and can be freely modified.
 *
 */
Object.freeze(config.CONFIG_PATH);
Object.freeze(config.NODE_ENV);
Object.freeze(config.MONGO_HOST);
Object.freeze(config.LIBRARY_ROOT);

/*
 * Overwrite module export object to be config
 * @see http://www.hacksparrow.com/node-js-exports-vs-module-exports.html
 *
 */
module.exports = config;
