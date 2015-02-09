define(function( require, exports, module ){
var _ = require("underscore");
var marionette = require("marionette");


var DataFormView = marionette.ItemView.extend({
    tagName: "table",
    id: "id_data",

    initialize: function(options){
        this.data = options.data;
    },

    onShow: function(){
        this.populateData(this.data);
    },

    populateData: function(data){
        _.each(data, function(value, key){

            // django sets the prefix on the form to "data"
            // thus each name="" will be name="{{ prefix }}-"
            var prefix = "data";
            var name = prefix + "-" + key;

            // right now this really only works for
            // <input type="text">
            var $input = this.$("[name=" + name + "]");
            $input.val(value);

        }, this);
    },
})

exports.DataFormView = DataFormView;

});
