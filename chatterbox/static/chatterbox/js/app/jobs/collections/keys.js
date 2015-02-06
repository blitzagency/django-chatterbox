define(function( require, exports, module ){

var backbone = require('backbone');
var Model = require('../models/key').Key;

var Keys =  backbone.Collection.extend({
    url: '/admin/chatterbox/job/api/keys/',
    model: Model,

    forService: function(service){
        return this.fetch({reset: true, data: {service: service.get("key")}})
    },
});

exports.Keys = Keys;

});
