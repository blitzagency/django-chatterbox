/**
 * Modal Helpers
 * @module built.app.modals.views.modals
 */
define(function(require, exports, module) {

var vent = require('built/app/vent').vent;
var ModalView = require('./views/modal').ModalView;
var events = require('./events');

var currentModal = null;
var queue = [];

/**
 * Get the current Modal View
 *
 * @function
 * @memberOf built.app.modals.views.modals
 *
 */
function getCurrentModal(){
    return currentModal;
}

/**
 * Dismiss the current Modal
 *
 * @function
 * @memberOf built.app.modals.views.modals
 *
 */
function dismissModal(){
    vent.trigger(events.DISMISS, currentModal);
}

/**
 * Present a modal
 *
 * @function
 * @memberOf built.app.modals.views.modals
 *
 * @param  {View} view Any Marionette based view
 */
function presentModal(view){

    var deferred = $.Deferred();

    var modalView = new ModalView({childView: view});
    queue.push(modalView);

    modalView.once(events.COMPLETE, function(){
        deferred.resolve(modalView);
    });

    if(queue.length === 1){
        _triggerModal(modalView);
    }

    return deferred.promise();
}


function _triggerModal(modalView){
    currentModal = modalView;
    vent.trigger(events.PRESENT, currentModal);
}

/**
 * Move to the next modal view in the queue
 *
 * @function
 * @memberOf built.app.modals.views.modals
 *
 */
function nextModal(){

    if(queue.length > 0) {
        queue.shift();
        currentModal = null;
    }

    if(queue.length === 0) return;
    _triggerModal(queue[0]);
}


exports.presentModal = presentModal;
exports.dismissModal = dismissModal;
exports.nextModal = nextModal;
exports.getCurrentModal = getCurrentModal;
});
