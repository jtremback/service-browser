'use strict';

var path = require('path');

module.exports = {
  hostname: 'localhost',
  scuttlebutt: path.resolve(__dirname, process.env.SCUTTLEBUTT || './db/scuttlebutt.db'),
  http_port: parseInt(process.env.HTTP_PORT, 10) || 8001,
  sync_port: parseInt(process.env.SYNC_PORT, 10) || 8000,
  feed_file: path.resolve(__dirname, process.env.FEED_FILE || './feed.json'),
  peer_file: path.resolve(__dirname, process.env.PEER_FILE || './peers.json')
};
