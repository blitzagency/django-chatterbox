
/**
 * Keyboard handlers for an application
 *
 * .. note ::
 *      An optional dependency on built/app/modals
 *      if you wish to have the application key manager
 *      work in concert with built/app/modals, pass the modal
 *      module into the initialize options
 *      {modals: theModule}
 *
 * @module built.app.keys
 */
define(function(require, exports, module) {

var _ = require('underscore');
var marionette = require('marionette');
var KeyResponder = require('built/core/responders/keys').KeyResponder;
var ArrayManager = require('built/core/managers/array').ArrayManager;


var modals = null;

var _responderChain = new ArrayManager();
var _keyResponder;


/**
 * Returns the current key for a keyboard event passed
 *
 * @function
 * @memberOf built.app.keys
 * @param  {Event} e Keyboard event
 * @return {String}       the string value representing that key
 *
 */
function getKeyFromEvent(e){
    var key = String.fromCharCode(e.which);
    if(!e.shiftKey) key = key.toLowerCase();

    return key;
}


function _removeFromResponderChain(view){
    var array = _responderChain.getArray();
    var index = array.indexOf(view);
    if(index == -1) return;

     _responderChain.removeObjectAt(index);
}

/**
 * Registers a given marionette view in the responder chain
 *
 * @function
 * @memberOf built.app.keys
 * @param  {View} view Marionette view
 *
 */
function registerInResponderChain(view){
    if (view.once){
        view.once('destroy', function(){
            _removeFromResponderChain(view);
        });
    }

    _responderChain.insertObject(view);
}

/**
 * initializes the key responder
 *
 * @function
 * @memberOf built.app.keys
 * @param {object} [options] Options for Initialization
 * @return {Date}       the first day of the month passed in
 *
 */
function initialize(options){
    options = options || {};
    modals = options.modals || null;

    _keyResponder = new KeyResponder({
        el: $(window),
        keyDown: _processKeys,
    });
}

function _processKeys(sender, e){

    var result;
    var chain;

    // if a modal is present, it consumes all
    // so the buck stops there.
    if (_processModal(e)) return;

    chain = _responderChain.getArray().slice().reverse();

    // First we ask, who in the chain
    // would like to performKeyEquivalent?
    // We don't just send the event in something like
    // a "performKeyAction" we specifically use KeyEquivalent
    // first, because someone in the chain could respond to
    // just the 'enter' for example and the key that was
    // sent was command + shift + enter. In that case
    // if the person that responds to just 'enter' happens
    // to exist first in the chain traversal, we would never
    // get to view in the chain that handles KeyEquivalent.
    // In other words, KeyEquivalent are the most important
    // followed by regular keys.
    //
    // performKeyEquivalent and keyDown idioms come directly
    // from Cocoa key event handling.
    //
    // https://developer.apple.com/librarY/mac/documentation/Cocoa/Conceptual/EventOverview/HandlingKeyEvents/HandlingKeyEvents.html#//apple_ref/doc/uid/10000060i-CH7-SW1
    //
    // result here will be the childView that handeled this
    // event.

    result = _.find(chain, function(item){
        if(item.performKeyEquivalent){
            // returns true to stop the chain
            // returns false to keep things moving.
            return item.performKeyEquivalent(e);
        }
    });

    if(result){
        _completeEvent(e);
        return;
    }

    // No one in the chain wanted to handle the KeyEquivalent
    // lets ask them if they would like to handle the plain
    // key event:

    result = _.find(chain, function(item){
        if(item.keyDown){
            // returns true to stop the chain
            // returns false to keep things moving.
            return item.keyDown(e);
        }
    });

    if(result) {
        _completeEvent(e);
        return;
    }
}

function _processModal(e){

    // a modal is present, so lets ask that first
    // then bail if nothing
    if(!modals) return;

    var currentModal = modals.getCurrentModal();
    var result;

    if(currentModal){
        var view = currentModal.view;

        if(view.performKeyEquivalent){
            // returns true to stop the chain
            // returns false to keep things moving.
            if (view.performKeyEquivalent(e)){
                _completeEvent(e);
                return;
            }
        }

        if(view.keyDown){
            // returns true to stop the chain
            // returns false to keep things moving.
            view.keyDown(e);
        }

        return true;
    }

    return false;
}

function _completeEvent(e){
    e.preventDefault();
    e.stopImmediatePropagation();
}

exports.initialize = initialize;
exports.getKeyFromEvent = getKeyFromEvent;
exports.registerInResponderChain = registerInResponderChain;
});

