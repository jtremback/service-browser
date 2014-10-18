'use strict';
// create a scuttlebutt instance and add a message to it.
var ssb = require('secure-scuttlebutt/create')('scuttletest.db');
var pull = require('pull-stream');
var mapTypes = require('./app/map-types.js');
//create a feed.
//this represents a write access / user.
//you must pass in keys.
//(see options section)

// var type_map = {
//   Buffer: {
//     detect: function (x) {
//       return Buffer.isBuffer(x);
//     },
//     pack: function (x) {
//       return JSON.stringify(x);
//     },
//     unpack: function (x) {
//       return new Buffer(x);
//     }
//   }
// };
//
var map = {
  private: 'buffer',
  public: 'buffer'
};


// var cs1 = cs({ typeMap: type_map });
// var keys = cs1.deserialize('{"private":{"@#csV":"[86,167,26,31,196,116,55,40,170,36,9,44,85,96,56,50,199,63,50,2,109,157,65,17,82,248,100,86,203,192,148,97]","@#csL":"Buffer"},"public":{"@#csV":"[198,202,32,155,226,58,90,188,137,129,64,14,246,246,17,233,27,26,97,22,15,92,39,53,65,15,84,13,156,6,232,86,64,89,31,160,209,180,0,234,213,168,189,73,150,34,156,177,249,191,60,85,147,51,42,68,185,72,106,249,194,113,222,98]","@#csL":"Buffer"}}');

var keys = JSON.parse('{"private": [86, 167, 26, 31, 196, 116, 55, 40, 170, 36, 9, 44, 85, 96, 56, 50, 199, 63, 50, 2, 109, 157, 65, 17, 82, 248, 100, 86, 203, 192, 148, 97], "public": [198, 202, 32, 155, 226, 58, 90, 188, 137, 129, 64, 14, 246, 246, 17, 233, 27, 26, 97, 22, 15, 92, 39, 53, 65, 15, 84, 13, 156, 6, 232, 86, 64, 89, 31, 160, 209, 180, 0, 234, 213, 168, 189, 73, 150, 34, 156, 177, 249, 191, 60, 85, 147, 51, 42, 68, 185, 72, 106, 249, 194, 113, 222, 98]}');

var keys = {
  private: new Buffer(keys.private),
  public: new Buffer(keys.public)
};

console.log(keys)

var feed = ssb.createFeed(keys);

console.log(feed)

// the first message in the feed is always the public key.
//add a message to your feed.

//feed.add appends a message to your key's chain.
feed.add('msg', 'FIRST POST', function (err, msg, hash) {
  //the message as it appears in the database.
  console.log(msg);

  //and it's hash
  console.log(hash);
});

// stream all messages by all keys.
pull(
  ssb.createFeedStream(),
  pull.collect(function (err, ary) {
    console.log(ary);
  })
);

// get all messages for a particular key.
pull(
  ssb.createHistoryStream(feed.id),
  pull.collect(function (err, ary) {
    console.log(ary);
  })
);

// create a server for replication.

var net = require('net');
var toStream = require('pull-stream-to-stream');

net.createServer(function (stream) {
  // secure-scuttlebutt uses pull-streams so
  // convert it into a node stream before piping.
  stream.pipe(toStream(ssb.createReplicationStream())).pipe(stream);
}).listen(1234);

//create another database to replicate with:
var ssb2 = require('secure-scuttlebutt/create')('scuttletest2.db');
//follow the key we created before.
ssb2.follow(feed.id);

// replicate from the server.
// this will pull the messages by feed1 into this database.
var stream = net.connect(1234);
stream.pipe(toStream(ssb2.createReplicationStream())).pipe(stream);