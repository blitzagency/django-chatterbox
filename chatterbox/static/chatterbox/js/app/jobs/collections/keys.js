define(function( require, exports, module ){

var backbone = require('backbone');
var Model = require('../models/key').Key;

var Keys =  backbone.Collection.extend({
    url: '/admin/chatterbox/job/api/keys/',
    model: Model,

    forService: function(service){
        return this.fetch({data: {service: service}})
    }
});

exports.Keys = Keys;

});
