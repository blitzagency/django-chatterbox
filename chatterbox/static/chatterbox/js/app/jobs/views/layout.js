define(function( require, exports, module ){

var marionette = require("marionette");
var ServiceSelectionView = require("./service-selection").ServiceSelectionView;
var CollectorSelectionView = require("./collector-selection").CollectorSelectionView;
var KeySelectionView = require("./key-selection").KeySelectionView;
var template = require("hbs!app/jobs/templates/layout");


var JobLayoutView = marionette.LayoutView.extend({
    template: template,

    regions: {
        services: ".service",
        collectors: ".collector",
        keys: ".key",
    },

    onShow: function(){
        this.services = new ServiceSelectionView();
        this.collectors = new CollectorSelectionView();
        this.keys = new KeySelectionView();

        this.getRegion("services").show(this.services)
        this.getRegion("collectors").show(this.collectors)
        this.getRegion("keys").show(this.keys)

        this.listenTo(this.services, 'change', this.serviceDidChange)

        setTimeout(function(){
            this.services.setSelectedIndex(2)
        }.bind(this), 3000)
    },

    serviceDidChange: function(){
        console.log(this.services.getSelected().toJSON());
    }
});


exports.JobLayoutView = JobLayoutView;

});
