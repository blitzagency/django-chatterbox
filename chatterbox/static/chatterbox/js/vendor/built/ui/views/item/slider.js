/**
 * Slider View
 * @module built.ui.views.item.slider
 */

define(function (require, exports, module) {

var _ = require('underscore');
var marionette = require('marionette');
var SliderContainer = require('built/ui/controls/slider').SliderContainer;
var dragEvents = require('built/core/events/drag');
var events = require('built/core/events/event');
var getElement = require('built/ui/helpers/dom').getElement;

var SliderView =  marionette.ItemView.extend(
/** @lends built.ui.views.item.slider.SliderView.prototype */
{

    _container: null,
    _driver: null,

    /**
     * Initialize slider view
     *
     * @constructs
     * @extends marionette.ItemView
     * @param {object} [options] Options for Initialization
     *
     */
    initialize: function(options){
        options = options || {};
        options = _.defaults(options, this._getDefaults());

        // Backbone 1.1+ compatibility
        this.options = options;
    },

    _getDefaults: function() {
        return {
            container: null,
            track: null,
            handles: null,
            steps: 0,
            snap: false,
            acceptsMouse: true,
            acceptsTouch: true
        };
    },

    initializeSliderContainer: function(){
        var options, driver;

        options = this.options;
        options.container = this.getContainer(options);
        options.track     = this.getTrack(options);
        options.handles   = this.getHandles(options);

        driver = this.getDriver(options);

        // events
        this.listenTo(driver, events.CHANGE, this._rangeDidChange);
        this.listenTo(driver, dragEvents.DRAG_UPDATE, this._dragDidUpdate);
        this.listenTo(driver, dragEvents.DRAG_START, this._dragDidStart);
        this.listenTo(driver, dragEvents.DRAG_END, this._dragDidEnd);

        // apply 'composable' driver api at this scope
        // TODO, Revisit - Replace with Dino's mixin function?
        driver.compose(this);

        this._driver = driver;
        this._container = new SliderContainer({driver:driver});
    },

    // Abstract methods

    getDriver: function(options){
        throw new Error('getDriver not implemented');
    },

    getContainer: function(options) {
        // our container should be our $el
        // override to change this return value
        return this.$el;
    },

    getTrack: function(options){
        // simply return value set in options
        // override to change this return value
        return getElement(options.track, this.$el);
    },

    getHandles: function(options){
        // simply return value set in options
        // override to change this return value
        return getElement(options.handles, this.$el);
    },

    // Event dispatchers
    _rangeDidChange: function(sender, $handle, range, position, value) {
        this._driver._dispatchChange.apply(this, arguments);
    },

    _dragDidUpdate: function(sender, $handle, range, position, value) {
        this._driver._dispatchDragUpdate.apply(this, arguments);
    },

    _dragDidStart: function(sender, $handle, range, position, value) {
        this._driver._dispatchDragStart.apply(this, arguments);
    },

    _dragDidEnd: function(sender, $handle, range, position, value) {
        this._driver._dispatchDragEnd.apply(this, arguments);
    }
});

exports.SliderView = SliderView;

});
