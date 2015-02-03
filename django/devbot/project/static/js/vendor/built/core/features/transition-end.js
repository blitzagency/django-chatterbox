/**
 * Feature Detection - Transitions
 * @module built.core.features.transition-end
 */
define(function(require, exports, module){


/**
 * tests if transition-end events are supported
 *
 * .. note ::
 *     No credit here, see :
 *     http://www.modernizr.com/
 *
 * @function
 * @memberOf built.core.features.transition-end
 * @return {Boolean}    if transition-end events are supported or not
 *
 */
function supported(){

    var element = document.createElement('built');

    var transitionEndEventNames = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'OTransition'      : 'oTransitionEnd otransitionend',
        'transition'       : 'transitionend',
    };

    for (var name in transitionEndEventNames) {
        if (element.style[name] !== undefined) {
            return transitionEndEventNames[name];
        }
    }

    return false;
}

// Exports
exports.supported = supported;

});
