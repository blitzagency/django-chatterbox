/**
 * Responders - Mouse
 * @module built.core.responders.mouse
 */
define(function(require, exports, module){

// Imports

var marionette = require('marionette');
var _          = require('underscore');
var helpers    = require('built/core/utils/helpers');

// Module

var MouseResponder = marionette.Controller.extend(
/** @lends built.core.responders.mouse.MouseResponder.prototype */
{

    // Object vars

    el: null,

    // Why rely on these accepts* flags? Why not use the presence of
    // the public user callbacks: mouseUp, mouseDown, etc to designate
    // which mouse events are importnat?
    // The user may or may pass mouseUp, mouseDown, etc at construction
    // time. It's entirely possible to do this:
    //
    // var m = new MouseResponder({el:'...', acceptsUpDown: true});
    // m.mouseUp = myHandler.mouseUp.
    //
    // in that case, we would have never known to even start listenting
    // for up or down events if we only relied on them being set at
    // initialization time.
    acceptsUpDown: false,
    acceptsMove: false,
    acceptsEnterExit: false,

    _defaults: {
        acceptsUpDown: true,
        acceptsMove: false,
        acceptsEnterExit: false
    },


    // Time window, in milliseconds,  to count clicks
    clickCountTimeout: 350,

    /**
     * Creates a new MouseResponder
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        marionette.Controller.prototype.constructor.apply(this, arguments);
        this.listenTo(this, 'destroy', this.deinit);

        _.bindAll(this, '_mouseDown', '_mouseUp',
            '_mouseEntered', '_mouseExited',
            '_mouseDragged', '_mouseMoved');

        _.defaults(options, this._defaults);

        this.el = options.el;
        this.$el = helpers.registerElement(this.el);

        this.mouseDown    = options.mouseDown    || this.mouseDown;
        this.mouseUp      = options.mouseUp      || this.mouseUp;
        this.mouseMoved   = options.mouseMoved   || this.mouseMoved;
        this.mouseDragged = options.mouseDragged || this.mouseDragged;
        this.mouseEntered = options.mouseEntered || this.mouseEntered;
        this.mouseExited  = options.mouseExited  || this.mouseExited;

        this.enableUpDown(options.acceptsUpDown);
        this.enableMove(options.acceptsMove);
        this.enableEnterExit(options.acceptsEnterExit);
    },

    enableUpDown: function(bool){
        if(bool && !this.acceptsUpDown){
            this.$el.on('mousedown.built.responders.mouse', {ctx: this}, this._mouseDown);
            this.$el.on('mouseup.built.responders.mouse', {ctx: this}, this._mouseUp);
        } else if(!bool && this.acceptsUpDown){
            this.$el.off('mousedown.built.responders.mouse', this._mouseDown);
            this.$el.off('mouseup.built.responders.mouse', this._mouseUp);
        }

        this.acceptsUpDown = bool;
    },

    enableMove: function(bool){
        if(bool && !this.acceptsMove){
            this.$el.on('mousemove.built.responders.mouse', {ctx: this}, this._mouseMoved);
        } else if (!bool && this.acceptsMove){
            this.$el.off('mousemove.built.responders.mouse', this._mouseMoved);
        }

        this.acceptsMove = bool;
    },

    enableEnterExit: function(bool){
        if(bool && !this.acceptsEnterExit){
            this.$el.on('mouseenter.built.responders.mouse', {ctx: this}, this._mouseEntered);
            this.$el.on('mouseleave.built.responders.mouse', {ctx: this}, this._mouseExited);
        } else if(!bool && this.acceptsEnterExit) {
            this.$el.off('mouseenter.built.responders.mouse', this._mouseEntered);
            this.$el.off('mouseleave.built.responders.mouse', this._mouseExited);
        }

        this.acceptsEnterExit = bool;
    },

    _clickCounter: function(){
        if(!this._clickTimeout){
            this._clicks = 0;

            var handle = $.proxy(function(){
                this._clickTimeout = null;
            }, this);

            this._clickTimeout = setTimeout(handle, this.clickCountTimeout);
        }

        this._lastClick = new Date().getTime();
        return ++this._clicks;
    },

    // In order to handle 'dragged' we need to handle some
    // internal state. We don't want the user overriding these
    // internal handlers so they are prefixed with an _ and will
    // call the public handlers accordingly

    // Internal Handlers
    _mouseDown: function(e){
        this._startX = e.pageX;
        this._startY = e.pageY;

        // multiple mouse clicks are conceptually treated as a single
        // mouse-down event within the clickCountTimeout window
        // (although they arrive in a series of mouseDown: messages).
        this._clickCounter();

        // watch for dragging
        $(document).on('mousemove.built.responders.mouse', this._mouseDragged);
        $(document).on('mouseup.built.responders.mouse', this._mouseUp);
        this.mouseDown(this, e);
    },

    _mouseUp: function(e){
        this._endX = e.pageX;
        this._endY = e.pageY;

        // Returns 0 for a mouse-up event if the clickCountTimeout
        // has passed since the corresponding mouse-down event.
        // This is because if the clickCountTimeout passes before
        // the mouse button is released, it is no longer considered
        // a mouse click, but a mouse-down event followed by a
        // mouse-up event. In other words, holding after a mouse-down
        // and then releasing after a period of time will yield a
        // click count of 0
        var now = new Date().getTime();
        this._clicks = (now - this._lastClick) > this.clickCountTimeout ? 0 : this._clicks;

        // disable for dragging
        $(document).off('mousemove.built.responders.mouse', this._mouseDragged);
        $(document).off('mouseup.built.responders.mouse', this._mouseUp);
        this.mouseUp(this, e);
    },

    _mouseDragged: function(e){
        this._endX = e.pageX;
        this._endY = e.pageY;
        this.mouseDragged(this, e);
    },

    _mouseMoved: function(e){
        this.mouseMoved(this, e);
    },

    _mouseEntered: function(e){
        this.mouseEntered(this, e);
    },

    _mouseExited: function(e){
        this.mouseExited(this, e);
    },

    // External Handlers
    mouseDown: function(responder, e){
        // noop
    },

    mouseUp: function(responder, e){
        // noop
    },

    mouseMoved: function(responder, e){
        // noop
    },

    mouseDragged: function(responder, e){
        // noop
    },

    mouseEntered: function(responder, e){
        // noop
    },

    mouseExited: function(responder, e){
        // noop
    },

    deltaX: function(){
        return this._endX - this._startX;
    },

    deltaY: function(){
        return this._endY - this._startY;
    },

    clickCount: function(){
        return this._clicks;
    },

    // marionette overrides

    deinit: function(){
        // to ensure it's gone
        $('body').off('mousemove.built.responders.mouse', this._mouseDragged);

        this.enableUpDown(false);
        this.enableMove(false);
        this.enableEnterExit(false);
    }

}); // eof MouseResponder

// Exports

exports.MouseResponder = MouseResponder;

}); // eof define
