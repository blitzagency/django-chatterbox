/**
 * Responders - Scroll
 * @module built.core.responders.scroll
 */
define(function(require, exports, module){

// Imports
var marionette = require('marionette');
var _          = require('underscore');
var helpers    = require('built/core/utils/helpers');

// Module

// ganked:
/**
 * constant used for minimum amount of time between cycles
 * @type {Number}
 * *
 * .. note ::
 *     this was ganked from here:
 *     https://github.com/Famous/inputs/blob/master/ScrollSync.js#L72
 */
var MINIMUM_TICK_TIME = 8;

var _now = Date.now;

var ScrollResponder = marionette.Controller.extend(
/** @lends built.core.responders.scroll.ScrollResponder.prototype */
{

    EVENT_SCROLL: 'scroll.built.responders.scroll',

    el: null,
    scrollDebounce: null,

    _prevScrollCoord: null,
    _prevTime:null,
    _direction: null,


    /**
     * Creates a new ScrollResponder
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options) {
        // apply options to this scope
        _.extend(this, options);

        // bind correct scope
        _.bindAll(
            this,
            '_didReceiveScroll'
        );

        this.$el = helpers.registerElement(this.el);

        this._prevCoords = {
            top: 0,
            left: 0
        };

        this._direction = {
            x: 0,
            y: 0
        };

        // decorate internal _didReceiveScroll if debounce is enabled
        if(this.scrollDebounce > 0) {
            this._didReceiveScroll = _.debounce(
                this._didReceiveScroll, this.scrollDebounce);
        }

        this.$el.on(this.EVENT_SCROLL, this._didReceiveScroll);

        marionette.Controller.prototype.constructor.apply(this, arguments);
    },

    onDestroy: function() {
        this.$el.off(this.EVENT_SCROLL, this._didReceiveScroll);
    },

    // Internal event delegates

    // Binding to internal callbacks, instead of straight to
    // whatever the user passes in for "scroll" allows a known,
    // single-point to detach listeners. This should prevent most
    // memory leaks typically associated with event delegates when
    // "destroy" is run on this object.
    _didReceiveScroll: function(event) {
        var currTime = _now();
        var prevTime = this._prevTime || currTime;
        var diffTime = Math.max(currTime - prevTime, MINIMUM_TICK_TIME); // minimum tick time
        var newTop = this.$el.scrollLeft();
        var newLeft = this.$el.scrollTop();

        var xDiff = Math.abs(newLeft - this._prevCoords.left);
        var yDiff = Math.abs(newTop - this._prevCoords.top);

        var movedPixels;

        if(xDiff && yDiff){
            // you moved both x and y, this is a greater distance, so we
            // use pythag theorum to get the distance
            movedPixels = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
        }else{
            movedPixels = xDiff || yDiff || 0;
        }

        this._updateDirection(newLeft, newTop);

        this._currentVelocity = movedPixels/ diffTime;

        this._prevTime = currTime;
        this._prevCoords = {
            top: newTop,
            left: newLeft
        };

        this.scroll(this, event);
    },

    _updateDirection: function(newLeft, newTop){
        if(newLeft < this._prevCoords.left){
            this._direction.x = 1;
        }else if(newLeft > this._prevCoords.left){
            this._direction.x = -1;
        }else{
            this._direction.x = 0;
        }

        if(newTop < this._prevCoords.top){
            this._direction.y = 1;
        }else if(newTop > this._prevCoords.top){
            this._direction.y = -1;
        }else{
            this._direction.y = 0;
        }
    },

    getVelocity: function(){
        return  this._currentVelocity || 0;
    },

    getDirection: function(){
        return this._direction;
    },

    // Optional, user-defined delegates

    scroll: function(responder, e) {
        // noop
    },

}); // eof ScrollResponder

// Exports
module.exports.ScrollResponder = ScrollResponder;

}); // eof define
