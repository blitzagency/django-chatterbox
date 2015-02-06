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
var Keys = require("../collections/keys").Keys;
var KeyItemView = require('./key-item').KeyItemView;
var Service = require('../models/service').Service;


var KeySelectionView = marionette.CollectionView.extend({
    tagName: "select",
    childView: KeyItemView,
    service: null,

    initialize: function(options){
        this._model = new backbone.Model({index: 0});
        this.collection = new Keys();
        this.listenTo(this._model, "change:index", this._didChange);

        this.initializeKey(options);
    },

    attributes: function(){
        return {name: "key"};
    },

    initializeKey: function(options){
        var data = options.data;
        var service = new Service({key: options.serviceKey});

        if(options.serviceKey){
            this.collection.forService(service);
        }
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


exports.KeySelectionView = KeySelectionView;

});
