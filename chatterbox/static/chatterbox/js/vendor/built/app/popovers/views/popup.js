/**
 * Popup View
 * @module built.app.popovers.views.popup
 */
define(function(require, exports, module) {

var PopView = require('./pop').PopView;

var PopupView = PopView.extend(
/** @lends built.app.popovers.views.popup.PopupView.prototype */
{
    defaultEdge: 'top',

    /**
     * Creates a new PopupView
     *
     * @constructs
     * @extends marionette.View
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(){
        marionette.View.prototype.constructor.apply(this, arguments);
    },

    anchorBottom: function(anchorRect, $anchorElement, viewRect, css){
        this.anchorTop(anchorRect, $anchorElement, viewRect, css);
    },

    anchorTop: function(anchorRect, $anchorElement, viewRect, css){

        var left = Math.max(0, anchorRect.x - 10); // -10 is for looks
        var top;

        if($anchorElement){
            // make sure we are not above the top
            // of the viewable area
            top = ((anchorRect.y -3) > 0) ? -3 : 0;

        } else {
            top = Math.max(0, anchorRect.y - 3); // -3 is for looks
            top = Math.max(2, top); // 2 is just so it's not flush against the edge
        }

        left = Math.max(2, left); // 2 is just so it's not flush against the edge

        css.top = top;
        css.left = left;
    }
});

exports.PopupView = PopupView;

});


