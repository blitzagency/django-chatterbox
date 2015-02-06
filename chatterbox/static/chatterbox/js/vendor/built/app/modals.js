define(function(require, exports, module) {

var modals = require('./modals/modals');

exports.events = require('./modals/events');
exports.presentModal = modals.presentModal;
exports.dismissModal = modals.dismissModal;
exports.nextModal = modals.nextModal;
exports.getCurrentModal = modals.getCurrentModal;
});
