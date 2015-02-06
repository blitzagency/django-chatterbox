define(function( require, exports, module ){

var backbone = require('backbone');


var Client = backbone.Model.extend({

    defaults: {
        id: null,
        label: null,
    },
});

exports.Client = Client;

});
