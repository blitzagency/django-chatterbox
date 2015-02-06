define(function( require, exports, module ){

/*
 * KeyItemView, CollectorItemView and ServiceItemView are all
 * basically the same/duplicated. This was done as maybe down the
 * line, the representations of these things could change, so they
 * were prematurely optimized to allow this to happen.
 *
 * It likely never will, but it's broken apart if we want to do it.
 **/

var marionette = require("marionette");
var template = require("hbs!../templates/collector-item");


var CollectorItemView = marionette.ItemView.extend({
    template: template,
    tagName: "option",
})

exports.CollectorItemView = CollectorItemView;

});
