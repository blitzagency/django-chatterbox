/**
 * Drag and Drop Utilities
 * @module built.core.utils.dndutils
 */
define(function(require, exports, module){

var _ = require('underscore');
var cssPointer = require('built/core/features/css-pointer-events');

// IE (as on 11.0) only supports passing 'Text' as the
// dataType when a dragging operation starts. This is problematic
// as HTML5 DnD relies on knowing the dataType in order to determine
// if a specific drop zone will accept the drop. Since
// we assume there can only be one dragging candidate operation
// at a time, for IE based browsers (9,10,11) this variable will
// hold the dataType of the information we are moving.
// This will fail if multiple dragging candidates are running at the
// same time.
var IEOnlyDataTransferDataType = null;

/**
 * utility command used to supress child pointer events
 *
 * .. note ::
 *     http://jsfiddle.net/theodorejb/j2fDt/9/
 *
 * @function
 * @memberOf built.core.utils.dndutils
 * @param  {$element} $el Jquery Element
 * @return {$element}       returns the passed in jquery selector for chaining
 *
 */
function supressChildPointerEvents($el){


    var targets = [];

    if (cssPointer.supported()){
        $el.find('*').css({'pointer-events': 'none'});
        targets = $el;

    } else {
        $el.add($el.find('*'));
        targets = $el;
    }

    _.each(targets, function(each){
        $target = $(each);
        $target.on('dragenter.built.responders.drop', _supressEventHandler);
        $target.on('dragleave.built.responders.drop', _supressEventHandler);

    });

    return $el;
}

/**
 * utility command used to clear the supression of child pointer events
 *
 * @function
 * @memberOf built.core.utils.dndutils
 * @param  {$element} $el Jquery Element
 * @return {$element}       returns the passed in jquery selector for chaining
 *
 */
function clearSupressedPointerEvents($el){

    if (cssPointer.supported()){
        $el.find('*').css({'pointer-events': 'all'});
        targets = $el;

    } else {
        $el.add($el.find('*'));
        targets = $el;
    }

    _.each(targets, function(each){
        $target = $(each);
        $target.off('dragenter.built.responders.drop', _supressEventHandler);
        $target.off('dragleave.built.responders.drop', _supressEventHandler);

    });

    return $el;
}

function _supressEventHandler(e){

    if(!e) var e = window.event;

    // e.cancelBubble is supported by IE8 -
    // this will kill the bubbling process.
    e.cancelBubble = true;
    e.returnValue = false;

    // e.stopPropagation works in modern browsers
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
}

// Exports

exports.supressChildPointerEvents = supressChildPointerEvents;
exports.clearSupressedPointerEvents = clearSupressedPointerEvents;
exports.IEOnlyDataTransferDataType = IEOnlyDataTransferDataType;
});

