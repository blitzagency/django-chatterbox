/**
 * Managers - Single Focus
 * @module built.core.managers.focus-single
 */
define(function(require, exports, module){

// Imports
var FocusManager     = require('built/core/managers/focus').FocusManager;

// Module

var SingleFocusManager = FocusManager.extend(
/** @lends built.core.managers.focus-single.SingleFocusManager.prototype */
{

    /**
     * Creates a new SingleFocusManager
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        FocusManager.prototype.constructor.apply(this, arguments);
    },

    getFocusedIndex: function(){
        var index = -1;

        var obj = this._focusedObjects[0];
        if(obj){
            index = this._list.indexOf(obj);
        }

        return index;
    },

    getFocusedObject: function(){
        return this._focusedObjects[0];
    },

    focus: function(obj){
        var hasFocus = this._focusedObjects.indexOf(obj) > -1;
        var shouldBlur = hasFocus && this.allowsDeselect;

        if(shouldBlur){
            this.blur(obj);
            return;
        }

        if(!hasFocus){
            if(this._focusedObjects.length > 0){
                this.blur(this._focusedObjects[0]);
            }

            this._focusedObjects.push(obj);
            this._dispatchFocus(obj);
        }
    }
});

exports.SingleFocusManager = SingleFocusManager;

}); // eof define
