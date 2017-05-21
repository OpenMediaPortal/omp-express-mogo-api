/**
 * @fileoverview Config and constants for OMP
 *
 * Uses yml parser to interact with omp-config.yml
 *
 * Allow the omp-config.yml api-port option to be overridden by OMP_API_PORT environment
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


config.raw = {};
config.api_port = process.env.OMP_API_PORT || 8001;
config.library = {};
config.library.music =  {
    libmime: 'audio',
    libpath: []
};
config.library.photos = {
    libmime: 'image',
    libpath: []
};
config.library.tv =     {
    libmime: 'video',
    libpath: []
};
config.library.movies = {
    libmime: 'video',
    libpath: []
};
config.library.other =  {
    libmime: '',
    libpath: []
};

// Throw an exception on bad config path
config.load = function() {
    try {
        this.raw = yaml.safeLoad(fs.readFileSync(this.CONFIG_PATH));

        // Sanitize config input
        for (var l in this.raw.library) {
            if ((! this.raw.library[l].hasOwnProperty('libmime')) ||
                (! this.raw.library[l].hasOwnProperty('libpath')) ||
                (! (this.raw.library[l].libpath instanceof Array))) {
                console.log('Removing badly formed library: ' + l);
                delete this.raw.library[l];
            } else if (this.raw.library[l].libmime == null) {
                this.raw.library[l].libmime = '';
            }

            this.library[l] = this.raw.library[l];
        }

        this.api_port = process.env.OMP_API_PORT || this.raw.api_port;
    } catch (e) {
        // Missing config file - write the defaults.
        config.save();
    }
};

config.save = function() {
    this.raw.library = this.library;
    fs.writeFileSync(this.CONFIG_PATH, yaml.safeDump(this.raw, {indent: 4}));
};

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
