/**
 * Modal View
 * @module built.app.modals.views.modal
 */
define(function(require, exports, module) {

var marionette = require('marionette');
var events = require('../events');

// This requires that built/app/patches/render
// has been applied as there is no template

require('built/app/patches/render');

var ModalView = marionette.ItemView.extend(
/** @lends built.app.modals.views.modal.ModalView.prototype */
{
    className: 'view',
    childView: null,

    /**
     * Creates a new ModalView
     *
     * @constructs
     * @extends marionette.ItemView
     * @param {object} [options] Options for Initialization
     *
     */
    initialize: function(options){
        this.view = options.childView;
    },

    onShow: function(){
        this.view.setElement(this.$el, true);
        this.view.render();
        this.view.once(events.COMPLETE, this.modalComplete, this);
    },

    modalComplete: function(){
        this._data = this.view.getData();
        this.trigger(events.COMPLETE, this);
    },

    getData: function(){
        return this._data;
    },

    onDestroy: function(){
        this.view.destroy();
    }
});

exports.ModalView = ModalView;

});


