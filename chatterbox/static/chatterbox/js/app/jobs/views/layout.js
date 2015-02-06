define(function( require, exports, module ){

var marionette = require("marionette");
var ServiceSelectionView = require("./service-selection").ServiceSelectionView;
var template = require("hbs!app/jobs/templates/layout");


var JobLayoutView = marionette.LayoutView.extend({
    template: template,

    regions: {
        service: ".service",
        collector: ".collector",
        key: ".key",
    },

    onShow: function(){
        this.getRegion("service").show(new ServiceSelectionView())
    }
});


exports.JobLayoutView = JobLayoutView;

});
