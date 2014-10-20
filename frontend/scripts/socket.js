'use strict';

var SockJS = require('sockjs-client');
var sock = new SockJS(window.location.origin + '/websocket');
var access = require('safe-access');
var api;

module.exports = sock;

sock.init = function (arg) {
  api = arg;
};

sock.onmessage = function(e) {
  var message = JSON.parse(e.data);
  access(api, message[0], message[1]);
  console.log('SOCKET MESSAGE: ', message);
};

sock.access = function (keypath, args) {
  // If single argument, wrap in array
  args = Array.isArray(args) ? args : [ args ];
  var message = JSON.stringify([ keypath, args ]);
  sock.send(message);
};
