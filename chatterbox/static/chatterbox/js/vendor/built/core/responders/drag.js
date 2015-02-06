/**
 * Responders - Dragging
 * @module built.core.responders.drag
 */
define(function(require, exports, module){

// Imports

var marionette = require('marionette');
var _          = require('underscore');
var helpers    = require('built/core/utils/helpers');
var dndutils   = require('built/core/utils/dndutils');

// Module

var DragResponder = marionette.Controller.extend(
/** @lends built.core.responders.drag.DragResponder.prototype */
{

    // Object vars
    el: null,
    dataType: 'com.built.data',
    _minIE: 11,

    // operation can be one of:
    // -    'none'
    // -    'copy'
    // -    'move'
    // -    'link'
    // -    'copyMove'
    // -    'copyLink'
    // -    'linkMove'
    // -    'all'
    // Note that the drop target will check to confirm if it allows this.
    operation: 'all',
    supressChildPointerEvents: false,

    /**
     * Creates a new DragResponder
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
        _.bindAll(this, '_dragStart', '_dragEnd');
        this._managedElements = {};
    },

    _dragStart: function(e){
        this.draggingConfiguration(this, e);
        var action = this.draggingStarted;

        _.defer(function(sender, $el){
            action(sender, $el);
        }, this, $(e.currentTarget));
    },

    _dragEnd: function(e){
        // e.originalEvent.dataTransfer.dropEffect
        // will be the 'none' if the drag operation was cancelled
        // aka, no drop was performed, otherwise it will represent
        // the action that took place. One of the following:
        // -    'copy'
        // -    'move'
        // -    'link'
        // -    'none'

        //console.log('_dragEnd', e.originalEvent.dataTransfer.dropEffect);
        //debugger;
        var $target = $(e.currentTarget);
        var dataTransfer = e.originalEvent.dataTransfer;
        this.draggingEnded(this, $target, dataTransfer.dropEffect);
    },

    draggingStarted: function(responder, $el){ },
    draggingEnded: function(responder, $el, operation){
        // operation here will be one of:
        // -    'copy'
        // -    'move'
        // -    'link'
        // -    'none'
    },

    getData: function(responder, $el){
        // Should override this
        // One iss here is you are allowed to call setData on the
        // dataTransfer object multiple times. This implementation
        // omits that ability. The user could always implement
        // the draggingStarted call however and do their own thing.
        return '';
    },

    getDragImage: function(responder, $el){
        // to be used, this must return a value in the form of:
        // {
        //   image: {{ the Image }},
        //   offsetX: {{ the X Offset Value }},
        //   offsetY: {{ the Y Offset Value }}
        // }
        // See: https://developer.mozilla.org/en-US/docs/DragDrop/Drag_Operations#dragfeedback
        // for more details on creating this image.
        // OR you can do something like this:
        //
        // See: http://www.html5rocks.com/en/tutorials/dnd/basics/#toc-drag-properties
        // var dragIcon = document.createElement('img');
        // dragIcon.src = 'logo.png';
        // dragIcon.width = 100;
        // return {image: dragIcon };

        return false;
    },

    draggingConfiguration: function(responder, e){
        var $target = $(e.currentTarget);
        var originalEvent = e.originalEvent;
        var dataTransfer = originalEvent.dataTransfer;

        var dataType;

        if(helpers.isMSIE && helpers.MSIEVersion <= this._minIE){
            dataType = 'Text';
            // see the note in dnd utils for this hack
            // and why you are limited to 1 Drag Operation
            // at a time under this hack.
            dndutils.IEOnlyDataTransferDataType = this.dataType;
        } else {
            dataType = this.dataType;
        }

        dataTransfer.effectAllowed = this.operation;
        dataTransfer.setData(
            dataType,
            this.getData(this, $target)
        );

        var dragImage = this.getDragImage(this);

        if(dragImage){
            try{
                dataTransfer.setDragImage(
                    dragImage.image,
                    dragImage.offsetX || 0,
                    dragImage.offsetY || 0);
            } catch(error) {
                // noop IE 8, 9, 10, 11
            }
        }
    },

    addElement: function($el){
        $el = helpers.registerElement($el);
        var id = helpers.getElementId($el);
        this._managedElements[id] = $el[0];

        if(this.supressChildPointerEvents){
            dndutils.supressChildPointerEvents($el);
        }

        $el.prop('draggable', true);
        $el.on('dragstart.built.responders.drag', {ctx: this}, this._dragStart);
        $el.on('dragend.built.responders.drag', {ctx: this}, this._dragEnd);
    },

    removeElement: function($el){
        var id = helpers.getElementId($el);

        if(!id) throw 'Unable to remove unregistered AUF ' +
            'element. Did you register this element with ' +
            'helpers.registerElement?';

        delete this._managedElements[id];

        if(this.supressChildPointerEvents){
            dndutils.clearSupressedPointerEvents($el);
        }

        $el.prop('draggable', false);
        $el.off('dragstart.built.responders.drag', this._dragStart);
        $el.off('dragend.built.responders.drag', this._dragEnd);
    },

    reset: function($el){
        _.each(this._managedElements, function(value, key){
            this.removeElement($(value));
        }, this);

        if($el){
            _.each($el, function(each){
                this.addElement($(each));
            }, this);
        }
    },

    deinit: function(){
        this.reset();
    }

}); // eof DropResponder

// Exports

exports.DragResponder = DragResponder;

}); // eof define
