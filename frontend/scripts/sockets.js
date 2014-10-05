'use strict';

var SockJS = require('sockjs-client');
var sock = new SockJS(window.location.origin + '/websocket');

var EventEmitter = require('events').EventEmitter;

module.exports = new EventEmitter();

sock.onopen = function() {
  console.log('open');
};

sock.onmessage = function(e) {
  var data = JSON.parse(e.data);

  if (data.type === 'service') {
    if (data.action === 'up') {
      module.exports.emit('serviceUp', data.service);
    } else if(data.action === 'down') {
      module.exports.emit('serviceDown', data.service);
    }
  }
};

sock.onclose = function() {
  console.log('close');
};



function serviceUp (service) {
  if (service.txtRecord && service.txtRecord.scope === 'peoplesopen.net') {
    // service.host = service.host.replace(/\.$/, '');

    // if (service.type.name === 'http') {
    //   service.link = {
    //     url: 'http://' + service.addresses[0] + ':' + service.port + '/',
    //     name: service.name
    //   };
    // } else if (service.type.name === 'https') {
    //   service.link = {
    //     url: 'https://' + service.addresses[0] + ':' + service.port + '/',
    //     name: service.name
    //   };
    // }

    module.exports.emit('serviceUp', service);
  }
}

function serviceDown (service) {
  module.exports.emit('serviceDown', service);
}

// [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]