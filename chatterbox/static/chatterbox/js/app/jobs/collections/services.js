define(function( require, exports, module ){

var backbone = require('backbone');
var Model = require('../models/service').Service;

var Services =  backbone.Collection.extend({
    url: '/admin/chatterbox/job/api/services/',
    model: Model,
});

exports.Services = Services;

});
