define(function( require, exports, module ){

/*
 * CollectorSelectionView, KeySelectionView and ServiceSelectionView are all
 * basically the same/duplicated. This was done as maybe down the
 * line, the representations of these things could change, so they
 * were prematurely optimized to allow this to happen.
 *
 * It likely never will, but it's broken apart if we want to do it.
 **/

var marionette = require("marionette");
var Collectors = require("../collections/collectors").Collectors;
var CollectorItemView = require('./collector-item').CollectorItemView;


var CollectorSelectionView = marionette.CollectionView.extend({
    tagName: "select",
    childView: CollectorItemView,

    initialize: function(){
        this.collection = new Collectors();
        this.collection.fetch();
    },

    childViewOptions: function(model, index) {
        return {attributes: {value: model.get("key")}}
    }
});


exports.CollectorSelectionView = CollectorSelectionView;

});
