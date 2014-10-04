'use strict';

var director = require('director');
var Vue = require('vue');
// var services = require('./services.js');
var sockets = require('./sockets.js'); // Start a listenin'


var services = {};

sockets.on('serviceUp', function (key, value) {
  // $add doesn't work well with dots: https://github.com/yyx990803/vue/issues/461
  services.$add(key.replace(/\./g, ''), value);
  console.log(JSON.stringify(services,null,2))
});

sockets.on('serviceDown', function (key, value) {
  // $add doesn't work well with dots: https://github.com/yyx990803/vue/issues/461
  services.$delete(key.replace(/\./g, ''), value);
});


Vue.component('home', {
  template: '#home'
});

Vue.component('service-list', {
  template: '#service-list',
  data: {
    services: services
  }
});

Vue.component('service-box', {
  template: '#service-box',
  replace: false
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