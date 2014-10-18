'use strict';

var path = require('path');

module.exports = {
  hostname: 'localhost',
  http_port: parseInt(process.env.HTTP_PORT, 10) || 8001,
  sync_port: parseInt(process.env.SYNC_PORT, 10) || 8002,
  // mdns_port: parseInt(process.env.MDNS_PORT, 10) || 8003,
  feed_file: path.resolve(__dirname, './feed.json'),
  peer_file: path.resolve(__dirname, './peers.json')
};
