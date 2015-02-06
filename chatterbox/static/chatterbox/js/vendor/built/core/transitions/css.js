/**
 * CSS Transitions
 * @module built.core.transitions.css
 */
define(function(require, exports, module){
    var _ = require('underscore');
    var Modernizr = require('modernizr');

    /**
     * Add a css transition to an element
     *
     * @function
     * @memberOf built.core.transitions.css
     * @param  {Element} $el jquery Element
     * @param  {String} animationClass css class to animate
     * @return {$.Promise}
     *
     */
    function cssTransition($el, transitionClass){


        var transitionEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
            'MozTransition'    : 'transitionend',      // only for FF < 15
            'transition'       : 'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
        };

        var transitionEndEvent = transitionEndEventNames[Modernizr.prefixed('transition')];
        return _applyStyle($el, transitionClass, transitionEndEvent);
    }

    /**
     * add a css animation to an element
     *
     * @function
     * @memberOf built.core.transitions.css
     * @param  {Element} $el jquery Element
     * @param  {String} animationClass css class to animate
     * @return {$.Promise}
     *
     */
    function cssAnimation($el, animationClass){
        var animationEndEventNames = {
            'WebkitAnimation' : 'webkitAnimationEnd',// Saf 6, Android Browser
            'MozAnimation'    : 'animationend',      // only for FF < 15
            'animation'       : 'animationend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
        };

        var animationEndEvent = animationEndEventNames[Modernizr.prefixed('animation')];
        return _applyStyle($el, animationClass, animationEndEvent);
    }

    function _applyStyle($el, cssClass, endEvent){
        var deferred = $.Deferred();

        $el.addClass(cssClass)
           .on(endEvent, function(){
                deferred.resolve();
           });

        return deferred.promise();
    }

    module.exports.cssTransition = cssTransition;
    module.exports.cssAnimation = cssAnimation;
});

// var cssomPrefixes = 'Webkit Moz O ms'.split(' ');
// var domPrefixes = 'Webkit Moz O ms'.toLowerCase().split(' ');


// var transEndEventNames = {
//   //         'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
//   //         'MozTransition'    : 'transitionend',      // only for FF < 15
//   //         'transition'       : 'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
//   //     },

// transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

// define([
//     'vendor/marionette',
//     'vendor/underscore'
// ],
// function(Marionette, _){

//     return Marionette.Controller.extend({
//         transitionIn: 'panel-move-from-right',
//         trasitionOut: 'panel-move-to-left',
//         animationEndEvent: 'webkitAnimationEnd',
//         isAnimating: false,
//         currentClass: 'current',

//         initialize: function(options){
//             _.extend(this, options);
//             _.bindAll(this, 'transitionOutComplete', 'transitionInComplete');
//         },

//         transition: function(from, to){
//             isAnimating = true;

//             from.$el
//             .addClass(this.trasitionOut)
//             .on(this.animationEndEvent, {obj: from}, this.transitionOutComplete);

//             to.$el
//             .addClass(this.currentClass)
//             .addClass(this.transitionIn)
//             .on(this.animationEndEvent, {obj: to}, this.transitionInComplete);
//         },

//         transitionOutComplete: function(e){
//             var obj = e.data.obj.$el;
//             obj.off(this.animationEndEvent)
//             .removeClass(this.currentClass)
//             .removeClass(this.trasitionOut);
//         },

//         transitionInComplete: function(e){
//             var obj = e.data.obj.$el;
//             obj.off(this.animationEndEvent)
//             .removeClass(this.transitionIn);

//             this.isAnimating = false;
//         }
//     });
// });

