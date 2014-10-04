'use strict';

var db = require('./db.js');

var mdns = require('mdns2');
var util = require('util');
var sockets = require('./sockets.js');
var _ = require('underscore');

// TODO need to listen for all service types
// dev note: try udisks-ssh instead of http
exports.browser = mdns.createBrowser(mdns.makeServiceType('http', 'tcp'));

exports.browser.on('serviceUp', function (service) {
  // ignore other service browsers
  if (service.txtRecord && service.txtRecord.scope && service.txtRecord.type && (service.txtRecord.scope == 'peoplesopen.net') && (service.txtRecord.type == 'service-browser')) {
    console.log('ignoring other service browser on ' + util.inspect(service.addresses));
  }

  service = _.omit(service, 'rawTxtRecord');

  db.put(service.fullname, service, function (err) {
    if (err) { console.log(err); }
    console.log('remembering service ' + service.fullname);
    sockets.broadcast({
      type: 'service',
      action: 'up',
      service: service
    });
  });
});

exports.browser.on('serviceDown', function (service) {
    // ignore other service browsers
    if (service.txtRecord && service.txtRecord.scope && service.txtRecord.type && (service.txtRecord.scope == 'peoplesopen.net') && (service.txtRecord.type == 'service-browser')) {
      console.log('ignoring other service browser on ' + util.inspect(service.addresses));
    }

    service = _.omit(service, 'rawTxtRecord');

    db.del(service.fullname, service, function (err) {
      if (err) { console.log(err); }
      console.log('forgetting service ' + service.unique);
      sockets.broadcast({
        type: 'service',
        action: 'down',
        service: service
      });
    });
});

exports.browser.on('error', function (err) {
  console.log('mdns error: ' + err);
});