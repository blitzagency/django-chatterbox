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
var Service = require('../models/service').Service;


var CollectorSelectionView = marionette.CollectionView.extend({
    tagName: "select",
    id: "id_collector_id",
    childView: CollectorItemView,
    service: null,

    initialize: function(options){
        this._model = new backbone.Model({index: -1});
        this.collection = new Collectors();

        this.listenTo(this, "render:collection", this.ready);

        this.listenTo(this._model, "change:index", this._didChange);

        this.initializeCollector(options);
    },

    attributes: function(){
        return {name: "collector"};
    },

    initializeCollector: function(options){
        var data = options.data;
        var service = new Service({key: options.serviceKey});

        if(options.serviceKey){
            this.collection.forService(service)
            .then(function(){
                this.setSelectedId(data.id)
            }.bind(this));
        }
    },

    ready: function(){
        this.setSelectedIndex(0);
    },

    onShow: function(){
        this.$el.on("change", this._selectChanged.bind(this));
    },

    _didChange: function(){
        console.log("CHANGE UP!");
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

    childViewOptions: function(model, index) {
        return {attributes: {value: model.get("id")}}
    },

    setService: function(service){
        this.service = service;
        this._model.set({"index": -1}, {silent: true});
        this.collection.forService(this.service)
    },

    setSelectedId: function(id, options){
        var index = 0;
        var model = this.collection.get(id)

        if(model){
            index = this.collection.indexOf(model)
        }

        this.setSelectedIndex(index);
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
