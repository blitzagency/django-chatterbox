define(function( require, exports, module ){

var backbone = require('backbone');
var Model = require('../models/collector').Collector;

var Collectors =  backbone.Collection.extend({
    url: '/admin/chatterbox/job/api/collectors/',
    model: Model,

    forService: function(service){
        return this.fetch({reset: true, data: {service: service.get("key")}})
    },

});

exports.Collectors = Collectors;

});
