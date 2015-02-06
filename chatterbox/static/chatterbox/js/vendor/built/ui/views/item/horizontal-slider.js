/**
 * Horizontal Slider View
 * @module built.ui.views.item.horizontal-slider
 */
define(function (require, exports, module) {

var SliderView = require('built/ui/views/item/slider').SliderView;
var HorizontalSliderControl = require('built/core/controls/sliders/horizontal').HorizontalSliderControl;

var HorizontalSliderView =  SliderView.extend(
/** @lends built.ui.views.item.horizontal-slider.HorizontalSliderView.prototype */
{
    /**
     * Creates a new HorizontalSliderView
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
        return new HorizontalSliderControl(options);
    }
});

exports.HorizontalSliderView = HorizontalSliderView;

});


