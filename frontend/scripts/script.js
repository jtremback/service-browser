'use strict';

var director = require('director');
var Vue = require('vue');
var columnize = require('./columnize.js');
var sockets = require('./sockets.js'); // Start a listenin'


var services = [];

// sockets.on('serviceUp', function (key, value) {
//   // $add doesn't work well with dots: https://github.com/yyx990803/vue/issues/461
//   services.$add(key.replace(/\./g, ''), value);
//   console.log(JSON.stringify(services,null,2))
// });

// sockets.on('serviceDown', function (key, value) {
//   // $add doesn't work well with dots: https://github.com/yyx990803/vue/issues/461
//   services.$delete(key.replace(/\./g, ''), value);
// });


Vue.component('home', {
  template: '#home'
});

Vue.component('service-columns', {
  template: '#service-columns',
  data: {
    services: [1,2,3,4,5,6,7,8,9]
  },
  computed: {
    columns: {
      $get: function () {
        return columnize(this.services, 3);
      }
    }
  }
});

// Vue.component('service-box', {
//   template: '#service-box',
//   replace: false
// });


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