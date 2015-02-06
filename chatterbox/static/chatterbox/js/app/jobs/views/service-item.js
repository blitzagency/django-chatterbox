define(function( require, exports, module ){

var marionette = require("marionette");
var template = require("hbs!../templates/service-item");


var ServiceItemView = marionette.ItemView.extend({
    template: template
})

exports.ServiceItemView = ServiceItemView;

});
