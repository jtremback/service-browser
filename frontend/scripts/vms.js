'use strict';

var director = require('director');
var Vue = require('vue');
var localforage = require('localforage');
var _ = require('underscore');
var sock = require('./socket.js');

var columnize = require('./columnize.js');

Vue.filter('type-icons', function (type) {
  var map = {
    storage: 'fa-cloud',
    messaging: 'fa-envelope',
    sound: 'fa-headphones',
    book: 'fa-book'
  };

  return map[type];
});

var services = [];

exports.services = {
  up: function (service) {
    localforage.getItem(service.name, function (err, local_service) {
      service = _.extend(local_service || {}, service); // Attach properties from localstorage

      // If the service does not already exist in array
      if (!_.findWhere(services, { name: service.name })) {
        services.push(service);
      }
    });
  },
  down: function (service) {
    // Remove service from array
    var index = _.findWhere(services, { name: service.name });
    services.$remove(index);
  }
};


Vue.component('service-columns', {
  template: '#service-columns',
  data: {
    services: services
  },
  computed: {
    columns: {
      $get: function () {
        return columnize(this.services, 3);
      }
    }
  }
});


Vue.component('home', {
  template: '#home'
});


Vue.component('service-box', {
  template: '#service-box',
  methods: {
    upVote: function () {
      var _this = this;
      if (!this.up_vote) {
        this.up_vote = true;
        this.down_vote = false;
        localforage.setItem(this.name, this.$data, function () {
          sock.access('services.upvote()', _this.name);
        });
      }
    },
    downVote: function () {
      var _this = this;
      if (!this.down_vote) {
        this.down_vote = true;
        this.up_vote = false;
        localforage.setItem(this.name, this.$data, function () {
          sock.access('services.downvote()', _this.name);
        });
      }
    }
  },
});


var main = new Vue({
  el: '#main',
  data: {
    currentView: 'home'
  }
});

var router = new director.Router({
  '/': function() {
    main.currentView = 'home';
  }
});

router.init();