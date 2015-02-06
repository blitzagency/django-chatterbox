/**
 * Managers - Focus
 * @module built.core.managers.focus
 */
define(function(require, exports, module){

// Imports

var marionette     = require('marionette');
var _              = require('underscore');
var Collection     = require('built/core/jquery/collection').Collection;
var array          = require('built/core/managers/array');
var helpers        = require('built/core/utils/helpers');
var focus          = require('built/core/events/focus');
// Module

var FocusManager =  array.ArrayManager.extend(
/** @lends built.core.managers.focus.FocusManager.prototype */
{

    // Object vars
    allowsDeselect: false,

    /**
     * Creates a new FocusManager
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        array.ArrayManager.prototype.constructor.apply(this, arguments);
        this.listenTo(this, 'destroy', this.deinit);

        this.allowsDeselect = options.allowsDeselect;
        this._focusedObjects = [];
    },

    focusIndex: function(index){
        var obj = this._list[index];

        if(obj){
            this.focus(obj);
        }
    },

    blurIndex: function(index){
        var obj = this._focusedObjects.splice(index, 1)[0];

        if(obj){
            this._dispatchBlur(obj);
        }
    },

    getFocusedIndexes: function(){
        var list = this._list;

        var indexes =  _.map(this._focusedObjects, function(obj){
            var candidate = list.indexOf(obj);
            if (candidate > -1){
                return candidate;
            }
        }, this);

        return indexes;
    },

    getFocusedObjects: function(){
        // these are in no particular order
        return this._focusedObjects;
    },

    focus: function(obj){
        var hasFocus = this._focusedObjects.indexOf(obj) > -1;
        var shouldBlur = hasFocus && this.allowsDeselect;

        if(shouldBlur){
            this.blur(obj);
            return;
        }

        if(!hasFocus){
            this._focusedObjects.push(obj);
            this._dispatchFocus(obj);
        }
    },

    blur: function(obj){
        var index = this._focusedObjects.indexOf(obj);
        var hasFocus = index > -1;

        if(hasFocus){
            this._focusedObjects.splice(index, 1);
            this._dispatchBlur(obj);
        }
    },

    _dispatchFocus: function(obj) {
        this.trigger(focus.FOCUS, this, obj);
    },

    _dispatchBlur: function(obj) {
        this.trigger(focus.BLUR, this, obj);
    },

    // marionette overrides

    deinit: function(){
        this._focusedObjects = null;
    }

}); // eof FocusManager

// Exports

exports.FocusManager = FocusManager;

}); // eof define
