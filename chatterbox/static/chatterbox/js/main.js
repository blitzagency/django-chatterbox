
define(function(require, exports, module){

var $ = require('jquery');
var marionette = require('marionette');
var renderer = require('app/renderer');
var main = require('app/main');
var app = new marionette.Application();

app.addInitializer(main.main);

$(function(){
    app.start();
})

});
