'use strict';

var level = require('level');
var path = require('path');

module.exports = level(path.resolve('db/services.db'), { encoding: 'json' });