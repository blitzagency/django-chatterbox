/**
 * Managers - Range
 * @module built.core.managers.range
 */
define(function(require, exports, module){

// Imports

var _          = require('underscore');
var marionette = require('marionette');
var helpers    = require('built/core/utils/helpers');
var events     = require('built/core/events/event');

// Module

var RangeManager = marionette.Controller.extend(
/** @lends built.core.managers.range.RangeManager.prototype */
{

    _defaults: null,
    _range   : null,
    _position: 0,

    // associated marker values
    _prevPosition: null,
    _markers: null,
    _lastDispatched: null,

     /**
     * Creates a new RangeManager
     *
     * @example
     * rangeManager = new RangeManager(
     *     {
     *         min: 0, // default 0
     *         max: 1, // default 1
     *     }
     * );
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options) {
        marionette.Controller.prototype.constructor.apply(this, arguments);

        this.options = options || {};
        _.defaults(this.options, this._getDefaults());

        this._markers         = [];
        this._lastDispatched  = [];

        // Calculate computed properties
        this._computeRange();
    },

    // Override / extend this return value to add additional options
    _getDefaults: function() {
        return {
            min: 0,
            max: 1
        };
    },

    // Internal computed properties

    _computeRange: function() {
        this._range = Math.abs(this.getMax() - this.getMin());
    },

    // Internal methods

    _getNormalizedPosition: function(val){
        return this.roundPosition(helpers.normalizeInt(val, 0, 1));
    },

    roundPosition: function(position){
        return Math.round(position * 10000) / 10000;
    },

    _checkMarkers: function(prevPosition, position) {
        var reached, iterator, direction, inBetween;

        function incremental(marker, i, markers) {
            inBetween = marker > prevPosition && marker <= position;
            if(inBetween) {
                reached.push(marker);
            }
        }

        function decremental(marker, i, markers) {
            inBetween = marker < prevPosition && marker >= position;
            if(inBetween) {
                reached.push(marker);
            }
        }

        // modified by iterator functions above
        reached   = [];
        direction = (prevPosition < position) ? 'incremental' : 'decremental';
        iterator  = direction == 'incremental' ? incremental : decremental;

        // loop over markers to see if we've passed any
        _.each(this._markers, iterator, this);

        // if reached has items, dispatch marker event
        if(reached.length > 0) {
            this._dispatchMarker(reached, direction);
            this._lastDispatched = reached;
        }
    },

    // 'Public' methods

    /**
     * Calculates a range position for a literal range value between min and max.
     * @param  {number} val a value between min and max
     * @return {number}     a position from 0 - 1 based on the provided value.
     *
     * @note
     * This will not set any value internally, retrives a possible value only.
     */
    calculatePositionForValue: function(val){
        var position = val / this.getRange();
        return this._getNormalizedPosition(position);
    },

    /**
     * Calculates a literal range value for range position.
     * @param  {number} val a value from 0 - 1
     * @return {number}     the value for the position provided.
     *
     * @note
     * This will not set any value internally, retreives a possible value only.
     */
    calculateValueForPosition: function(val){
        position = this._getNormalizedPosition(val);
        return Math.round(this.getRange() * position);
    },

    getPreviousPosition: function(){
        return this._prevPosition;
    },

    getPosition: function() {
        return this._position;
    },

    setPosition: function(val) {
        val = this._getNormalizedPosition(val);

        if(val != this._position) {
            this._prevPosition = this._position;
            this._position = val;
            this._checkMarkers(this._prevPosition, this._position);

            this._dispatchChange();
        }
    },

    setValue: function(val){
        var position = this.calculatePositionForValue(val);
        this.setPosition(position);
    },

    getValue: function(){
        return this.calculateValueForPosition(this.getPosition());
    },

    getMin: function() {
        return this.options.min;
    },

    setMin: function(val) {
        if(val > this.options.max){
            throw 'Min cannot be greater than max!';
        }

        if(val != this.options.min) {
            this.options.min = val;
            this._computeRange();
            this._dispatchChange();
        }
    },

    getMax: function() {
        return this.options.max;
    },

    setMax: function(val) {
        if(val < this.options.min) {
            throw 'Max cannot be less than min!';
        }

        if(val != this.getMax()) {
            this.options.max = val;
            this._computeRange();
            this._dispatchChange();
        }
    },

    getRange: function() {
        return this._range;
    },

    setRange: function(min, max) {
        this.setMin(min);
        this.setMax(max);
    },

    // associated marker methods

    getMarkers: function() {
        // return (shallow) copy of markers
        return this._markers.slice();
    },

    /**
     * add positions (values between 0 and 1) to the markers array
     * @param {arguments} __args__ position arguments
     *
     * @usage addMarkerPositions([*positions])
     * @example addMerkerPositions(0.1, 0.2, 0.3)
     */
    addMarkerPositions: function(__args__) {
        // __args__ is there to denote that this function takes 'arguments'
        // if you're familiar with python it's inspired by *args.
        // unfortunately, * is not a legal character for function args in js.
        // I added it to make the signature more explicit
        var sorted;

        function iterator(position, i, list) {
            this._markers.push(this._getNormalizedPosition(position));
        }

        sorted = true;

        // add positions to this._markers
        _.each(arguments, iterator, this);

        this._markers.sort(helpers.sortArrayAscending);
        this._markers = _.uniq(this._markers, sorted);

        return this.getMarkers();
    },

    removeMarkerPositions: function(__args__) {
        var markerIndex;

        function iterator(arg, i, list) {
            markerIndex = _.indexOf(this._markers, arg);

            if(markerIndex == -1) {
                return;
            }

            this._markers.splice(markerIndex, 1);
        }

        // attempt removal of requested positions
        // non-existing positions are ignored
        _.each(arguments, iterator, this);

        return this.getMarkers();
    },

    addMarkerValues: function(__args__) {
        var positions;

        positions = _.map(
            arguments,
            this.calculatePositionForValue,
            this
        );

        return this.addMarkerPositions.apply(this, positions);
    },

    removeMarkerValues: function(__args__) {
        var positions;

        positions = _.map(
            arguments,
            this.calculatePositionForValue,
            this
        );

        return this.removeMarkerPositions.apply(this, positions);
    },

    // Event Dispatchers

    _dispatchChange: function() {
        this.trigger(events.CHANGE, this, this.getPosition(), this.getValue());
    },

    _dispatchMarker: function(markers, direction) {
        this.trigger(events.MARKER, this, markers, direction);
    }

}); // eof RangeManager

// Exports
module.exports.RangeManager = RangeManager;

}); // eof define
