define(function(require, exports, module) {

var activity = require('./activity/activity');

exports.events = require('./activity/events');
exports.presentNetworkActivityIndicator = activity.presentNetworkActivityIndicator;
exports.dismissNetworkActivityIndicator = activity.dismissNetworkActivityIndicator;

});


