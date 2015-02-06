define(function (require, exports, module) {

var InputSelectComposite = require('./input-select').InputSelectComposite;
var Scroller             = require('built/core/controls/page/scroller').Scroller;
var focus                = require('built/core/events/focus');
var data                 = require('built/core/events/data');

var InputSelectScrollableComposite =  InputSelectComposite.extend({
    initialize : function(){

    },

    onShow : function(){
        InputSelectComposite.prototype.onShow.apply(this, arguments);
        _.bindAll(this,'_onMouseMove');

        this.scroller = new Scroller({
            el             : this.$el.find(this.itemViewContainer),
            scrollDebounce : 0,
            duration       : 300
        });

        this.listenTo(this.inputSelect, focus.FOCUS_KEY, this.onInputFocusChange);

    },

    onInputFocusChange: function(input, $el){
        this.scroller.scrollToElement($el);
        this.inputSelect.mouseResponder.enableEnterExit(false);
        this._mouseX = null;
        this._mouseY = null;
        $(window).on('mousemove', this._onMouseMove);
    },

    _onMouseMove: function(e){
        var hasMouseX                = !_.isNull(this._mouseX);
        var hasMouseY                = !_.isNull(this._mouseY);
        var hasPreviousMousePosition = hasMouseX && hasMouseY;
        var mouseXMoved              = hasPreviousMousePosition && (this._mouseX != e.pageX);
        var mouseYMoved              = hasPreviousMousePosition && (this._mouseY != e.pageY);
        this._mouseX = e.pageX;
        this._mouseY = e.pageY;

        if(mouseXMoved || mouseYMoved){
            $(window).off('mousemove', this._onMouseMove);
            this.inputSelect.mouseResponder.enableEnterExit(true);
        }

    },

    onCollectionSync: function(){
        InputSelectComposite.prototype.onCollectionSync.apply(this, arguments);
        this.scroller.calculateMaxScroll();
    },

    cleanup: function(){
        $(window).off('mousemove', this._onMouseMove);
        InputSelectComposite.prototype.cleanup.call(this);
    }
});

exports.InputSelectScrollableComposite = InputSelectScrollableComposite;

});
