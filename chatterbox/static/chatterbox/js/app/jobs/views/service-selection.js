define(function( require, exports, module ){

var marionette = require("marionette");
var Services = require("../collections/services").Services;
var ServiceItemView = require('./service-item').ServiceItemView;
var template = require("hbs!../templates/service-selection");


var ServiceSelectionView = marionette.CollectionView.extend({
    //template: template,
    tagName: "select",
    // childViewContainer: '.container',
    childView: ServiceItemView,

    initialize: function(){
        this.collection = new Services();
        this.collection.fetch();
    },

    onShow: function(){
        console.log("SHOOOOOOOOW");
        console.log(this.collection);
    }
});


exports.ServiceSelectionView = ServiceSelectionView;

});
