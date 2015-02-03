/**
 * Drag and Drop List Controller
 * @module built.core.controls.dragdrop.list
 */
define(function(require, exports, module) {

var $ = require('jquery');
var _ = require('underscore');
var marionette = require('marionette');
var DragResponder = require('built/core/responders/drag').DragResponder;
var DropResponder = require('built/core/responders/drop').DropResponder;
var ArrayManager = require('built/core/managers/array').ArrayManager;
var dndutils = require('built/core/utils/dndutils');
var getElementBounds = require('built/ui/helpers/dom').getElementBounds;


var DragDropList = marionette.Controller.extend(
/** @lends built.core.controls.dragdrop.list.DragDropList.prototype */
{
    el: null,
    dataType: 'com.built.data',
    operation: 'move',
    exitDelay: 150,
    supressChildPointerEvents: false,

    /**
     * Creates a new DragDropList
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        marionette.Controller.prototype.constructor.apply(this, arguments);
        _.extend(this, options);

        this.dragResponder = null;
        this.dropResponder = null;
        this.listManager = new ArrayManager();
        this._placeholderIndex = -1;
        this._placeholderItem = null;
        this._draggingItem = null;
        this._draggingIndex = -1;

        this.initializeDropResponder();
        this.initializeDragResponder();
    },


    addDragElement: function($el){
        // This is a List. As such, adding an element assumes
        // you are adding it to the end of a list.
        // In other words this is effectively a "push" both
        // in terms of data, and UI.

        this.dragResponder.addElement($el);
        this.listManager.insertObject($el[0]);
    },

    insertDragElement: function(position, $el){
        // Need to insert into the DOM
        // before we update the list manager
        // insertAtPosition relies on the current state
        // of the listManager. We don't want the thing
        // we are tossing into the DOM to already
        // be present in the listManager, hence this
        // order of events.
        //
        // This same pattern is also found in
        // this.dragResponderDraggingEnded
        var manager = this.listManager;

        if(_.isNull(position)|| _.isUndefined(position)){
            position = manager.getArray().length;
        }

        this.insertAtPosition(position, $el);
        manager.insertObjectAt(position, $el[0]);
        this.dragResponder.addElement($el);
    },

    reset: function($el){
        this.listManager.setArray($el.toArray());
        this.dragResponder.reset($el);
    },

    setDropElement: function($el){
        if(this.dropResponder){
            this.dropResponder.destroy();
        }

        this.dropResponder = new DropResponder({
            el: $el,
            dataType: this.dataType,
            operation: this.operation,
            draggingUpdated: this._dropResponderDraggingUpdated,
            performDragOperation: this.dropResponderPerformDragOperation
        });
    },

    initializeDropResponder: function(){
        // see the note under dropResponderDraggingUpdated
        // for why we don't handle draggingEntered/Exited here.
        // the entered and exit methods:
        //
        // this.dropResponderDraggingEntered
        // this.dropResponderDeaggingExited
        //
        // are available to you they are just triggered
        // via this._dropResponderDraggingUpdated and
        // this._dropResponderLazyDraggingExited

        _.bindAll(this,
            '_dropResponderDraggingUpdated',
            '_dropResponderLazyDraggingExited',
            'dropResponderPerformDragOperation');

        // You probably shouldn't be messing with this anyway.
        this._dropResponderLazyDraggingExited = _.debounce(
            this._dropResponderLazyDraggingExited, this.exitDelay);
    },

    initializeDragResponder: function(){
        _.bindAll(this,
            'dragResponderDraggingStarted',
            'dragResponderDraggingEnded',
            'dragResponderGetData',
            'dragResponderGetDragImage');

        this.dragResponder = new DragResponder({
            dataType: this.dataType,
            operation: this.operation,
            supressChildPointerEvents: this.supressChildPointerEvents,
            getData: this.dragResponderGetData,
            getDragImage: this.dragResponderGetDragImage,
            draggingStarted: this.dragResponderDraggingStarted,
            draggingEnded: this.dragResponderDraggingEnded
        });
    },

    getDragDataForElement: function($el){
        throw 'getDragDataForElement Not Implemented';
    },

    getDragImage: function(){
        // to be used, this must return a value in the form of:
        // {
        //   image: {{ the Image }},
        //   offsetX: {{ the X Offset Value }},
        //   offsetY: {{ the Y Offset Value }}
        // }
        //
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

    renderPlaceholderForData: function(data){
        throw 'renderPlaceholderForData Not Implemented';
    },

    renderDropElementForData: function(data){
        throw 'renderDropElementForData Not Implemented';
    },

    removePlaceholder: function(){
        var $placeholder = this._placeholderItem;
        if(!$placeholder) return;

        dndutils.clearSupressedPointerEvents($placeholder);
        $placeholder.remove();

        this._placeholderIndex = -1;
        this._placeholderItem = null;
    },

    insertPlaceholderAtPosition: function(position){

        // nothing changed, lets bail.
        if(this._placeholderIndex == position){
            return;
        }

        var $placeholder = this.renderPlaceholderForData();

        dndutils.supressChildPointerEvents($placeholder);

        // We are intentionally not rebuilding all of the nodes here.
        // because they may have events etc on them that we don't
        // know about. Rather than do all of that housekeeping
        // we settle for simple inserts of just the placeholder.
        if(this._placeholderIndex !== -1){
            this.removePlaceholder();
        }

        this._placeholderIndex = position;
        this._placeholderItem = $placeholder;
        this.insertAtPosition(position, $placeholder);
    },

    insertAtPosition: function(position, $view){
        var manager = this.listManager;
        var list = manager.getArray();

        if (position === 0){

            // We could probably always safely
            // assume the .append() in this case
            // instead of doing the relative .before().
            //
            // Choosing .append() here vs .prepend()
            // as someone could ad some decoration to the
            // top of their drop container, but want to
            // exclude it from the placeholder positioning
            // logic. .prepend() would mess that up and
            // .append() on an empty container achieves the
            // same result without unintentionally mucking
            // stuff up that we don't know about.
            if(list.length === 0){
                this.dropResponder.$el.append($view);
            } else {
                $(_.first(list)).before($view);
            }

        } else if (position == list.length) {
            $(_.last(list)).after($view);
        } else {
            $(list[position]).before($view);
        }
    },

    dragResponderGetData: function(sender, $el){
        return this.getDragDataForElement($el);
    },

    dragResponderGetDragImage: function(sender){
        return this.getDragImage();
    },

    dragResponderDraggingStarted: function(sender, $el){
        var manager = this.listManager;
        var list = manager.getArray();
        var index = list.indexOf($el[0]);

        if(index == -1) return;

        // exclude the item from the available
        // draggable items for calculating purposes
        // our nearest neighbor.
        var item = manager.removeObjectAt(index);
        var $item = $(item);
        this._draggingItem = $item;
        this._draggingIndex = index;

        // don't .remove(), want to keep the events.
        // so we .detach(). If we .remove() we won't get
        // the dragend events, and those are critical.
        $item.detach();

        this.insertPlaceholderAtPosition(index);

        // !!! WARNING !!!
        // There is a case where if the user starts dragging at the
        // 1st pixel at the top of the list and they drag out of the list
        // the _dropResponderDraggingUpdated will not fire. Only
        // dragResponderDraggingStarted is called. So this is a bit
        // of insurance against that case.

        // !!! WARNING !!!, THE EVENT IS AN EMPTY OBJECT IN THIS CASE
        //_.defer(this._dropResponderLazyDraggingExited, this.dropResponder, {});
        this._dropResponderLazyDraggingExited(this.dropResponder, {});
    },

    dragResponderDraggingEnded: function(sender, $el, operation) {
        if(this._placeholderIndex != -1){
            this.removePlaceholder();
        }

        var index = this._draggingIndex;
        var $view = this._draggingItem;

        if(operation == 'none'){


            // need to insert into the DOM
            // before we update the list manager
            // insertAtPosition relies on the current state
            // of the listManager. We don't want the thing
            // we are tossing back into the DOM to already
            // be present in the listManager, hence this
            // order of events.
            //
            // This same pattern is also found in
            // this.insertDragElement
            //

            // user override point
            var $insert = this.draggingEndedRestoreElementAtPosition(index, $view);
            if($insert){
                this.listManager.insertObjectAt(index, $insert[0]);
            }


        } else{
            dndutils.clearSupressedPointerEvents($view);
            this.dragResponder.removeElement($view);

            // user override point
            this.draggingEndedRemoveElementAtPosition(index, $view);
        }

        this._draggingItem = null;
        this._draggingIndex = -1;
    },

    draggingEndedRestoreElementAtPosition: function(position, $el){
        // this function is here to allow for easy override
        // for custom restore behavior. All of the internals
        // are handeled before and after this call. This gives
        // the implementer a chance to decide how an element
        // gets back into the DOM.
        //
        // This function is called when the drag operation
        // was canceled.
        //
        // the position variable refers to where in the list
        // the view element should be inserted.

        this.insertAtPosition(position, $el);
        return $el;
    },

    draggingEndedRemoveElementAtPosition: function(position, $el){
        // this function is here to allow for easy override
        // for custom remove behavior. All of the internals
        // are handeled before and after this call. This gives
        // the implementer a chance to decide how an element
        // gets removed from the DOM permanently.
        //
        // This function is called when the drag operation
        // was successful.
        //
        // the position variable refers to where in the list
        // the view element was removed from at the start of
        // the drag operation.
        $el.remove();
    },

    _dropResponderDraggingUpdated: function(responder, e){
        // when you have a list that holds items flush
        // against the top, you do not receive a draggingEntered
        // for the this.dropResponder.$el if you bring your
        // dragging operation in from the top. The same applies
        // to draggingExited when you move your dragging operation
        // outside of this.dropResponder.$el. Instead you get
        // the events on those items that you were last over.
        // If the childPointer events are supressed, you won't
        // get any entered/exited events at all.
        //
        // So you can either add enough padding around
        // this.dropResponder.$el, but that implies that this
        // should enforce some arbitrary design decision OR
        // you can let the 'dragover aka draggingUpdated events'
        // mimic the entered/exited states. Which is what we
        // do here.

        // This updating handler is intentionally responsible
        // for triggering the dropResponderDraggingEntered
        // there were issues with the natural draggingEntered
        if (!this._entered){
            this._entered = true;
            this.dropResponderDraggingEntered(responder, e);
        }

        // {x:N, y:N}
        var point = responder.getMousePosition();
        var position = this.getPlaceholderInsertPosition(point);
        this.insertPlaceholderAtPosition(position);

        //_.defer(this._dropResponderLazyDraggingExited, responder, e);
        this._dropResponderLazyDraggingExited(responder, e);
    },

    dropResponderDraggingEntered: function(responder, e){
        // no op -- user override if desired
    },

    dropResponderDraggingExited: function(responder, e){
        // no op -- user override if desired
    },

    dropResponderPerformDragOperation: function(responder, e){
        var data = responder.getData();

        var position = this._placeholderIndex;
        var $el = this.renderDropElementForData(data);

        this.removePlaceholder();
        this.insertDragElement(position, $el);
    },

    _dropResponderDraggingExited: function(responder, e){
        // users who care about dragging exited events
        // and wish to take action, should not need to care
        // about the placeholder. We will handle it's removal
        // for them and then hand off the exited call in a more
        // user friendly format.

        if(this._placeholderIndex != -1){
            this.removePlaceholder();
         }
        this.dropResponderDraggingExited(responder, e);
    },

    _dropResponderLazyDraggingExited: function(responder, e){
        // this is a debounced method, it's initialized in
        // this.initializeDropResponder. If you are calling
        // this method directly yourself, you are doing it wrong.
        // the method you are actually interested in is:
        // this.dropResponderDraggingExited.
        // There is nothing to see here, move along.
        this._entered = false;
        this._dropResponderDraggingExited(responder, e);
    },

    getPlaceholderInsertPosition: function(point){
        // point: {x:N, y:N}
        var list = this.listManager.getArray();

        var candidates = _.map(list, function(value, index){
        var bounds = getElementBounds(value);

        return {
            x: bounds.left,
            // need to include scrollTop() as a component
            // or the math gets all weird.
            y: bounds.top + $(window).scrollTop(),
            width: bounds.width,
            height: bounds.height};
        });

        var position = this.getClosestPosition(point, candidates);

        if(position < 0){
            return 0;
        }

        if (position + 1 == list.length){
            var rect = candidates[position];
            var zone = rect.y + (rect.height/2);

            if(point.y > zone){
                position = position + 1;
            }
        }
        return position;
    },

    getClosestPosition: function(point, candidates){
        // point = {x:N y:N}
        // candidates = [{x:N y:N}...]
        var position = -1;
        var distance = Infinity;

        // this is a naive approch here,
        // something like a kd-tree with knn search
        // would probably be more appropriate.
        // knowing that, we are using the naive approach
        // for now.
        _.each(candidates, function(each, index){
            var d = Math.abs(point.y - each.y);

            if(d < distance){
                distance = d;
                position = index;
            }
        });

        return position;
    }
});

// Exports
exports.DragDropList = DragDropList;

}); // eof define
