'use strict';

var ssb = require('./ssb.js');
var sockjs = require('sockjs');
var mem = require('./mem.js');
var _ = require('underscore');
var access = require('safe-access');

var clients = [];

exports.socket = sockjs.createServer();

var api = {
  services: {
    upvote: function (service) {
      console.log('UPVOTE: ', service);
    },
    downvote: function (service) {
      console.log('DOWNVOTE: ', service);
    }
  }
};

// access all clients
exports.broadcast = function (keypath, args) {
  clients.forEach(function (client) {
    client.access(keypath, args);
  });
};

exports.send_all_services = function (client) {
  // Iterate through all services in mem and send
  Object.keys(mem).forEach(function (key) {
    client.access('services.up()', mem[key]);
  });
};

exports.socket.on('connection', function (client) {
  // Add access convenience method
  client.access = function (keypath, args) {
    // If single argument, wrap in array
    args = Array.isArray(args) ? args : [ args ];
    var message = JSON.stringify([ keypath, args ]);
    client.write(message);
  };

  // Add client to clients array
  clients.push(client);
  console.log('New client connected (' + clients.length + ' total)');

  // Send all services in mem to client
  exports.send_all_services(client);

  client.on('close', function() {
    // Remove from clients array
    clients = _.without(clients, client);
    console.log('Client disconnected (' + clients.length + ' total)');
  });

  client.on('data', function (message) {
    message = JSON.parse(message);
    access(api, message[0], message[1]);
    console.log('SOCKET MESSAGE: ', message);
  });
});
