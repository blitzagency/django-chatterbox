define(function(require, exports, module) {

var marionette = require('marionette');

var template = require('hbs!app/sample/templates/sample');

var MySampleView = marionette.ItemView.extend({
    template: template,
    className: 'my-sample-view'
});

exports.MySampleView = MySampleView;

});