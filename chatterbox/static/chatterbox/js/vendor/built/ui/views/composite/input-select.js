/**
 * INput Select Composite View
 * @module built.ui.views.composite.input-select
 */
define(function (require, exports, module) {

var marionette   = require('marionette');
var InputSelect  = require('built/ui/controls/input-select').InputSelectMarionette;
var helpers      = require('built/core/utils/helpers');
var focus        = require('built/core/events/focus');
var data         = require('built/core/events/data');
var events       = require('built/core/events/event');

var InputSelectComposite =  marionette.CompositeView.extend(
/** @lends built.ui.views.composite.input-select.InputSelectComposite.prototype */
{
    minLength: 2,
    debounceDelay: 300,
    acceptsMouseEnterExit:true,

    /**
     * Creates a new InputSelectComposite
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    initialize : function(options){
         this.options = options;
    },

    onShow : function(){

        var options = {
            el: this.ui.input,
            debounceDelay: this.debounceDelay,
            minLength: this.minLength,
            acceptsMouseEnterExit: this.acceptsMouseEnterExit
        };

        this.inputSelect = new InputSelect(options);

        this.listenTo(this.collection,'sync', this.onCollectionSync);
        this.listenTo(this.collection,'change', this.onCollectionSync);
        this.listenTo(this.inputSelect, data.DATA, this.onData);
        this.listenTo(this.inputSelect, events.CANCEL, this.onCancel);
        this.listenTo(this.inputSelect, events.SELECT, this.onSelect);
    },

    onSelect: function(sender, $el){
        var view = this.children.find(function(child){
            return child.$el[0] == $el[0];
        });

        this.collectionViewDidSelect(view);
    },

    onCancel: function(){
         this.collectionViewDidCancel();
    },

    onData: function(sender, input, data){
        this.inputDidReceiveData(data);
    },

    onCollectionSync: function(){
        this.inputSelect.setViews(this.children);
        this.inputSelect.beginNavigationPhase();
        this.presentCollectionView();
    },

    inputDidReceiveData: function(data){
    },

    presentCollectionView: function(){
    },

    dismissCollectionView: function(){
    },

    collectionViewDidCancel: function(){
    },

    collectionViewDidSelect: function(view){
    },

    cleanup: function(){
        this.inputSelect.endNavigationPhase();
        this.collection.reset();
    }
});

exports.InputSelectComposite = InputSelectComposite;

});
