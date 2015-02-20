define(function( require, exports, module ){

/*
 * CollectorSelectionView, KeySelectionView and ServiceSelectionView are all
 * basically the same/duplicated. This was done as maybe down the
 * line, the representations of these things could change, so they
 * were prematurely optimized to allow this to happen.
 *
 * It likely never will, but it's broken apart if we want to do it.
 **/

var _ = require("underscore");
var marionette = require("marionette");
var backbone = require("backbone");
var Keys = require("../collections/keys").Keys;
var KeyItemView = require('./key-item').KeyItemView;
var Service = require('../models/service').Service;


var KeySelectionView = marionette.CollectionView.extend({
    tagName: "select",
    id: "id_keys_id",
    childView: KeyItemView,
    service: null,

    initialize: function(options){
        this._model = new backbone.Model({index: 0});
        this.collection = new Keys();
        this.listenTo(this._model, "change:index", this._didChange);

        this.initializeKey(options);
    },

    attributes: function(){
        return {name: "keys", multiple: "multiple", size: 0};
    },

    initializeKey: function(options){
        var data = options.data;
        var service = new Service({key: options.serviceKey});

        if(options.serviceKey){
            this.collection.forService(service)
            .then(function(){
                this.setSelected(data, {silent: true})
            }.bind(this));
        }
    },

    _didChange: function(){
        this.trigger("change", this.getSelected());
    },

    childViewOptions: function(model, index) {
        return {attributes: {value: model.get("id")}}
    },

    setService: function(service){
        this.service = service;
        this.setSelectedIndex(0, {silent: true});
        this.collection.forService(this.service);
    },

    getSelected: function(){
        var ids = this._model.get("index");
        if(_.isNumber(ids)){
            return ids
        }

        return _.map(ids.split(','), function(each){
            return parseInt(each, 10);
        });
    },

    setSelected: function(obj, options){
        var data = obj

        if(_.isArray(obj) === false){
            data = [obj];
        }

        var ids = _.map(data, function(each){ return each.id; })
        var index = ids.sort().join(',');
        this.$el.val(ids);

        this._model.set({"index": index}, options);
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


exports.KeySelectionView = KeySelectionView;

});
