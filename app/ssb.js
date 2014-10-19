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

var ssb;

var feed;
var trusted_peers;


// opts = {
//   peer_file,
//   feed_file,
//   sync_port
// }

exports.start = function (opts, callback) {
  ssb = require('secure-scuttlebutt/create')(opts.scuttlebutt);
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
        var keys = JSON.parse(string).keys;
        keys = {
          private: new Buffer(keys.private, 'base64'),
          public: new Buffer(keys.public, 'base64')
        };

        // create a new feed
        feed = ssb.createFeed(keys);

        console.log('LOADED FROM FEED FILE: ', opts.feed_file);
      } else {
        feed = ssb.createFeed();

        var serialized = JSON.stringify({
          id: feed.id.toString('base64'),
          keys: {
            private: feed.keys.private.toString('base64'),
            public: feed.keys.public.toString('base64')
          }
        });

        fs.writeFile(opts.feed_file, serialized);

        console.log('CREATED FEED FILE: ', opts.feed_file);
      }

      console.log('FEED: ', JSON.stringify(feed));

      fs.readFile(opts.peer_file, { encoding: 'utf8' }, function (err, string) {
        if (string) {
          trusted_peers = JSON.parse(string);
        } else {
          trusted_peers = [];
        }

        return callback(null, feed);
      });
    });
  });
};

exports.addPeer = function (address, id, callback) {

  if (id !== feed.id.toString('base64')) { // Don't connect to self. That would just be dumb.
    console.log('ADD PEER: ', address, id);

    var stream = net.connect(address);
    stream.pipe(toStream(ssb.createReplicationStream())).pipe(stream);

    if (_.contains(trusted_peers, id)) {
      console.log('FOLLOWING TRUSTED PEER: ' + id);
      ssb.follow(new Buffer(id, 'base64'));
    }
  }

  if (callback) { return callback(null); }
};
