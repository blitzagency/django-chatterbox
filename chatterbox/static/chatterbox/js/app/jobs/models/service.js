define(function( require, exports, module ){

var backbone = require('backbone');


var Service = backbone.Model.extend({

    defaults: {
        id: null,
        key: null,
        label: null,
    },
});

exports.Service = Service;

});
