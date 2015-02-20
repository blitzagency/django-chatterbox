define(function( require, exports, module ){

var marionette = require("marionette");
var ServiceSelectionView = require("./service-selection").ServiceSelectionView;
var CollectorSelectionView = require("./collector-selection").CollectorSelectionView;
var KeySelectionView = require("./key-selection").KeySelectionView;
var DataFormView = require("./data-form").DataFormView;
var handlebars = require("handlebars");
var template = require("hbs!app/jobs/templates/layout");


var JobLayoutView = marionette.LayoutView.extend({
    template: template,

    regions: {
        services: ".service",
        collectors: ".collector",
        keys: ".keys",
        form: ".collector-form"
    },

    onShow: function(){
        this.services = new ServiceSelectionView({data: JOB_DATA.service});

        this.collectors = new CollectorSelectionView({
            data: JOB_DATA.collector,
            serviceKey: JOB_DATA.service.key
        });

        this.keys = new KeySelectionView({
            data: JOB_DATA.keys,
             serviceKey: JOB_DATA.service.key
        });

        this.getRegion("services").show(this.services)
        this.getRegion("collectors").show(this.collectors)
        this.getRegion("keys").show(this.keys)

        this.listenTo(this.services, 'change', this.serviceDidChange);
        this.listenTo(this.collectors, 'change', this.collectorDidChange);
    },

    serviceDidChange: function(){
        var service = this.services.getSelected();
        this.setService(service);
    },

    collectorDidChange: function(){
        var collector = this.collectors.getSelected();
        if(collector){
            collector.loadForm().then(function(){

                if(collector.get("form")){
                    var template = handlebars.compile(collector.get("form"));
                    this.form.show(new DataFormView({
                        data: JOB_DATA.data,
                        template: template
                    }));
                } else {
                    this.form.reset();
                }

            }.bind(this));
        }
    },

    setService: function(service){
        this.form.reset();
        this.collectors.setService(service);
        this.keys.setService(service);
    }
});


exports.JobLayoutView = JobLayoutView;

});
