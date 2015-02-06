define(function( require, exports, module ){

var backbone = require('backbone');


var Collector = backbone.Model.extend({

    defaults: {
        id: null,
        label: null,
    },
});

exports.Collector = Collector;

});
