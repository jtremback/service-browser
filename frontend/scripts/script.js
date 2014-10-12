'use strict';

var director = require('director');
var Vue = require('vue');
var localforage = require('localforage');
var _ = require('underscore');

var columnize = require('./columnize.js');
var socket = require('./socket.js'); // Start a listenin'

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

socket.messages.on('serviceUp', function (service) {
  localforage.getItem(service.fullname, function (err, local_service) {
    service = _.extend(local_service || {}, service); // Attach properties from localstorage
    services.push(service);
  });
});

socket.messages.on('serviceDown', function (service) {
  // stuff
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
        localforage.setItem(this.fullname, this.$data, function () {
          socket.send(_this.fullname, 'up_vote');
        });
      }
    },
    downVote: function () {
      var _this = this;
      if (!this.down_vote) {
        this.down_vote = true;
        this.up_vote = false;
        localforage.setItem(this.fullname, this.$data, function () {
          socket.send(_this.fullname, 'down_vote');
        });
      }
    }
  },
});


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
    },
    // json: {
    //   $get: function () {
    //     return JSON.stringify(this.services,null,2);
    //   }
    // }
  }
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