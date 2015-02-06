define(function( require, exports, module ){

/*
 * CollectorSelectionView, KeySelectionView and ServiceSelectionView are all
 * basically the same/duplicated. This was done as maybe down the
 * line, the representations of these things could change, so they
 * were prematurely optimized to allow this to happen.
 *
 * It likely never will, but it's broken apart if we want to do it.
 **/

var $ = require('jquery');
var marionette = require("marionette");
var backbone = require("backbone");
var Services = require("../collections/services").Services;
var ServiceItemView = require('./service-item').ServiceItemView;


var ServiceSelectionView = marionette.CollectionView.extend({
    tagName: "select",
    childView: ServiceItemView,
    modelEvents: {
        'change': 'modelChanged'
    },

    initialize: function(service){

        this.collection = new Services();
        this.collection.fetch().then(this.initializeService.bind(this, service));
        this._model = new backbone.Model({index: -1});
        this.listenTo(this._model, "change:index", this._didChange);
    },

    initializeService:function(service){
        var model = this.modelInCollection(new backbone.Model(service));

        if(model){
            this.setSelected(model);
        } else {
            this.setSelectedIndex(0)
        }
    },

    childViewOptions: function(model, index) {
        return {attributes: {value: model.get("key")}}
    },

    onShow: function(){
        this.$el.on("change", this._selectChanged.bind(this));
    },

    _didChange: function(){
        this.trigger("change", this.getSelected());
    },

    _selectChanged: function(e) {
        this._model.set("index", this.$el[0].selectedIndex);
    },

    getSelectedIndex: function(){
        return this._model.get("index");
    },

    getSelected: function(){
        return this.collection.at(this.getSelectedIndex());
    },

    setSelected: function(service){
        var index = 0;
        var model = this.modelInCollection(service);

        if(model){
            index = this.collection.indexOf(this.model);
            this.setSelectedIndex(index)
        }
    },

    modelInCollection: function(service){
        var model = null;
        var id = service.get("id");

        if(id){
            model = this.collection.get(id)
        } else {
            id = service.get("key")
            candidates = this.collection.where({ key: id });

            if(candidates.length){
                model = candidates[0];
            }
        }

        return model;
    },

    setSelectedIndex: function(index, options){
        // changing the selectedIndex on the $el will not
        // trigger a change event in jquery.
        this.$el[0].selectedIndex = index;
        this._model.set({"index": index}, options);
    },
});


exports.ServiceSelectionView = ServiceSelectionView;

});
