/**
 * Drag and Drop List Controller
 * @module built.core.managers.focus-single-model-bound
 */

define(function(require, exports, module){

// Imports

var _                      = require('underscore');
var SingleSelectionManager = require('auf/ui/managers/focus-single').SingleFocusManager;

// Module

var ModelBoundSingleSelectionManager = SingleSelectionManager.extend(
/** @lends built.core.managers.focus-single-model-bound.ModelBoundSingleSelectionManager.prototype */
{


    /**
     * Creates a new ModelBoundSingleSelectionManager
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    initialize: function(options){
        SingleSelectionManager.prototype.initialize.apply(this, arguments);
        this.initializeModelBinding();
    },

    initializeModelBinding: function(){

        if(!this.bindings.getVal){
            this.bindings.getVal = this.getBindingValue;
        }

        this.selectValue(this.model.get(this.bindings.observe));
        this.stickit();
    },

    getBindingValue: function($el, event, options){
        if($el.hasClass(this.selectionManager.selectedClass)){
            return this.selectionManager.val();
        }

        return null;
    },

    selectionManagerAfterSelect: function($el){
        this.model.set(this.bindings.observe, this.getBindingValue($el));
        SingleSelectionManager.prototype.selectionManagerAfterSelect.call(this, $el);
        this.trigger('after:select', $el);
    }
});

// Exports

module.exports = ModelBoundSingleSelectionManager;

}); // eof define
