/**
 * Swipe Gesture
 * @module built.core.gestures.swipe
 */
define(function(require, exports, module){

// Imports

var marionette     = require('marionette');
var _              = require('underscore');
var TouchResponder = require('built/core/responders/touches').TouchResponder;

// Module

var SwipeGesture = marionette.Controller.extend(
/** @lends built.core.gestures.swipe.SwipeGesture.prototype */
{

    // Object vars

    numberOfTouchesRequired: 1,
    start: undefined,
    direction: undefined, // left, right, up, down
    $target: undefined,

    // the gesture must traverse at least this percentage
    // of the target view in the selected direction to count.
    threshold: 0.3,


    /**
     * Creates a new SwipeGesture
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
        _.bindAll(this, 'touchStart', 'touchMove', 'touchEnd');

        this.responder = new TouchResponder({
            el: options.el,
            touchStart: this.touchStart,
            touchMove: this.touchMove,
            touchEnd: this.touchEnd
        });
    },

    handleGesture: function($el, gesture){
        //noop
    },

    touchStart: function(responder, e){
        if(this.hasRequiredTouches(e)){
            var touches = e.originalEvent.touches;

            this.reset();
            this.$target = $(e.target);
            this.start = {
                'x':touches[0].pageX,
                'y':touches[0].pageY
            };
        }
    },

    touchMove: function(responder, e){
        if(this.hasRequiredTouches(e)){
            var touches = e.originalEvent.touches;
            var move = {
                'x': touches[0].pageX,
                'y': touches[0].pageY
            };

            this.delta = this.getDelta(this.start, move);
            this.move = move;
        }
    },

    touchEnd: function(responder, e){
        var move = this.move;
        var start = this.start;
        var result = false;

        var gestures = {
            left: this.isLeftSwipe,
            right: this.isRightSwipe,
            up: this.isUpSwipe,
            down: this.isDownSwipe
        };

        if(start && move && gestures[this.direction](move, start)){
            if(this.isPastThreshold(this.delta)){
                this.handleGesture(this.$target, this);
            }
        }
    },

    isLeftSwipe: function(current, start){
        return (current.x - start.x) < 0;
    },

    isRightSwipe: function(current, start){
        return (current.x - start.x) > 0;
    },

    isUpSwipe: function(current, start){
        return (current.y - start.y) < 0;
    },

    isDownSwipe: function(current, start){
        return (current.y - start.y) > 0;
    },

    reset: function(){
        this.start = false;
        this.move  = false;
        this.delta = false;
        this.target = null;
    },

    hasRequiredTouches: function(e){
        var touches = e.originalEvent.touches;
        return touches.length === this.numberOfTouchesRequired;
    },

    getDelta: function (start, move){
        if(start === false || move === false) return false;

        var x = Math.abs(start.x - move.x);
        var y = Math.abs(start.y - move.y);

        return {'x': x, 'y': y};
    },

    isPastThreshold: function(delta){
        var result = false;
        var dx     = delta.x;
        var dy     = delta.y;
        var boundingRect = this.$target[0].getBoundingClientRect();

        var width  = boundingRect.width;
        var height = boundingRect.height;

        if(this.direction == 'up' || this.direction == 'down'){
            if(dy > height * this.threshold){
                result = true;
            }
        } else {

            if(dx > width * this.threshold){
                result = true;
            }
        }


        return result;
    },

    // Marionette overrides

    deinit: function(){
        this.reset();
        this.responder.destroy();
    }

}); // eof SwipeGesture

// Exports

module.exports.SwipeGesture = SwipeGesture;

}); // eof define
