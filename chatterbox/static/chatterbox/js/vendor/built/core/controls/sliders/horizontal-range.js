/**
 * Drag and Drop List Controller
 * @module built.core.controls.sliders.horizontal-range
 */
define(function(require, exports, module) {

var HorizontalSliderControl = require('built/core/controls/sliders/horizontal').HorizontalSliderControl;
var normalizeInt = require('built/core/utils/helpers').normalizeInt;
var composeAll = require('built/core/utils/helpers').composeAll;

var HorizontalRangeSliderControl =  HorizontalSliderControl.extend(
/** @lends built.core.controls.sliders.horizontal-range.HorizontalRangeSliderControl.prototype */
{

    /**
     * Creates a new HorizontalRangeSliderControl
     *
     * see :ref:`built.core.controls.slider.horizontal`
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options) {
        HorizontalSliderControl.prototype.constructor.apply(this, arguments);
    },

    // HorizontalSliderControl overrides

    setPositionAt: function(value, index) {
        value = this._restrictRangePositions(value, index);
        this.constructor.__super__.setPositionAt.call(this, value, index);
    },

    compose: function(container) {
        composeAll(
            container,
            this,
            'getRanges'
        );

        this.constructor.__super__.compose.call(this, container);
    },

    // Helper methods

    _restrictRangePositions: function(value, index) {
        var positions, min, max, result;

        if(this.options.snap && this.options.steps){

            positions = this.getSteps();

            min = positions[index - 1] || 0;
            max = positions[index + 1] || (this.options.steps - 1);

            var step = this.stepForPosition(value);

            result = normalizeInt(step, min, max);
            return this.positionForStep(result);
        }

        positions = this.getPositions();
        min = positions[index - 1] || 0;
        max = positions[index + 1] || 1;

        result = normalizeInt(value, min, max);

        return result;
    },

    // Public Methods
    // TODO: Revisit - Make this api more useful.

    getRanges: function() {
        var positions, i, len, results, p1, p2;

        positions = this.getPositions();
        i = 0;
        len = positions.length;
        results = [];

        // not using _.map here because for loop was more clear / convenient
        for(i; i < len; i++) {
            p1 = positions[i];
            p2 = positions[i + 1];

            // skip any range that does not have a second value
            // this is usually the right most range / handle
            if(typeof p2 === 'undefined') {
                continue;
            }

            results.push(Math.abs(p2 - p1));
        }

        return results;
    }

}); // eof HorizontalRangeSliderControl

module.exports.HorizontalRangeSliderControl = HorizontalRangeSliderControl;

}); // eof define
