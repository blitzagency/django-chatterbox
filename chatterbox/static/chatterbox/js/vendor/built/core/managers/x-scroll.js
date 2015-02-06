/**
 * Scroll Manager (wrapper for scroll magic)
 * @module built.core.managers.scroll
 */
define(function (require, exports, module) {

var marionette = require('marionette');
var _ = require('underscore');
require('jquery/jquery.scrollmagic');


var ScrollManager = marionette.Controller.extend(
/** @lends built.core.managers.scroll.ScrollManager.prototype */
{
    /**
     * Creates a new ScrollManager
     *
     * .. note ::
     *     http://janpaepke.github.io/ScrollMagic/docs/ScrollScene.html
     *
     * @constructs
     * @extends marionette.Controller
     * @param {object} [options] Options for Initialization
     *
     */
    constructor : function(options){

        options = options || {};
        var defaults = {};

        if(options){
            if(options.$el)
                defaults.container = options.$el;

            if(options.tickDriver)
                defaults.tickDriver = options.tickDriver;
        }

        this._markers = {};
        this._controller = new ScrollMagic(defaults);
        marionette.Controller.prototype.constructor.apply(this, arguments);
    },

    addMarker: function(options){
        var trigger = options.trigger;
        options = _.omit(options, 'trigger');

        // TODO do some work here w/ trigger
        options.triggerElement = trigger;

        var scene = new ScrollScene(options).addTo(this._controller);
        var sceneId = _.uniqueId();

        this._markers[sceneId] = scene;
        return sceneId;
    },

    onDestroy: function(){
        _.each(this._markers, function(marker, key){
            marker.destroy();
            delete this._markers[key];
        }, this);
    },

    _getMarker: function(sceneId){
        return this._markers[sceneId];
    },

    duration: function(target, duration){
        var m = this._getMarker(target);
        if(duration){
            m.duration(duration);
        }else{
            return m.duration();
        }
    },

    enabled: function(target, bool){
        var m = this._getMarker(target);
        if(_.isBoolean(bool)){
            m.enabled(bool);
        }else{
            return m.enabled();
        }
    },

    loglevel: function(target, lvl){
        var m = this._getMarker(target);
        if(_.isUndefined(lvl)){
            return m.loglevel();
        }else{
            m.loglevel(lvl);
        }
    },

    markerOff: function(target, name, callback){
        var m = this._getMarker(target);
        m.off(name, callback);
    },

    markerOn: function(target, name, callback){
        var m = this._getMarker(target);
        m.on(name, callback);
    },

    markerTrigger: function(target, name, options){
        var m = this._getMarker(target);
        if(options){
            m.trigger(name, options);
        }else{
            m.trigger(name);
        }
    },

    offset: function(target, newOffset){
        var m = this._getMarker(target);
        if(_.isUndefined(newOffset)){
            return m.offset();
        }else{
            m.offset(newOffset);
        }
    },

    progress: function(target, progress){
        var m = this._getMarker(target);
        if(_.isUndefined(progress)){
            return m.progress();
        }else{
            m.progress(progress);
        }
    },

    remove: function(target){
        var m = this._getMarker(target);
        m.remove();
        delete this._markers[target];
    },

    removePin: function(target, bool){
        var m = this._getMarker(target);
        m.removePin(bool);
    },

    removeTween: function(target, reset){
        var m = this._getMarker(target);
        m.removeTween(reset);
    },

    reverse: function(target, bool){
        var m = this._getMarker(target);
        if(_.isUndefined(bool)){
            return m.reverse();
        }else{
            m.reverse(bool);
        }
    },

    scrollOffset: function(target){
        var m = this._getMarker(target);
        return m.scrollOffset();
    },

    setPin: function(target, element, options){
        var m = this._getMarker(target);
        m.setPin(element, options);
    },

    setTween: function(target, tweenObj){
        var m = this._getMarker(target);
        m.setTween(tweenObj);
    },

    state: function(target){
        var m = this._getMarker(target);
        return m.state();
    },

    triggerElement: function(target, newTriggerElement){
        var m = this._getMarker(target);
        if(_.isUndefined(newTriggerElement)){
            return m.triggerElement();
        }else{
            m.triggerElement(newTriggerElement);
        }
    },

    triggerHook: function(target, newTriggerHook){
        var m = this._getMarker(target);
        if(_.isUndefined(newTriggerHook)){
            return m.triggerHook();
        }else{
            m.triggerHook(newTriggerHook);
        }
    },

    triggerOffset: function(target, newTriggerOffset){
        var m = this._getMarker(target);
        if(_.isUndefined(newTriggerOffset)){
            return m.triggerOffset();
        }else{
            m.triggerOffset(newTriggerOffset);
        }
    },

    tweenChanges: function(target, newTweenChanges){
        var m = this._getMarker(target);
        if(_.isUndefined(newTweenChanges)){
            return m.tweenChanges();
        }else{
            m.tweenChanges(newTweenChanges);
        }
    },

    update: function(target, immediately){
        var m = this._getMarker(target);
        if(_.isUndefined(immediately)){
            m.update();
        }else{
            m.update(immediately);
        }
    }


});

exports.ScrollManager = ScrollManager;

});
