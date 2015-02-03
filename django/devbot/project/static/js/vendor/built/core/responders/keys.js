/**
 * Responders - Keys
 * @module built.core.responders.keys
 */
define(function(require, exports, module){

// Imports

var _                    = require('underscore');
var marionette           = require('marionette');
var KeyInputManager      = require('built/core/managers/key-input').KeyInputManager;
var KeyEquivalentManager = require('built/core/managers/key-equivalent').KeyEquivalentManager;
var helpers              = require('built/core/utils/helpers');

// Module

var KeyResponder = marionette.Controller.extend(
/** @lends built.core.responders.keys.KeyResponder.prototype */
{
    el: null,
    inputManager: null,
    equivalentManager: null,

    /**
     * Creates a new KeyResponder
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(options){
        marionette.Controller.prototype.constructor.apply(this, arguments);
        this.listenTo(this, 'destroy', this.deinit);


        _.extend(this, options);
        _.bindAll(this, '_keyDown', '_keyUp');

        if(this.el){
            this.$el = helpers.registerElement(this.el);
            this.$el.on('keydown.built.responders.keys', {ctx: this}, this._keyDown);
            this.$el.on('keyup.built.responders.keys', {ctx: this}, this._keyUp);
        }

        if (!this.inputManager){
            this.inputManager = new KeyInputManager();
        }

        if (!this.equivalentManager){
            this.equivalentManager = new KeyEquivalentManager();
            this.equivalentManager.responder = this;
        }

        this.inputManager.responder = this;
    },


    _keyDown: function(e){
        this.keyDown(this, e);
    },

    _keyUp: function(e){
        this.keyUp(this, e);
    },

    performKeyEquivalent: function(e){
        return this.equivalentManager.performKeyEquivalent(this, e);
    },

    keyUp: function(responder, e){
        // noop
    },

    keyDown: function(responder, e){
        this.interpretKeyEvents([e]);
        return true;
    },

    insertNewline: function(responder, e){
        // noop
    },

    insertTab: function(responder, e){
        // noop
    },

    deleteBackward: function(responder, e){
        // noop
    },

    cancelOperation: function(responder, e){
        // noop
    },

    moveUp: function(responder, e){
        // noop
    },

    moveDown: function(responder, e){
        // noop
    },

    moveLeft: function(responder, e){
        // noop
    },

    moveRight: function(responder, e){
        // noop
    },

    insertText: function(responder, e){
        // noop
    },

    registerKeyEquivalentWithString: function(string, action){
        if (!this.equivalentManager){
            throw new Error(
                'KeyEquivalentManager not set. ' +
                'Did you initialize the KeyResponder ' +
                'with acceptKeyEquivalent?');
        }
        this.equivalentManager.registerWithString(string, action);
    },

    registerKeyEquivalent: function(mask, char, action){
        if (!this.equivalentManager){
            throw new Error(
                'KeyEquivalentManager not set. ' +
                'Did you initialize the KeyResponder ' +
                'with acceptKeyEquivalent?');
        }

        this.equivalentManager.register(mask, char, action);
    },

    interpretKeyEvents: function (events){
        if(!_.isArray(events)) events = [events];
        this.inputManager.interpretKeyEvents(this, events);
    },

    executeCommandByName: function(name, e){
        try {
            this[name](this, e);
        } catch (err) {
            // noop
        }
    },

    deinit: function(){
        this.inputManager = null;
        this.equivalentManager = null;

        if(this.$el){
            this.$el.off('keydown.built.responders.keys', this._keyDown);
            this.$el.off('keyup.built.responders.keys', this._keyUp);
        }
    }

});

// Exports

exports.KeyResponder = KeyResponder;

});
