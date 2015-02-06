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
var backbone = require("backbone");
var Collectors = require("../collections/collectors").Collectors;
var CollectorItemView = require('./collector-item').CollectorItemView;


var CollectorSelectionView = marionette.CollectionView.extend({
    tagName: "select",
    childView: CollectorItemView,
    service: null,

    initialize: function(){
        this._model = new backbone.Model({index: 0});
        this.collection = new Collectors();
        this.listenTo(this._model, "change:index", this._didChange);
    },

    _didChange: function(){
        this.trigger("change", this.getSelected());
    },

    childViewOptions: function(model, index) {
        return {attributes: {value: model.get("key")}}
    },

    setService: function(service){
        this.service = service;
        this.setSelectedIndex(0, {silent: true});
        this.collection.forService(this.service);
    },

    setSelectedIndex: function(index, options){
        // changing the selectedIndex on the $el will not
        // trigger a change event in jquery.
        this.$el[0].selectedIndex = index;
        this._model.set({"index": index}, options);
    },
});


exports.CollectorSelectionView = CollectorSelectionView;

});
