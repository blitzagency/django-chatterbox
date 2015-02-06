define(function( require, exports, module ){

var backbone = require('backbone');


var Key = backbone.Model.extend({

    defaults: {
        id: null,
        username: null,
    },
});

exports.Key = Key;

});
