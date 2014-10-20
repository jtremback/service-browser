'use strict';

var vms = require('./vms.js');

var api = {
  services: vms.services
};

var sock = require('./socket.js');

sock.init(api);
