'use strict';
var dev = require('./dev');
var prod = require('./prod');

function config() {
    switch (process.env.NODE_ENV) {
        case 'dev':
            return dev;
            break;
        case 'prod':
            return prod;
            break;
        default:
            return dev;
    }
}
module.exports = config();
