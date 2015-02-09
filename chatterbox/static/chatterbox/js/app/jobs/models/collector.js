define(function( require, exports, module ){

var backbone = require('backbone');


var Collector = backbone.Model.extend({
    urlRoot: '/admin/chatterbox/job/api/collectors',

    defaults: {
        id: null,
        label: null,
        form: null,
    },

    loadForm: function(){
        var url = this.urlRoot + '/' + this.get('id') + '/form/';
        var options = {url: url};
        return backbone.Model.prototype.fetch.call(this, options);

    }
});

exports.Collector = Collector;

});
