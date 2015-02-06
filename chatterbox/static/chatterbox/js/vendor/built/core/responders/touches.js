/**
 * Responders - Touches
 * @module built.core.responders.touches
 */
define(function(require, exports, module){

// Imports

var marionette = require('marionette');
var _          = require('underscore');
var helpers    = require('built/core/utils/helpers');

// Module

var TouchResponder = marionette.Controller.extend(
/** @lends built.core.responders.touches.TouchResponder.prototype */
{

    // Object vars

    el: null,
    clickCountTimeout: 350,

    /**
     * Creates a new TouchResponder
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
        _.bindAll(this, '_touchStart', '_touchMove', '_touchEnd', '_touchCancel');

        this.$el = helpers.registerElement(this.el);

        this.$el.on('touchstart.built.responders.touch', {ctx: this}, this._touchStart);
        this.$el.on('touchmove.built.responders.touch', {ctx: this}, this._touchMove);
        this.$el.on('touchend.built.responders.touch', {ctx: this}, this._touchEnd);
        this.$el.on('touchcancel.built.responders.touch', {ctx: this}, this._touchCancel);
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

    // Internal Handlers

    _touchStart: function(e){
        this._setStartX(e);

        // multiple mouse clicks are conceptually treated as a single
        // mouse-down event within the clickCountTimeout window
        // (although they arrive in a series of mouseDown: messages).
        this._clickCounter();
        this.touchStart(this, e);
    },

    _touchEnd: function(e){
        this._setEndX(e);

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
        this.touchEnd(this, e);
    },

    _touchMove: function(e){
        this._setEndX(e);
        this.touchMove(this, e);
    },

    _touchCancel: function(e){
        this.touchCancel(this, e);
    },

    _setStartX: function(e){
        this._startX = _.map(e.originalEvent.targetTouches, function(x){
            return x.pageX;
        });

        this._startY = _.map(e.originalEvent.targetTouches, function(x){
            return x.pageY;
        });
    },

    _setEndX: function(e){
        this._endX = _.map(e.originalEvent.targetTouches, function(x){
            return x.pageX;
        });

        this._endY = _.map(e.originalEvent.targetTouches, function(x){
            return x.pageY;
        });
    },

    touchStart: function(responder, e){
        // noop
    },

    touchMove: function(responder, e){
        // noop
    },

    touchEnd: function(responder, e){
        // noop
    },

    touchCancel: function(responder, e){
        // noop
    },

    clickCount: function(){
        return this._clicks;
    },

    deltaX: function(){
        var each = _.zip(this._startX, this._endX);

        return _.map(each, function(x){
            return x[1] - x[0];
        });
    },

    deltaY: function(){
        var each = _.zip(this._startY, this._endY);

        return _.map(each, function(x){
            return x[1] - x[0];
        });
    },

    deinit: function(){
        this.$el.off('touchstart.built.responders.touch', this._touchStart);
        this.$el.off('touchmove.built.responders.touch', this._touchMove);
        this.$el.off('touchend.built.responders.touch', this._touchEnd);
        this.$el.off('touchcancel.built.responders.touch', this._touchCancel);
    }

}); // eof TouchResponder

// Exports

exports.TouchResponder = TouchResponder;

}); // eof define
