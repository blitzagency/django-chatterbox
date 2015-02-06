/**
 * Horizontal Range Slider View
 * @module built.ui.views.item.horizontal-range-slider
 */
define(function (require, exports, module) {

var SliderView = require('built/ui/views/item/slider').SliderView;
var HorizontalRangeSliderControl = require('built/core/controls/sliders/horizontal-range').HorizontalRangeSliderControl;

var HorizontalRangeSliderView =  SliderView.extend(
/** @lends built.ui.views.item.horizontal-range-slider.HorizontalRangeSliderView.prototype */
{

    /**
     * Creates a new HorizontalRangeSliderView
     *
     * @constructs
     * @extends SliderView
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(){
        SliderView.prototype.constructor.apply(this, arguments)
    },

    getDriver: function(options){
        return new HorizontalRangeSliderControl(options);
    }
});

exports.HorizontalRangeSliderView = HorizontalRangeSliderView;

});


