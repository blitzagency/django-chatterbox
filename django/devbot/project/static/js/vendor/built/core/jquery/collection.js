/**
 * JQuery Collections
 * @module built.core.jquery.collection
 */
define(function(require, exports, module){

// Imports
var $          = require('jquery');
var marionette = require('marionette');

// Module
var Collection =  marionette.Controller.extend(
/** @lends built.core.jquery.collection.Collection.prototype */

{


    /**
     * Creates a new Collection
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        marionette.Controller.prototype.constructor.apply(this, arguments);
        this.reset();
    },


    add: function($el){
        var i, l;
        var elements = $el.toArray();
        var $currentElements = this.$elements;


        for (i = 0, l = elements.length; i < l;  i++){
            var each = elements[i];

            if($currentElements.indexOf(each) == -1){
                $currentElements.push(each);
                this.length++;
                this.trigger('add', $(each));
            }
        }
    },

    remove: function($el){
        var i, l;
        var elements = $el.toArray();
        var $currentElements = this.$elements;

        for (i = 0, l = elements.length; i < l;  i++){
            var each = elements[i];
            var index = $currentElements.indexOf(each);

            if(index != -1){
                $currentElements.splice(index, 1);
                this.length--;
                this.trigger('remove', $(each));
            }
        }
    },

    at: function(index){
        return $(this.$elements[index]);
    },

    contains: function($el){
        return this.$elements.indexOf($el[0]) == -1 ? false : true;
    },

    reset: function(){
        // JS cannot store objects as keys at this point. So we use an array here.
        // Seeks cost O(N), so be careful with how massive this gets.
        // the alternate option is to use a HashTable like this:
        // http://stamat.wordpress.com/2013/07/03/javascript-quickly-find-very-large-objects-in-a-large-array/

        this.$elements = [];
        this.length = 0;
    },

    toArray: function(){
        var i, l;
        var results = [];

        // local scope lookup
        var $elements = this.$elements;

        for (i = 0, l = $elements.length; i < l; i++){
            results.push($($elements[i]));
        }

        return results;
    }

}); // eof Collection

// Exports

exports.Collection = Collection;

}); // eof define
