/**
 * Select Controller
 * @module built.core.controls.forms.select
 */
define(function(require, exports, module){

var _                  = require('underscore');
var marionette         = require('marionette');
var KeyResponder       = require('built/core/responders/keys').KeyResponder;
var IndexManager       = require('built/core/managers/index').IndexManager;
var MouseResponder     = require('built/core/responders/mouse').MouseResponder;
var SingleFocusManager = require('built/core/managers/focus-single').SingleFocusManager;
var ClickTestResponder = require('built/core/responders/clicks').ClickTestResponder;
var helpers            = require('built/core/utils/helpers');
var focus              = require('built/core/events/focus');
var event              = require('built/core/events/event');
var data               = require('built/core/events/data');

var Select = marionette.Controller.extend(
/** @lends built.core.controls.forms.select.Select.prototype */
{
    _searchText:'',
    searchTimeout: 400,


    /**
     * Creates a new Select
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        marionette.Controller.prototype.constructor.apply(this, arguments);
        this.listenTo(this, 'destroy', this.deinit);

        _.extend(this, options);
        _.bindAll(this,
            'insertText',
            'insertNewline',
            'cancelOperation',
            'moveUp',
            'moveDown',
            'wantsFocus',
            'wantsBlur',
            'onOptionClicked',
            'mouseDidEnter',
            'mouseDidExit',
            'mouseDidClick'
            );

        this.$el = helpers.registerElement(this.el);
        this.el = this.$el[0];

        var markup = '<input id="" style="width: 1px; position: fixed; left: -9999em" id="">';
        this.$input = $(markup);
        this.$el.prepend(this.$input);

        this.keyResponder = new KeyResponder({
            el: this.$input,
            insertText: this.insertText,
            insertNewline: this.insertNewline,
            cancelOperation: this.cancelOperation,
            moveUp: this.moveUp,
            moveDown: this.moveDown
        });
    },

    insertText: function(responder, e){
        var char = String.fromCharCode(e.keyCode);

        if (!e.shiftKey){
            char = char.toLowerCase();
        }

        this._searchText += char;
        clearTimeout(this.timeout);

        this.timeout = setTimeout(_.bind(function(){
            this._searchText = '';
        },this), this.searchTimeout);

        if(/(32)/.test(e.keyCode)) e.preventDefault();

        this.trigger(data.DATA, this, this.$input, this._searchText);
    },

    insertNewline: function(responder, e){
        this._triggerSelected();
    },

    _triggerSelected: function(){
        var obj = this.focusManager.getFocusedObject();
        this.trigger(event.SELECT, $(obj));
        this._hasRunOnce = true;
    },

    cancelOperation: function(responder, e){
        this.trigger(event.CANCEL, this);
    },

    moveUp: function(responder, e){
        e.preventDefault();
        this._hasRunOnce = true;
        this.indexManager.previousIndex();
        this.focusManager.focusIndex(this.indexManager.getIndex());
    },

    moveDown: function(responder, e){
        e.preventDefault();
        if(!this._hasRunOnce){
            this._hasRunOnce = true;
        }else{
            this.indexManager.nextIndex();
        }
        this.focusManager.focusIndex(this.indexManager.getIndex());
    },

    deinit: function(){
        this.destroyManagers();
        this.keyResponder.destroy();
    },

    onOptionClicked: function(e){
        this.setSelectedOption(e.currentTarget);
    },

    setSelectedOption: function(obj){
        this.focusManager.focus(obj);
        var index = this.focusManager.getFocusedIndexes()[0];
        this.indexManager.setIndex(index);
        this._triggerSelected();
    },

    setElements: function($elements){
        this._$elements = $elements;
        this.destroyManagers();

        helpers.registerElement($elements);

        this.focusManager = new SingleFocusManager({
            list:$elements.toArray()
        });

        this.listenTo(
                this.focusManager,
                focus.FOCUS,
                this.wantsFocus);

        this.listenTo(
            this.focusManager,
            focus.BLUR,
            this.wantsBlur);

        this.indexManager = new IndexManager();
        this.indexManager.setLength($elements.length);
        this.mouseResponder = new MouseResponder({
                el: $elements,
                acceptsEnterExit: true,
                acceptsUpDown: true,
                acceptsMove: false,
                mouseEntered: this.mouseDidEnter,
                mouseExited: this.mouseDidExit,
                mouseUp: this.mouseDidClick
            });
    },

    destroyManagers: function(){
        if(this.focusManager){
            this.focusManager.destroy();
        }

        if(this.indexManager){
            this.indexManager.destroy();
        }
        if(this.mouseResponder){
            this.mouseResponder.destroy();
        }


        this.focusManager = null;
        this.indexManager = null;
        this.mouseResponder = null;
    },

    mouseDidEnter: function(responder, e){
        var $el = $(e.currentTarget);
        var index = this._$elements.index($el);
        this.indexManager.setIndex(index);
        this.focusManager.focus($el[0]);
    },

    mouseDidExit: function(responder, e){
        this.focusManager.blur(e.target);
    },

    mouseDidClick: function(responder, e){
        this.onOptionClicked(e);
    },

    wantsFocus: function(sender, obj){
        this.trigger(focus.FOCUS, this, obj);
    },

    wantsBlur: function(sender, obj){
        this.trigger(focus.BLUR, this, obj);
    }

});

// Exports
exports.Select = Select;

}); // eof define
