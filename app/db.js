'use strict';

var level = require('level');
var path = require('path');
var pull = require('pull-stream');
var Buffer = require('buffer').Buffer;
var colors = require('colors');
var path = require('path');
var fs = require('fs');
var mapTypes = require('./map-types.js');

var net = require('net');
var toStream = require('pull-stream-to-stream');

var services = exports.services = level(path.resolve('db/services.db'), { encoding: 'json' });
var profile = exports.profile = level(path.resolve('db/profiles.db'), { encoding: 'json' });

var config = require('../config.js');

// create a scuttlebutt instance and add a message to it.

var ssb = require('secure-scuttlebutt/create')('db/scuttlebutt.db');

//create a feed.
//this represents a write access / user.
//you must pass in keys.
//(see options section)

// var feed = ssb.createFeed();
// var message = [
// '',
// '',
// 'SERVICE BROWSER INITIAL CONFIGURATION'.bold.cyan + '  ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★'.blue,
// 'Since you don\'t have a .secrets.json file configured, we\'re going',
// 'to generate a new profile for you. Copy the green text below and',
// 'paste it into a file called .secrets.json in',
// path.resolve(__dirname, '../.secrets.json')
// ].join('\n');
// console.log(message);
// console.log(JSON.stringify(feed).green);

// var manifest = {
//   id: Buffer,
//   keys: {
//     private: Buffer,
//     public: Buffer
//   }
// };

var secrets_path = path.resolve(__dirname, '../.secrets.json');

function initFeed (secrets_path, callback) {
  fs.readFile(secrets_path, { encoding: 'utf8' }, function (err, data) {
    var feed;
    var map = {
      id: 'buffer',
      keys: {
        private: 'buffer',
        public: 'buffer'
      }
    };

    if (err) {
      feed = ssb.createFeed();
      // Possibly have some kind of prompt
      fs.writeFile(secrets_path, JSON.stringify(feed));
      return callback(feed);
    }

    data = mapTypes(JSON.parse(data), map);
    feed = ssb.createFeed(data.keys);
    console.log('feed', feed)
    return callback(feed);
  });
}

exports.addPeer = function (address, id, callback) {
    net.createServer(function (stream) {
      stream.pipe(toStream(ssb.createReplicationStream())).pipe(stream);
    }).listen(config.port);

    var stream = net.connect(id);
    stream.pipe(toStream(ssb.createReplicationStream())).pipe(stream);
};


// initFeed(secrets_path, function (err, feed) {
//   setInterval(function () {
//     // feed.add appends a message to your key's chain.
//     feed.add('msg', Math.random(), function (err, msg, hash) {
//       //the message as it appears in the database.
//       console.log('msg', msg);

//       //and it's hash
//       console.log('hash', hash);
//     });
//   }, 1995);


//   net.createServer(function (stream) {
//     stream.pipe(toStream(ssb.createReplicationStream())).pipe(stream);
//   }).listen(1234);

//   var ssb2 = require('secure-scuttlebutt/create')('db/scuttlebutt2.db');
//   console.log(feed)
//   ssb2.follow(feed.id);

//   var stream = net.connect(1234);
//   stream.pipe(toStream(ssb2.createReplicationStream())).pipe(stream);

//   pull(
//     ssb2.createHistoryStream(feed.id, 0, false),
//     pull.collect(function (err, ary) {
//       console.log('createHistoryStream', ary);
//     })
//   );
// });

// module.exports = level(path.resolve('db/services.db'), { encoding: 'json' });
