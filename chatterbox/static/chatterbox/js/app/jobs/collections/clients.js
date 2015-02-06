define(function( require, exports, module ){

var backbone = require('backbone');
var Model = require('../models/client').Client;

var Clients =  backbone.Collection.extend({
    url: '/admin/chatterbox/job/api/clients/',
    model: Model,

    forService: function(service){
        return this.fetch({data: {service: service}})
    }
});

exports.Clients = Clients;

});
