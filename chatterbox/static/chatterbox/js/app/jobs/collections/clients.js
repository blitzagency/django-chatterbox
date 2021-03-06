define(function( require, exports, module ){

var backbone = require('backbone');
var Model = require('../models/client').Client;

var Clients =  backbone.Collection.extend({
    url: '/admin/chatterbox/job/api/clients/',
    model: Model,

    forService: function(service){
        return this.fetch({reset: true, data: {service: service.get("key")}})
    },
});

exports.Clients = Clients;

});
