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

function initFeed (secrets_path) {
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
      fs.writeFile(secrets_path, JSON.stringify(feed));
      return feed;
    }

    data = mapTypes(JSON.parse(data), map);
    feed = ssb.createFeed(data.keys);

    return feed;
  });
}

//   // setInterval(function () {
//   //   // feed.add appends a message to your key's chain.
//   //   feed.add('msg', Math.random(), function (err, msg, hash) {
//   //     //the message as it appears in the database.
//   //     console.log('msg', msg);

//   //     //and it's hash
//   //     console.log('hash', hash);
//   //   });
//   // }, 1995);

//   // setInterval(function () {
//     // get all messages for a particular key.

//   // }, 2000);

//   // // create a server for replication.
//   net.createServer(function (stream) {
//     // secure-scuttlebutt uses pull-streams so
//     // convert it into a node stream before piping.
//     stream.pipe(toStream(ssb.createReplicationStream())).pipe(stream);
//   }).listen(1234);

//   //create another database to replicate with:

//   var ssb2 = require('secure-scuttlebutt/create')('db/scuttlebutt2.db');
//   //follow the key we created before.
//   ssb2.follow(feed.id);

//   // replicate from the server.
//   // this will pull the messages by feed1 into this database.
//   var stream = net.connect(1234);
//   stream.pipe(toStream(ssb2.createReplicationStream())).pipe(stream);

//   pull(
//     ssb2.createHistoryStream(feed.id, 0, false),
//     pull.collect(function (err, ary) {
//       console.log('createHistoryStream', ary);
//     })
//   );
// });


// // the first message in the feed is always the public key.
// //add a message to your feed.



