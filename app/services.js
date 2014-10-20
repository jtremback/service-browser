'use strict';

var ssb = require('./ssb.js');

var mdns = require('mdns2');
var util = require('util');
var sockets = require('./sockets.js');
var _ = require('underscore');
var mem = require('./mem.js');

// TODO need to listen for all service types
// dev note: try udisks-ssh instead of http
exports.browser = mdns.createBrowser(mdns.makeServiceType('http', 'tcp'));

// opts = {
//   trusted_peers,
//   feed_file,
//   sync_port
// }

exports.start = function (opts) {
  ssb.start(opts, function (err, feed) {
    exports.browser.start();

    mdns.createAdvertisement('_http._tcp', opts.sync_port, {
      name: feed.id.toString('base64'),
      txtRecord: {
        name: 'Service Browser',
        description: 'Browse services on People\'s Open Network',
        scope: 'peoplesopen.net',
        type: 'service-browser'
      }
    }).start();
  });
};

exports.browser.on('serviceUp', function (service) {
  service = _.omit(service, 'rawTxtRecord');
  console.log('SERVICE UP: ', service);
  // connect to other service browsers
  if (service.txtRecord &&
     (service.txtRecord.scope === 'peoplesopen.net') &&
     (service.txtRecord.type === 'service-browser')) {
    console.log('SERVICE BROWSER DETECTED');
    ssb.addPeer(/*service.addresses[1] + ':' +*/ service.port, service.name);
  } else {
    mem[service.name] = service;
    sockets.broadcast('services.up()', service);
  }
});

exports.browser.on('serviceDown', function (service) {
    service = _.omit(service, 'rawTxtRecord');

    console.log('SERVICE DOWN: ', service);

    delete mem[service.name];
    sockets.broadcast('services.down()', service);
});

exports.browser.on('error', function (err) {
  console.log('mdns error: ' + err);
});