/**
 * InputSelect Controller
 * @module built.core.controls.forms.input-select
 */

define(function(require, exports, module){
var _                  = require('underscore');
var marionette         = require('marionette');
var KeyResponder       = require('built/core/responders/keys').KeyResponder;
var MouseResponder     = require('built/core/responders/mouse').MouseResponder;
var IndexManager       = require('built/core/managers/index').IndexManager;
var SingleFocusManager = require('built/core/managers/focus-single').SingleFocusManager;
var helpers            = require('built/core/utils/helpers');
var focus              = require('built/core/events/focus');
var events             = require('built/core/events/event');
var data               = require('built/core/events/data');

// Some requirements when using this control.
//
// This control does not apply any styles or
// inject any markup.
//
// This control assumes that there will be some
// views arranged vertically that will represent the choices.
//
// Up and Down keyboard based control will notify
// you via 'focus' 'blur' events which one should currentlly
// be focused. Mouse enter and mouse leave will also
// generate 'focus' and 'blur' events. It is up to you to
// decide how to handle that. This control does not apply
// any styles. For example, if you receive a 'focus' event
// you will receive the $view that wants focus, you could
// choose to add a 'selected' class to that $view:
//
// $view.addClass('selected');
//
// When you receive a 'blur' event you would then:
//
// $view.removeClass('selected')
//
// This is just an example, the point being you MUST
// make that decision on what 'focus' and 'blur' visually
// mean for your application.
//
// Additionally, this control does not hide or show anything.
// The decision on how to hide and show your choices is up to you.
//
// This control provides the following flow:
// 1) You provide it an <input> that can accept user typing
//    OR
//    You provide an HTML Element with content contenteditable="true"
//
// 2) You listen for 'input' events. This contol will notify you
//    when the length of the user input exceeds the set minLength
//    and the debounce delay has expired.
//
// 3) You do something with that input you recieve. For example,
//    you might make a call to a server to fetch choices.
//
// 4) Once you have the information for the choices you must decide
//    how to visually put those choices on the screen and do so.
//
// 5) After you have displayed your choices to the user, you then
//    need to tell this control about those items. There are 2 ways
//    you can do this:
//
//    5a) An array of jquery elements [$x, $y, $z] via setjQueryElements()
//    5b) The result of a jQuery selector $('.items') via setElements()
//
// 6) Now that this control is aware of your choices you inform it
//    that you would like to start the navigation process via:
//    beginNavigationPhase(). The key and mouse handlers will
//    be activated here and you will begin to receive 'focus', 'blur'
//    'select', and 'cancel' events from this control. You must decide
//    what those events visually mean for your application. Each
//    'focus' and 'blur' event will provide the $jqElement that it
//    applies to. In addition to 'focus' and 'blur' events you will
//    also receive 'select' and 'cancel' events. Like 'focus' and
//    'blur', 'select' also hands you a $jqElement. The $jqElement
//    provided from a 'select' event will be the $jqElement of the
//    last 'focus' event. A 'cancel' event does not provide a
//    $jqElement. In summation the events you would be interested
//    in after you call beginNavigationPhase() are:
//    'focus', 'blur', 'select', 'cancel'. You are responsible for
//    showing and hiding your choices.
//
// 7) At anytime during the navigation phase, which was started with
//    the call to beginNavigationPhase(), it is YOUR RESPONSIBILITY
//    to end the navigation phase with a call to endNavigationPhase().
//    You will typically end the navigation phase upon receiving a
//    'select' or 'cancel' event.
//
// 8) After ending the navigation phase, it is your responsibility
//    to hide the selection choices from the user. Just as it was
//    your responsibility to show them.
//
//    If you have a constant representation of this control
//    it becomes trivial to compose this control into a
//    reusable component. An example, -!!- hastily constructed -!!-
//    is included below using a marionette CollectionView
//
//
//           var MyItemView = marionette.ItemView.extend({
//               tagName: 'li',
//               template: '#my-item-view'
//           });
//
//           var InputSelectExample = marionette.Controller.extend({
//
//               initialize: function(){
//                   this.myInputSelect = new InputSelect({
//                       el: $('.input')
//                   });
//
//                   this.myCollectionView = new marionette.CollectionView({
//                       el: '.items ul',
//                       childView: MyItemView,
//                       collection: new Backbone.Collection()
//                   });
//
//                   this.listenTo(this.myInputSelect, 'input', this.receivedInput);
//
//                   this.listenTo(this.myInputSelect, 'focus', function($el){
//                       $el.addClass('focus');
//                   });
//
//                   this.listenTo(this.myInputSelect, 'blur', function($el){
//                       $el.removeClass('focus');
//                   });
//
//                   this.listenTo(this.myInputSelect, 'select', function($el){
//                       console.log('Wants select', $el.text(), $el);
//                       this.myInputSelect.endNavigationPhase();
//                       // reset() triggers a 'render' event
//                       // on the collection view
//                       this.myCollectionView.collection.reset();
//                   });
//
//                   this.listenTo(this.myInputSelect, 'cancel', function($el){
//                       console.log('Wants cancel');
//                       this.myInputSelect.endNavigationPhase();
//                       // reset() triggers a 'render' event
//                       // on the collection view
//                       this.myCollectionView.collection.reset();
//                   });
//               },
//
//               receivedInput: function(value){
//                   this.listenTo(this.myCollectionView, 'render', this.collectionViewRendered);
//                   this.myCollectionView.collection.reset([
//                       new Backbone.Model({'label': 'foo'}),
//                       new Backbone.Model({'label': 'bar'}),
//                       new Backbone.Model({'label': 'baz'}),
//                       ]);
//               },
//
//               collectionViewRendered: function(){
//                   var kids = this.myCollectionView.children.toArray()
//                   this.stopListening(this.myCollectionView, 'render');
//
//                    var elements = _.map(kids, function(each){
//                          return each.$el[0];
//                    });
//
//                   this.myInputSelect.setElements($(elements));
//                   this.myInputSelect.beginNavigationPhase();
//               }
//           });
//
//           new InputSelectExample();

var InputSelect = marionette.Controller.extend(
/** @lends built.core.controls.forms.input-select.InputSelect.prototype */
{

    // Constants
    EVENT_INPUT: 'input',

    el: null, // needs to be an <input> or contenteditable

    _defaults: {
        minLength: 2,
        debounceDelay: 300,
        acceptsMouseEnterExit:true
    },

    /**
     * Creates a new InputSelect
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        marionette.Controller.prototype.constructor.apply(this, arguments);
        this.listenTo(this, 'destroy', this.deinit);

        _.defaults(options, this._defaults);
        this.options = options;

        this.el = options.el || null;
        this.$el = helpers.registerElement(this.el);

        _.bindAll(this, 'receivedText',
            'mouseDidClick', 'mouseDidEnter', 'mouseDidExit',
            '_keyNavigationKeyDown', 'keyNavigationReturn', 'keyNavigationEscape',
            'keyNavigationUp', 'keyNavigationDown', 'keyNavigationFirstMove');


        this._initializeKeyResponder();
    },

    _initializeKeyResponder: function(){
        var actionEvent;

        if (this.options.debounceDelay === 0){
            actionEvent = this.receivedText;
        } else {
            actionEvent = _.debounce(this.receivedText, this.options.debounceDelay);
        }

        actionEvent = _.bind(actionEvent, this);

        this.inputResponder = new KeyResponder({
            el: this.$el,
            insertText: actionEvent,
            deleteBackward: actionEvent
        });
    },

    receivedText: function(responder, e){
        var $el = this.$el;
        var val = $el.is('input') ? $el.val() : $el.text();

        // The key responder controlling when this event
        // is fired intreperates key events on keyDown.
        // That means if the debounceDelay is 0, this
        // handler will receive the character before the
        // input field receives it. That's good, because
        // if we wanted we could preventDefault() and the char
        // would never even get inserted. But it means we need
        // to handle building up the values ourselves
        // and handle deleting the values. Again, only
        // when the debounce delay is 0.

        if (this.options.debounceDelay === 0){
            if (e.which == 8){
                val = val.slice(0, -1);
            } else {
                var char = String.fromCharCode(e.which);
                if(!e.shiftKey) char = char.toLowerCase();
                val = val + char;
            }
        }

        if (val.length >= this.options.minLength){
            this._dispatchInput(this.$el, val);
        }
    },

    setElements: function($elements){
        helpers.registerElement($elements);
        this._$elements = $elements;
    },

    beginNavigationPhase: function(){
        this.endNavigationPhase();
        this._initializeNavigationControls(this._$elements);
    },

    endNavigationPhase: function(){
        if(this.focusManager){
            this.focusManager.destroy();
        }

        if(this.indexManager){
            this.indexManager.destroy();
        }

        if(this.mouseResponder){
            this.mouseResponder.destroy();
        }

        if(this.keyNavigation){
            this.keyNavigation.destroy();
        }

        this.focusManager = null;
        this.indexManager = null;
        this.mouseResponder = null;
        this.keyNavigation = null;
    },

    _initializeNavigationControls: function($elements){
        this.focusManager = new SingleFocusManager({
            list: $elements.toArray()
        });

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

        this.keyNavigation = new KeyResponder({
            el: this.$el,
            keyDown: this._keyNavigationKeyDown,
            insertNewline: this.keyNavigationReturn,
            cancelOperation: this.keyNavigationEscape,
            moveUp: this.keyNavigationFirstMove,
            moveDown: this.keyNavigationFirstMove
         });

        this.listenTo(
            this.focusManager,
            focus.FOCUS,
            this.wantsFocus);

        this.listenTo(
            this.focusManager,
            focus.BLUR,
            this.wantsBlur);
    },

    // Keyboard Handling
    _keyNavigationSupressLateralCursorMovement: function(e){
        // up | down | escape | return
        // when the user presses up or down
        // prevent the cursor from jumping to the
        // left or right in the text field.
        if(/(38|40|27|13)/.test(e.keyCode)) e.preventDefault();
    },

    _keyNavigationKeyDown: function(responder, e){
        this._keyNavigationSupressLateralCursorMovement(e);
        this.keyNavigation.interpretKeyEvents([e]);
    },

    keyNavigationReturn: function(responder, e){
        var obj = this.focusManager.getFocusedObject();
        this.wantsSelect(obj);
    },

    keyNavigationEscape: function(responder, e){
        this._dispatchCancel();
    },

    keyNavigationFirstMove: function(responder, e){
        if (e.keyCode == 40){ // down
            if(this.indexManager.getIndex() === 0){
                this.focusManager.focusIndex(0);
                this._dispatchFocus(
                    $(this.focusManager.getFocusedObject()),
                    focus.FOCUS_KEY);
            } else {
                this.keyNavigationDown(responder, e);
            }
        } else {
            this.keyNavigationUp(responder, e);
        }

        this.keyNavigation.moveDown = this.keyNavigationDown;
        this.keyNavigation.moveUp = this.keyNavigationUp;
    },

    keyNavigationUp: function(responder, e){
        this.isKeyNavigating = true;
        this.indexManager.previousIndex();
        this.focusManager.focusIndex(this.indexManager.getIndex());

        this._dispatchFocus(
            $(this.focusManager.getFocusedObject()),
            focus.FOCUS_KEY);
    },

    keyNavigationDown: function(responder, e){
        this.isKeyNavigating = true;
        this.indexManager.nextIndex();
        this.focusManager.focusIndex(this.indexManager.getIndex());
        this._dispatchFocus(
            $(this.focusManager.getFocusedObject()),
            focus.FOCUS_KEY);
    },

    // Mouse Handling
    mouseDidClick: function(responder, e){
        if(responder.clickCount() > 0){
            // keep the input focused
            this.$el.focus();
            this.wantsSelect(e.currentTarget);
        }
    },

    mouseDidEnter: function(responder, e){
        if(!this.options.acceptsMouseEnterExit){
            return;
        }
        var $el = $(e.currentTarget);
        var index = this._$elements.index($el);
        this.indexManager.setIndex(index);
        this.focusManager.focus($el[0]);

        this._dispatchFocus(
            $(this.focusManager.getFocusedObject()),
            focus.FOCUS_MOUSE);
    },

    mouseDidExit: function(responder, e){
        if(!this.options.acceptsMouseEnterExit){
            return;
        }
        this.focusManager.blur(e.target);
    },

    wantsFocus: function(sender, obj){
        this._dispatchFocus($(obj));
    },

    wantsBlur: function(sender, obj){
        this._dispatchBlur($(obj));
    },

    wantsSelect: function(obj){
        this._dispatchSelect($(obj));
    },

    deinit: function(){
        this.endNavigationPhase();
        this._$elements = [];
    },

    // Event Dispatchers
    // event, sender, [target, [args ...]]
    _dispatchInput: function($target, value) {
        this.trigger(data.DATA, this, $target, value);
    },

    _dispatchFocus: function($target, focusType) {
        focusType = focusType || focus.FOCUS;
        this.trigger(focusType, this, $target);
    },

    _dispatchBlur: function($target) {
        this.trigger(focus.BLUR, this, $target);
    },

    _dispatchSelect: function($target) {
        this.trigger(events.SELECT, this, $target);
    },

    _dispatchCancel: function() {
        this.trigger(events.CANCEL, this);
    }

});

// Exports
exports.InputSelect = InputSelect;

}); // eof define
