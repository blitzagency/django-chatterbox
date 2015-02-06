define(function(require, exports, module) {

var marionette = require('marionette');
var modals = require('built/app/modals');

var template = require('hbs!app/sample/templates/modal');

var MyModalView = marionette.ItemView.extend({
    template: template,
    className: 'my-modal-view',

    ui: {
        close: '.js-close'
    },

    events:{
        'click .actions .btn.close': 'wantsCloseModal'
    },

    getData: function(){
        /* ..note:
            Required Method
            Enables you to pass any information from this
            modal view to the thing that cares about it.
        */
        return {foo: 'foo', bar: 'bar'};
    },

    wantsCloseModal: function(){
        this.trigger(modals.events.COMPLETE);
    }
});

exports.MyModalView = MyModalView;

});