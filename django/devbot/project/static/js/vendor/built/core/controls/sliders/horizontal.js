/**
 * Drag and Drop List Controller
 * @module built.core.controls.sliders.horizontal
 */
define(function(require, exports, module){

var _ = require('underscore');
var marionette = require('marionette');
var RangeManager = require('built/core/managers/range').RangeManager;
var MouseResponder = require('built/core/responders/mouse').MouseResponder;
var TouchResponder = require('built/core/responders/touches').TouchResponder;
var dragEvents = require('built/core/events/drag');
var events = require('built/core/events/event');
var getElementBounds = require('built/ui/helpers/dom').getElementBounds;
var registerElement = require('built/core/utils/helpers').registerElement;
var composeAll = require('built/core/utils/helpers').composeAll;

var HorizontalSliderControl = marionette.Controller.extend(
/** @lends built.core.controls.sliders.horizontal.HorizontalSliderControl.prototype */
{

    _rangeManagers : null,
    _mouseResponders : null,
    _touchResponders : null,
    _handleOffsets : [],

    /**
     * Creates a new HorizontalSliderControl
     *
     * @example
     *
     * horizontalSliderControl = new HorizontalSliderControl(
     *     {
     *         container    : $('.slider'),           // required, string or jquery
     *         track        : $('.slider .track'),    // required, string or jquery
     *         handles      : $('.slider .handle'),   // required, string or jquery
     *         steps        : 10,                     // default 0
     *         snap         : flase,                  // default false
     *         acceptsMouse : true                    // default true
     *         acceptsTouch : false                   // default false
     *     }
     * );
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        marionette.Controller.prototype.constructor.apply(this, arguments);
        this.listenTo(this, 'destroy', this.deinit);

        this.options = _.defaults(options, this._getDefaults());

        this.$container = registerElement(this.options.container, true);
        this.$track     = registerElement(this.options.track,     true);
        this.$handles   = registerElement(this.options.handles,   true);

        this._rangeManagers = this._initializeRanges();

        if(this.options.acceptsMouse){
            this._mouseResponders = this._initializeMouse();
        }
        if(this.options.acceptsTouch){
            this._touchResponders = this._initializeTouch();
        }
    },

    deinit: function() {
        var controllers;

        function iterator (controller, i, list) {
            if(controller) controller.destroy();
        }

        controllers = (this._mouseResponders || [])
            .concat(this._touchResponders || [])
            .concat(this._rangeManagers || []);

        _.each(controllers, iterator, this);
    },

    // Override / extend return value here to add additional options
    _getDefaults: function() {
        return {
            container: null,
            track: null,
            handles: null,
            steps: 0,
            snap: false,
            acceptsMouse: true,
            acceptsTouch: false
        };
    },

    _initializeRanges: function() {
        var $handles, $track;

        function iterator(handle, i, list) {
            var $handle, listener, dragListener, range;

            $handle = $(handle);

            // this listener will be triggered when the value actually changes.
            listener = _.bind(this._rangeDidChange, this, $handle);
            listenerMarkers = _.bind(this._rangeMarkerDidChange, this, $handle);
            // this listener will be triggered when dragging changes.
            // This listener and the listener above will trigger in tandem
            // if no steps are provided.
            dragListener = _.bind(this._dragDidChange, this, $handle);

            range = new RangeManager({
                min: 0,
                max: this._calculateNormalizedMaxPosition($handle, $track)
            });

            if(this.options.steps){
                var steps = this.options.steps;

                // ensure we have steps from with bookends
                // of 0 and 1
                var stepDelta = 1 / (steps - 1);

                var markers = _.map(_.range(steps), function(i){
                    return i  * stepDelta;
                });

                RangeManager.prototype.addMarkerPositions.apply(range, markers);
                this.listenTo(range, events.MARKER, listenerMarkers);
            } else {
                this.listenTo(range, events.CHANGE, listener);
            }

            // This tells us that dragging changed, weaither we
            // are snapping or not. If no steps were provided
            // this will line up with the rangeDidChange handler.
            this.listenTo(range, events.CHANGE, dragListener);

            return range;
        }

        $handles = this.$handles;
        $track = this.$track;

        return _.map($handles, iterator, this);
     },

    _initializeMouse: function() {
        var ranges;

        function iterator(el, i, list) {
            return new MouseResponder({
                el: $(el),
                mouseDragged: _.bind(this._handleDidReceiveDrag, this, ranges[i]),
                mouseDown: _.bind(this._handleDidReceiveDragStart, this, ranges[i]),
                mouseUp: _.bind(this._handleDidReceiveDragEnd,  this, ranges[i])
            });
        }

        ranges = this._rangeManagers;

        return _.map(this.$handles, iterator, this);
    },

    _initializeTouch: function() {
        var ranges;

        function iterator(el, i, list) {
            return new TouchResponder({
                el: $(el),
                touchMove : _.bind(this._handleDidReceiveDrag,      this, ranges[i]),
                touchStart: _.bind(this._handleDidReceiveDragStart, this, ranges[i]),
                touchEnd  : _.bind(this._handleDidReceiveDragEnd,  this, ranges[i])
            });
        }

        ranges = this._rangeManagers;

        return _.map(this.$handles, iterator, this);
    },

    _calculateNormalizedMaxPosition: function($handle, $track) {
        var handleBounds, trackBounds;

        handleBounds = getElementBounds($handle);
        trackBounds = getElementBounds($track);

        return Math.abs(trackBounds.width - handleBounds.width);
    },

    _getHandleIndex: function($handle) {
        var $handles, index;

        $handles = this.$handles;
        index = $handles.index($handle);

        if(index < 0) {
            throw 'Could not retrieve handle from the currently set $handles option.';
        }

        return index;
    },

    _getRangeManager: function(index) {
        var outofrange;

        outofrange = index > this._rangeManagers.length - 1;

        if(outofrange) {
            throw 'Index out of range, this._rangeManagers[' + index + '], when length is ' + this._rangeManagers.length + '.';
        }

        return this._rangeManagers[index];
    },

    /**
     * composes methods into the incoming container scope
     * @param  {object} container the container into which we are composing
     * @return {undefined}
     *
     * @note
     * Override this to add additional composable methods
     */
    compose: function(container) {
        composeAll(
            container,
            this,
            'calculateMaxPosition',
            'getPositionAt',
            'getPositions',
            'getPositionForHandle',
            'setPositionAt',
            'setPositionForHandle',
            'getStepAt',
            'getSteps',
            'getStepForHandle',
            'setStepAt',
            'setStepForHandle',
            'getPosition',
            'setPosition',
            'getStep',
            'setStep'
        );
    },

    calculateMaxPosition: function() {
        var $handles, $track, $handle, range, max;

        function iterator(handle, i, $handles) {
            $handle = $(handle);
            range = this._getRangeManager(i);
            max = this._calculateNormalizedMaxPosition($handle, $track);

            range.setMax(max);
        }

        $handles = this.$handles;
        $track = this.$track;

        _.each(this.$handles, iterator, this);
    },

    getPositionAt: function(index) {
        return this._getRangeManager(index).getPosition();
    },

    getPositions: function() {
        function iter(el, i, list) {
            return this.getPositionAt(i);
        }

        return _.map(this._rangeManagers, iter, this);
    },

    getPositionForHandle: function($handle) {
        var index;

        index = this._getHandleIndex($handle);
        return this.getPositionAt(index);
    },

    setPositionAt: function(value, index) {
        index = index || 0; // default to 0
        var range = this._getRangeManager(index);

        range.setPosition(value);
    },

    setPositionForHandle: function(value, $handle) {
        var index;

        index = this._getHandleIndex($handle);
        this.setPositionAt(value, index);
    },

    getStepAt: function(index) {
        var position;
        var range = this._getRangeManager(index);
        var result;

        // round will round-up if decimal is greater than .5.
        // round will round-down if decimal is less than .5.
        // this should give good reporting of steps based on position.
        //
        // When we are in step mode, the setDelta is calculated by
        // subtracting 1 from the total steps: 1 / (steps - 1)
        // we keep it nice and tidy by doing the same here.
        // See: _initializeRanges

        position = range.getPosition();
        result = (this.options.steps - 1) * position;
        return Math.round(result);
    },

    getSteps: function() {
        function iterator(el, i, list) {
            return this.getStepAt(i);
        }

        return _.map(this._rangeManagers, iterator, this);
    },

    getStepForHandle: function($handle) {
        var index;

        index = this._getHandleIndex($handle);
        return this.getStepAt(index);
    },

    setStepAt: function(value, index) {
        var position = this.positionForStep(value);
        this.setPositionAt(position, index);
    },

    stepForPosition: function(value){
        return Math.round((this.options.steps - 1)  * value);
    },

    positionForStep: function(value){
        var steps;
        var positions;
        // When we are in step mode, the setDelta is calculated by
        // subtracting 1 from the total steps: 1 / (steps - 1)
        // we keep it nice and tidy by doing the same here.
        steps = (this.options.steps - 1);

        // isNaN check handles 0/0 case
        position = value/steps;
        position = isNaN(position) ? 0 : position;
        return position;
    },

    setStepForHandle: function(value, $handle) {
        var index;

        index = this._getHandleIndex($handle);
        this.setStepAt(value, index);
    },

    getPosition: function() {
        return this.getPositionAt(0);
    },

    setPosition: function(value) {
        this.setPositionAt(value, 0);
    },

    getStep: function() {
        return this.getStepAt(0);
    },

    setStep: function(value) {
        this.setStepAt(value, 0);
    },

    // Event delegates

    // TODO: Revisit - Method calling a method here.
    _dragDidChange: function($handle, range, position, value) {
        this._dispatchDragUpdate($handle, range, position, value);
    },

    _rangeMarkerDidChange: function($handle, range, markers, direction){
        this._dispatchChange($handle, range, markers, direction);
    },

    _rangeDidChange: function($handle, range, position, value) {
        this._dispatchChange($handle, range, position, value);
    },

    _handleDidReceiveDrag: function(range, responder, e) {
        var $handle, index, delta, value;

        e.preventDefault();

        $handle = responder.$el;
        index   = this._getHandleIndex($handle);

        // touch returns array, mouse returns single value.
        // we can use some slight-of-hand to get the correct value.
        // if deltaX()[0] is undefined then
        // return the value of deltaX() only.
        delta = responder.deltaX()[0] || responder.deltaX();
        value = delta + this._handleOffsets[index];

        var position = range.calculatePositionForValue(value);
        this.setPositionForHandle(position, $handle);
    },

    _handleDidReceiveDragStart: function(range, responder, e) {
        var $handle, index;

        e.preventDefault();

        $handle = responder.$el;
        index = this._getHandleIndex($handle);

        this._handleOffsets[index] = responder.$el.position().left;

        this._dispatchDragStart(
            responder.$el, range, range.getPosition(), range.getValue());
    },

    _handleDidReceiveDragEnd: function(range, responder, e) {
        e.preventDefault();
        this._dispatchDragEnd(
            responder.$el, range, range.getPosition(), range.getValue());
    },

    // Event dispatchers

    _dispatchDragStart: function($handle, range, position, value) {
        this.trigger(dragEvents.DRAG_START, this, $handle, range, position, value);
    },

    _dispatchDragUpdate: function($handle, range, position, value) {
        this.trigger(dragEvents.DRAG_UPDATE, this, $handle, range, position, value);
    },

    _dispatchChange: function($handle, range, position, value) {
        this.trigger(events.CHANGE, this, $handle, range, position, value);
    },

    _dispatchDragEnd: function($handle, range, position, value) {
        this.trigger(dragEvents.DRAG_END, this, $handle, range, position, value);
    }

}); // eof HorizontalSliderControl

module.exports.HorizontalSliderControl = HorizontalSliderControl;

}); // eof define
