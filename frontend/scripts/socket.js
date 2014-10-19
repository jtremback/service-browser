'use strict';

var SockJS = require('sockjs-client');
var sock = new SockJS(window.location.origin + '/websocket');

var EventEmitter = require('events').EventEmitter;

sock.messages = new EventEmitter();

sock.onopen = function() {
  console.log('open');
};

sock.onmessage = function(e) {
  var data = JSON.parse(e.data);
  console.log('RECIEVED MESSAGE: ', data);

  if (data.type === 'service') {
    if (data.action === 'up') {
      sock.messages.emit('serviceUp', data.service);
    } else if (data.action === 'down') {
      sock.messages.emit('serviceDown', data.service);
    }
  }
};

sock.onclose = function() {
  console.log('close');
};

module.exports = sock;