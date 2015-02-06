/**
 * Utility functions for activity monitor presentation
 * @module built.app.activity.activity
 */
define(function(require, exports, module) {

var vent = require('built/app/vent').vent;
var events = require('./events');
var count = 0;


/**
 * called to trigger activity monitor to be presented
 * should be called every time you want to display indicator
 * @function
 * @memberOf built.app.activity.activity
 */
function presentNetworkActivityIndicator(){
    count++;
    vent.trigger(events.PRESENT);
}

/**
 * called to trigger dismissal of the activity monitor
 * @function
 * @memberOf built.app.activity.activity
 */
function dismissNetworkActivityIndicator(){
    count--;

    if(count <= 0){
        count = 0;
        vent.trigger(events.DISMISS);
    }
}

exports.presentNetworkActivityIndicator = presentNetworkActivityIndicator;
exports.dismissNetworkActivityIndicator = dismissNetworkActivityIndicator;

});

