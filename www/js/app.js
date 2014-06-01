/*
  Copyright 2014 Marc Juul Maxb
  License: AGPLv3

  This file is part of service-browser.

  service-browser is free software: you can redistribute it 
  and/or modifyit under the terms of the GNU Affero General 
  Public License as published by the Free Software Foundation,
  either version 3 of the License, or (at your option) any 
  later version.

  service-browser is distributed in the hope that it will be
  useful, but WITHOUT ANY WARRANTY; without even the implied
  warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
  PURPOSE.  See the GNU Affero General Public License for 
  more details.

  You should have received a copy of the GNU Affero General 
  Public License along with service-browser. 
  If not, see <http://www.gnu.org/licenses/>.
*/

var $ = jQuery = require('jquery');
var SockJS = require('sockjs-client');
//var JSON = require('json2');
var _ = require('lodash');
var config = require('./config');
var Modernizr = require('modernizr');

var cssify = require('cssify');
cssify.byUrl('build/index.css');
cssify.byUrl('build/imports.css');

config.thisUrl = window.location.protocol + "//" + window.location.host;
config.templateConfig = config.templateConfig || {};

if (typeof config.columns === 'undefined') {
  config.templateConfig.columnNum = 4;
}

config.templateConfig.columns = [];
config.templateConfig.columnWidth = 12 / config.templateConfig.columnNum;
for (var i=1; i<=config.templateConfig.columnNum; i++) {
  config.templateConfig.columns.push({});
};

config.templates = {
  serviceTemplate: require('../templates/service.html'),
  columnsTemplate: require('../templates/columns.html'),
};

$(function() {
  var handlers = function() {
    $('.vote-icon-container .order-icon').off('click');
    $('.vote-icon-container .order-icon').on('click', function(e) {
      var id = $(this).data('id');
      var val = parseInt($(this).data('val'), 10);
      try {
        localStorage.peoplesOpenDotNet[id].order += val;
      } catch (e) {
        if (typeof localStorage.peoplesOpenDotNet === "undefined") {
          localStorage.peoplesOpenDotNet = {};
        }
        if (typeof localStorage.peoplesOpenDotNet[id] === "undefined") {
          localStorage.peoplesOpenDotNet[id] = {};
        }
        if (typeof localStorage.peoplesOpenDotNet[id].order === "undefined") {
          localStorage.peoplesOpenDotNet[id].order = 0;
        }
      }
    });
  };

  $('.services-container').html(config.templates.columnsTemplate(config.templateConfig));

  var services = [];

  var drawService = function(service) {
    var column = _.size(services) % config.templateConfig.columnNum;
    $('.services-container .column.col-' + column).append(service.html);
  };

  var drawServices = function() {
    var column;
    for (column = 0; column < config.templateConfig.columnNum; column++) {
      $('.services-container .column.col-' + column).html('');
    }
    services = _.sortBy(services, 'sortOrder');
    var i = 0;
    _.each(services, function(service) {
      var column = i % config.templateConfig.columnNum;
      $('.services-container .column.col-' + i).append(service.html);
      i++;
    });
    handlers();
  };

  function serviceUp(service) {
    var containsService = _.find(services, function(serviceIter) {
      return serviceIter.unique === service.unique;
    });
    if (service.txtRecord.scope === "peoplesopen.net" && !containsService) {
      service.host = service.host.replace(/\.$/, '');

      var link = false;
      if(service.type.name === 'http') { 
        link = {
          url: 'http://'+service.host+':'+service.port+'/',
          name: service.name
        };
      } else if(service.type.name === 'https') {
        link = {
          url: 'https://'+service.host+':'+service.port+'/',
          name: service.name
        };
      } 

      var serviceClass = undefined;

      if (typeof service.txtRecord === 'object' &&
          typeof service.txtRecord.type === 'string' && 
          typeof config.icons === 'object' &&
          typeof config.icons[service.txtRecord.type] === 'string') {
        serviceClass = config.icons[service.txtRecord.type];
      }

        
      var context = {
        link: link,
        name: service.name,
        id: service.unique,
        description: service.txtRecord.description,
        serviceClass: serviceClass,
        columnNum: config.columns
      }

      service.html = config.templates.serviceTemplate(context);

      // Ok now we figure out where it should be added - we have to look at 
      // whether or not it's been assigned an "order"
      var id = service.unique;
      if (typeof localStorage.peoplesOpenDotNet === "object" &&
          typeof localStorage.peoplesOpenDotNet[id] === "object" &&
          typeof localStorage.peoplesOpenDotNet[id].order !== "undefined") { // TODO: Add a better check for isNumber
        
        service.sortOrder = localStorage.peoplesOpenDotNet[id].order;
      } else {
        service.sortOrder = 0;
      }

      services.push(service);
      //drawService(service);
      drawServices();

    }
  }

  function serviceDown(service) {
    if (typeof service.uniqueId === 'string' &&
        services[service.uniqueId] === 'object') {

      services = _.filter(services, function(serviceIter) {
        return serviceIter.uniqueId !== service.uniquId;
      });
    }
    var removeNode = $('.service-box[data-id="' + service.unique + '"]');
    if (removeNode.length > 0 ) {
      removeNode.remove();
    }
  }

  // INIT CODE:
  if (Modernizr.localstorage) {
    localStorage.peoplesOpenDotNet = {};
  } else {
    console.log("no local storage - probably will not work entirely");
  }

  //var sock = new SockJS.create(config.thisUrl + '/websocket');
  var sock = new SockJS('/websocket');

  sock.onopen = function() {
    console.log('open');
  };

  sock.onmessage = function(e) {
    console.log(e);
    var data = JSON.parse(e.data);;
    console.log(data);
    if(data.type == 'service') {

      if(data.action == 'up') {
        serviceUp(data.service);
      } else if(data.action == 'down') {
        serviceDown(data.service);
      }
    }
  };

  sock.onclose = function() {
    console.log('close');
  };  

});
