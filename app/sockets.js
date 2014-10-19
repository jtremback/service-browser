'use strict';

var ssb = require('./ssb.js');
var sockjs = require('sockjs');
var mem = require('./mem.js');
var _ = require('underscore');
var access = require('safe-access');

var clients = [];

exports.socket = sockjs.createServer();


// send message to all clients
exports.broadcast = function (message) {
  if (typeof message !== 'string') {
    message = JSON.stringify(message);
  }

  clients.forEach(function (client) {
    client.write(message);
  });
};

var routes = {
  services: {
    upvote: function (service) {
      console.log('UPVOTE: ', service);
    },
    downvote: function (service) {
      console.log('DOWNVOTE: ', service);
    }
  }
};

exports.send_all_services = function (client) {
  Object.keys(mem).forEach(function (key) {
    client.write(JSON.stringify({
      type: 'service',
      action: 'up',
      service: mem[key]
    }));
  });
};

exports.socket.on('connection', function (conn) {
  clients.push(conn);
  console.log('New client connected (' + clients.length + ' total)');
  exports.send_all_services(conn);

  conn.on('close', function() {
    clients = _.without(clients, conn);

    console.log('Client disconnected (' + clients.length + ' total)');
  });

  conn.on('data', function (message) {
    message = JSON.parse(message);
    access(routes, message[0], message[1]);
    console.log('SOCKET MESSAGE: ', message);
  });
});