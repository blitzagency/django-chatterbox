/**
 * UI Slider Implementation
 * @module built.ui.controls.slider
 */
define(function(require, exports, module){

var _ = require('underscore');
var marionette = require('marionette');
var dragEvents = require('built/core/events/drag');
var events = require('built/core/events/event');
var composeAll = require('built/core/utils/helpers').composeAll;

var SliderContainer = marionette.Controller.extend(
/** @lends built.ui.controls.slider.SliderContainer.prototype */
{

    _driver: null,
    _uiUpdater: null,

    /**
     * Creates a new SliderContainer

     * @example
     * var sliderContainer = new SliderContainer({
     *     driver: new HorizontalSliderControl({
     *         // slider options
     *         // see built/core/controls/horizontal.js
     *     })
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        marionette.Controller.prototype.constructor.apply(this, arguments);

        this.options = _.defaults(options, this._getDefaults());
        this._driver = this._initializeDriver(this.options);
        this._uiUpdater = this._initializeUiUpdater(this._driver.options);
    },

    onDestroy: function() {
        this._driver.destroy();
    },

    _getDefaults: function() {
        return {
            driver: null
        };
    },

    _initializeDriver: function(options) {
        var driver = options.driver;

        if(_.isEmpty(driver)) throw 'Undefined driver.';

        this.listenTo(driver, dragEvents.DRAG_UPDATE, this._dragDidUpdate);
        this.listenTo(driver, dragEvents.DRAG_START, this._dragDidStart);
        this.listenTo(driver, events.CHANGE, this._rangeDidChange);

        driver.$container.css({
            position: 'relative'
        });

        driver.$track.css({
            position: 'relative'
        });

        driver.$handles.css({
            position: 'absolute',
            top: '0',
            left: '0'
        });

        return driver;
    },

    _initializeUiUpdater: function(options) {
        return options.snap ? this._updateUiWithSnap : this._updateUi;
    },

    _updateUi: function($handle, range, position, value) {
        $handle.css({'left': value + 'px'});
    },

    _updateUiWithSnap: function($handle, range, position, value) {
        var step, stepDelta;

        step = this._driver.getStepForHandle($handle);

        // When we are in step mode, the stepDelta is calculated by
        // subtracting 1 from the total steps: 1 / (steps - 1)
        // we keep it nice and tidy by doing the same here.
        // See: built/core/controls/sliders/horizontal._initializeRanges
        stepDelta = 1 / (this._driver.options.steps - 1);

        // augment position and value
        value = range.getMax() * (stepDelta * step);

        // pass in augmented values to original update function
        this._updateUi($handle, range, position, value);
    },

    _dragDidStart: function(manager, $handle){
        _.each(manager.$handles, function(el){
            var $el = $(el);
            $el.css({'z-index': 0});
        });

        $handle.eq(0).css({'z-index': 1});
    },

    _dragDidUpdate: function(sender, $handle, range, position, value) {
        this._driver._dispatchDragUpdate.apply(this, arguments);
    },

    _rangeDidChange: function(sender, $handle, range, position, value) {
        this._uiUpdater($handle, range, position, value);
        this._driver._dispatchChange.apply(this, arguments);
    }

}); // eof SliderContainer

// Exports
module.exports.SliderContainer = SliderContainer;

}); // eof define
