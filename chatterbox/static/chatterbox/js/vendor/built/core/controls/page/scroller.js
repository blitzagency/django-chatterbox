define(function(require, exports, module){

// Imports

var _             = require('underscore');
var Helpers       = require('built/core/utils/helpers');
var ScrollManager = require('built/core/managers/scroll').ScrollManager;

// Module

var Scroller = ScrollManager.extend({

    DEFAULT_DURATION   : 300,
    EASING_LINEAR      : 'linear',
    EASING_SWING       : 'swing',

    /**
     * initialize the Scroller, extends ScrollManager
     * @param  {object} options options literal
     * @return {undefined}
     *
     * @example
     * var scroller = new Scroller({
     *     el            : $(window),  // required, can be any element or $element;
     *                                    though window must be passed in as $(window)
     *     scrollDebounce: 0,          // optional, default 0, debounces calls to scroll listeners
     *     duration      : 300,        // optional, default 300 (milliseconds), animation duration
     * });
     */
    initialize: function(options) {
        this.constructor.__super__.initialize.apply(this, arguments);
    },

    onClose: function() {
        // TODO: Implement, if necessary.
    },

    // Private Methods

    /**
     * Override super _getDefaults to add a few of our own
     * @return {object} defaults object.
     */
    _getDefaults: function() {
        var defaults;

        defaults = this.constructor.__super__._getDefaults.call(this);

        // extend original return value with new options
        return _.extend(defaults, {
            duration: this.DEFAULT_DURATION
        });
    },

    _animateScroll: function(start, end, duration) {

        function step(now, tween) {
            this.constructor.__super__.setScrollValue.call(this, now);
        }

        function complete() {
            // do something usefull here
        }

        if(duration === 0){
            this.constructor.__super__.setScrollValue.call(this, end);
        }

        // TODO: Revisit, resulting animation from this chuggy.
        $({value: start}).animate(
            {value: end},
            {
                duration: duration,
                step: _.bind(step, this),
                complete: _.bind(complete, this)
            }
        );
    },

    // Public API

    setScrollValue: function(value) {
        var start, end;

        start = this.getScrollValue();
        end   = Helpers.normalizeInt(value, this.getMinScrollValue(), this.getMaxScrollValue());

        return this._animateScroll(
            start, end, this.options.duration
        );
    },

    scrollToElement: function($el){
        var toPos = $el.offset().top - this.$el.offset().top + this.$el.scrollTop();
        return this.setScrollValue(toPos);
    }

}); // eof Scroller

// Exports
module.exports.Scroller = Scroller;

}); // eof define
