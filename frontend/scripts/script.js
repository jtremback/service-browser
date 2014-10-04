'use strict';

var director = require('director');
var Vue = require('vue');
// var services = require('./services.js');
var sockets = require('./sockets.js'); // Start a listenin'

var services = {};

sockets.on('serviceUp', function (key, value) {
  services.$add(key, value);
  console.log('serviceUp', JSON.stringify(services,null,2))

});

sockets.on('serviceDown', function (key, value) {
  services.$delete(key, value);
  console.log('serviceDown', key, value)
});


Vue.component('home', {
  template: '#home'
});

// setInterval(function () {
//   console.log(services.obj)
// }, 1000);

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