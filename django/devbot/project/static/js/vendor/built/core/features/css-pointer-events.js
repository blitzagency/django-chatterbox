/**
 * CFeature Detection - CSS Pointer Events
 * @module built.core.features.css-pointer-events
 */
define(function(require, exports, module){


/**
 * tests if pointer events are supported
 *
 * @function
 * @memberOf built.core.features.css-pointer-events
 * @return {Boolean}    if pointer events are supported or not
 *
 */
function supported(){
    var element = document.createElement('x');
    element.style.cssText = 'pointer-events:auto';
    return element.style.pointerEvents === 'auto';
}

// Exports
exports.supported = supported;

});
