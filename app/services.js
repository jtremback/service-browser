'use strict';

// var db = require('./db.js');

var mdns = require('mdns2');
var util = require('util');
// var sockets = require('./sockets.js');
var _ = require('underscore');
var access = require('safe-access');

var config = require('../config.js');

// TODO need to listen for all service types
// dev note: try udisks-ssh instead of http
exports.browser = mdns.createBrowser(mdns.makeServiceType('http', 'tcp'));

mdns.createAdvertisement('_http._tcp', config.port, {txtRecord: {
    name: 'Service Browser',
    description: 'Browse services on People\'s Open Network',
    scope: 'peoplesopen.net',
    type: 'service-browser'
}});

exports.browser.on('serviceUp', function (service) {
  console.log('serviceUp', service);
  // ignore other service browsers
  if (service.txtRecord &&
     (service.txtRecord.scope === 'peoplesopen.net') &&
     (service.txtRecord.type === 'service-browser')) {
    console.log('ignoring other service browser on ' + util.inspect(service.addresses));
  } else {
    service = _.omit(service, 'rawTxtRecord');
  }


  // db.put(service.fullname, service, function (err) {
  //   if (err) { console.log(err); }
  //   console.log('remembering service ' + service.fullname);
  //   sockets.broadcast({
  //     type: 'service',
  //     action: 'up',
  //     service: service
  //   });
  // });
});

exports.browser.on('serviceDown', function (service) {
    // ignore other service browsers
    if (service.txtRecord && service.txtRecord.scope && service.txtRecord.type && (service.txtRecord.scope == 'peoplesopen.net') && (service.txtRecord.type == 'service-browser')) {
      console.log('ignoring other service browser on ' + util.inspect(service.addresses));
    }

    service = _.omit(service, 'rawTxtRecord');

    // db.del(service.fullname, service, function (err) {
    //   if (err) { console.log(err); }
    //   console.log('forgetting service ' + service.unique);
    //   sockets.broadcast({
    //     type: 'service',
    //     action: 'down',
    //     service: service
    //   });
    // });
});

exports.browser.on('error', function (err) {
  console.log('mdns error: ' + err);
});