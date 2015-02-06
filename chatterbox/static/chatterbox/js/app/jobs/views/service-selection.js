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

    initialize: function(){
        this.collection = new Services();
        this.collection.fetch();
        this._model = new backbone.Model({index: 0});
        this.listenTo(this._model, "change:index", this._didChange);
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
        var model = null;
        var id = service.get("id");

        if(id){
            model = this.collection.get(id)
        } else {
            id = service.get("key")
            model = this.collection.where({ key: id });
        }

        if(model){
            index = this.collection.indexOf(this.model);
        }

        this.setSelectedIndex(index)
    },

    setSelectedIndex: function(index){
        // changing the selectedIndex on the $el will not
        // trigger a change event in jquery.
        this.$el[0].selectedIndex = index;
        this._model.set("index", index);
    },
});


exports.ServiceSelectionView = ServiceSelectionView;

});
