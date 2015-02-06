define(function( require, exports, module ){

var backbone = require('backbone');
var Model = require('../models/collector').Collector;

var Collectors =  backbone.Collection.extend({
    url: '/admin/chatterbox/job/api/collectors/',
    model: Model,

    forService: function(service){
        return this.fetch({data: {service: service}})
    }

});

exports.Collectors = Collectors;

});
