define(function(require, exports, module){

// Imports
var _                = require('underscore');

// Module

var KeyInputManager = function(keyMap){

    this.responder = null;

    var defaultKeyMap = {
        40: 'moveDown',        // down
        38: 'moveUp',          // up
        39: 'moveRight',       // right
        37: 'moveLeft',        // left
        27: 'cancelOperation', // escape
        13: 'insertNewline',   // return
         9: 'insertTab',       // tab
         8: 'deleteBackward'   // delete (OS X)
    };

    if (!keyMap){
        this.keyMap = defaultKeyMap;
    } else this.keyMap = keyMap;

};

KeyInputManager.prototype.interpretKeyEvents = function(responder, events){
    _.each(events, _.bind(function(e){
        var action = this.keyMap[e.keyCode] || false;

        if(action){
            responder.executeCommandByName(action, e);
        } else {
            responder.insertText(this.responder, e);
        }

    }, this));
};

// Exports

module.exports.KeyInputManager = KeyInputManager;

}); // eof define
