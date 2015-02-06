/**
 * Select Composite View
 * @module built.ui.views.composite.select
 */
define(function (require, exports, module) {

var marionette = require('marionette');

var Select = require('built/core/controls/forms/select').Select;
var ClickTestResponder = require('built/core/responders/clicks').ClickTestResponder;
var helpers = require('built/core/utils/helpers');
var focus = require('built/core/events/focus');
var event = require('built/core/events/event');
var data = require('built/core/events/data');
var modelFromElements = require('built/ui/helpers/dom').modelFromElements;



var SelectCompositeView = marionette.CompositeView.extend(
/** @lends built.ui.views.composite.select.SelectCompositeView.prototype */
{
    // End Public API
    /**
     * Creates a new SelectCompositeView
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    initialize : function(options){
        _.extend(this, options);
        _.bindAll(this,
            'onWantsOpen',
            'dismissCollectionView',
            'presentCollectionView',
            'onCancel');

        this.model = new Backbone.Model();
    },

    // Begin Public API
    inputDidReceiveData: function(data){
        this.focusViewContainingTextForModelKey(data, this.options.searchAttr || 'value');
    },

    presentCollectionView: function(){
        this.ui.list.show();
    },

    dismissCollectionView: function(){
        this.ui.list.hide();
    },

    collectionViewDidCancel: function(){
        this.dismissCollectionView();
    },

    collectionViewDidSelect: function(view){
        this.dismissCollectionView();
    },


    onShow: function(){
        this.listenTo(this.collection, 'sync', this._onCollectionSync);
        this.dismissCollectionView();
        this.listenToOnce(this.model, 'change', this.onModelChange);

        this.$el.on('click', this.onWantsOpen);

        this.select = new Select({
            el: this.$el,
        });

        this.listenTo(this.select, focus.FOCUS, this.onOptionFocus);
        this.listenTo(this.select, focus.BLUR, this.onOptionBlur);
        this.listenTo(this.select, event.SELECT , this.onOptionSelected);
        this.listenTo(this.select, event.CANCEL , this.onCancel);
        this.listenTo(this.select, data.DATA , this.onData);
        this.listenTo(this.model, 'change', this._onModelChange);
        this.bindSelectCollectionElements();
    },

    onData: function(sender, input, data){
        this.inputDidReceiveData(data);
    },

    onWantsOpen: function(e){
        this.select.$input.focus();
        this.enableWindowListener(true);
        this.presentCollectionView();
    },

    onCancel: function(){
        this.enableWindowListener(false);
        this.collectionViewDidCancel();
    },

    onDestroy: function(){
        this.$el.off('click', this.onWantsOpen);
        this.enableWindowListener(false);
        this.select.destroy();
    },

    enableWindowListener: function(bool){
        bool = _.isUndefined(bool) ? true : bool;

        if(bool){

            if(this._clickTest) this._clickTest.destroy();

            this._clickTest = new ClickTestResponder({
                el: this.$el,
                clickOutside: this.onCancel
            });

        }else{

            if(this._clickTest){
                this._clickTest.destroy();
                this._clickTest = null;
            }
        }
    },

    _onCollectionSync: function(){
        this.bindSelectCollectionElements();
    },

    bindSelectCollectionElements: function(){
        var elements = [];
        var views = this.children.toArray();

        _.each(views, function(each){
            elements.push(each.$el[0]);
        });

        this.select.setElements($(elements));
        var marionetteDict = this.marionetteDict = {};

        _.each(views, function(each){
            var key = helpers.getElementId(each.$el);
            marionetteDict[key] = each;
        });
    },

    _onModelChange: function(){
        var selected = this.collection.where(this.model.toJSON())[0];
        var child = this.children.findByModel(selected);

        if(this._selectedChild){
            this._selectedChild.trigger(event.DESELECT);
        }

        this._selectedChild = child;
        child.trigger(event.SELECT);
    },


    focusViewContainingTextForModelKey: function(text, key){

        text = text.toLowerCase();

        var coll = this.children.toArray();
        var lowestIndex = null;
        var view;

        for(var i=0; i < coll.length; i ++){
            view = coll[i];
            var model = view.model;
            var index = model.get(key)
                             .toLowerCase()
                             .indexOf(text);

            if(index === 0){
                break;
            }

            view = null;
        }

        if(view){
            this.select.focusManager.focus(view.$el[0]);
        }
    },

    onOptionFocus: function(sender, obj){
        var key = helpers.getElementId($(obj));
        var view = this.marionetteDict[key];
        view.trigger(focus.FOCUS);
    },

    onOptionBlur: function(sender, obj){
        var key = helpers.getElementId($(obj));
        var view = this.marionetteDict[key];
        view.trigger(focus.BLUR);
    },

    onOptionSelected: function($el){
        var key = helpers.getElementId($el);
        var view = this.marionetteDict[key];
        var model = view.model;
        this.model.set(view.model.toJSON());
        this.collectionViewDidSelect(view);
    },

    onModelChange: function(){
        this.stickit();
    },

});

function selectFromSelect(SelectClass, $select, options){

    options = options || {};
    var selectData = modelFromElements($select.find('option').toArray(), null, {content:'option'});
    var selectCollection = new Backbone.Collection(selectData);
    options = _.extend(options,{collection:selectCollection});
    var createdSelect = new SelectClass(options);
    $select.hide();

    createdSelect.model.on('change', function(){
        var val = this.get('value');
        $select.val(val);
    });

    $select.on('change', function(){
        var selectedVal = $select.val();
        var model = selectCollection.where({value:selectedVal})[0];
        createdSelect.model.set(model.toJSON());
    });



    return createdSelect;
}

exports.SelectCompositeView = SelectCompositeView;
exports.selectFromSelect = selectFromSelect;

});
