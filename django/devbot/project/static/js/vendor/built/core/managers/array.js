/**
 * Managers - Array
 * @module built.core.managers.array
 */
define(function(require, exports, module){

// Imports

var marionette   = require('marionette');
var _            = require('underscore');
var events = require('built/core/events/event');


// Module

var ArrayManager = marionette.Controller.extend(
/** @lends built.core.managers.array.ArrayManager.prototype */
{

    /**
     * Creates a new ArrayManager
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        marionette.Controller.prototype.constructor.apply(this, arguments);
        options = options || {};
        this.setArray(options.list || []);
    },

    setArray: function(value){
        if(!_.isArray(value)) throw 'Invalid Value';
        this._list = value;
    },

    getArray: function(){
        return this._list;
    },

    swap: function(from, to){
        var list = this._list;

        var objFrom = list[from];
        var objTo = list[to];

        // same object? don't do anything.
        if (objFrom === objTo){
            return;
        }

        list[from] = objTo;
        list[to] = objFrom;

        this._dispatchChange();
    },

    insertObject: function(obj){
        this._list.push(obj);
        this._dispatchChange();
    },

    insertObjectAt: function(position, obj){
        this._list.splice(position, 0, obj);
        this._dispatchChange();
    },

    removeObjectAt: function(position){
        var remove = this._list.splice(position, 1);
        this._dispatchChange();

        return remove;
    },

    moveObjectFromTo: function(from, to){
        var list = this._list;
        var obj = list.splice(from, 1)[0];
        list.splice(to, 0, obj);
        this._list = list;
        this._dispatchChange();
    },

    replaceAt: function(position, obj){
        var list = this._list;
        list[position] = obj;
        this._dispatchChange();
    },

    _dispatchChange: function() {
        this.trigger(events.CHANGE, this);
    }

});

// Exports

exports.ArrayManager = ArrayManager;

});
