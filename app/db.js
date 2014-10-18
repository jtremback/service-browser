'use strict';

// var level = require('level');
// var path = require('path');
// var pull = require('pull-stream');
// var colors = require('colors');
// var path = require('path');
// var mapTypes = require('./map-types.js');
var fs = require('fs');
var _ = require('underscore');

var net = require('net');
var toStream = require('pull-stream-to-stream');

var ssb = require('secure-scuttlebutt/create')('db/scuttlebutt.db');

var feed;
var trusted_peers;


// opts = {
//   peer_file,
//   feed_file,
//   sync_port
// }

exports.start = function (opts, callback) {
  // Listen with replication stream
  net.createServer(function (stream) {
    console.log('SERVER CREATED');
    stream.pipe(toStream(ssb.createReplicationStream())).pipe(stream);
  })
  .listen(opts.sync_port, function (err) {
    if (err) { return callback(err); }

    fs.readFile(opts.feed_file, { encoding: 'utf8' }, function (err, string) {
      if (string) {
        // deserialize the buffers
        var keys = JSON.parse(string);
        keys = {
          private: new Buffer(keys.private),
          public: new Buffer(keys.public)
        };

        // create a new feed
        feed = ssb.createFeed(keys);

        console.log('LOADED FROM FEED FILE: ', opts.feed_file);
      } else {
        feed = ssb.createFeed();

        var new_feed = JSON.stringify(feed.keys);
        fs.writeFile(opts.feed_file, new_feed);

        console.log('CREATED FEED FILE: ', opts.feed_file);
      }

      console.log('FEED: ', JSON.stringify(feed));

      return loadPeers(feed);
    });

    function loadPeers (new_feed) {
      fs.readFile(opts.peer_file, { encoding: 'utf8' }, function (err, string) {
        if (string) {
          trusted_peers = JSON.parse(string);
        } else {
          trusted_peers = [];
        }

        return callback(null, new_feed);
      });
    }
  });
};

exports.addPeer = function (address, id, callback) {
  if (id !== JSON.stringify(feed.id)) { // Don't connect to self. That would just be dumb.
    console.log('ADD PEER: ', address, id);

    var stream = net.connect(address);
    stream.pipe(toStream(ssb.createReplicationStream())).pipe(stream);

    if (_.contains(trusted_peers, id)) {
      console.log('FOLLOWING TRUSTED PEER: ' + id);
      ssb.follow(new Buffer(JSON.parse(id)));
    }
  }

  if (callback) { return callback(null); }
};
