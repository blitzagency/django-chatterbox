/**
 * General Helpers
 * @module built.core.utils.helpers
 */
define(function(require, exports, module){

// Imports

var _ = require('underscore');
var getElement = require('built/ui/helpers/dom').getElement;


function _MSIEVersion()
// http://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx#DetectFtr
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
    var rv = -1; // Return value assumes failure.

    var ua = navigator.userAgent;

    // IE 11: Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko
    // IE 10: Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)
    // IE 9:  Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)
    // IE 8:  Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)
    var re11 = new RegExp('rv: ?([0-9]{1,}[\.0-9]{0,})');
    var re  = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');

    if (re11.exec(ua) !== null)
        rv = parseFloat( RegExp.$1 );
    else if (re.exec(ua) !== null)
        rv = parseFloat( RegExp.$1 );

  return rv;
}

// Helper functions
/**
 * #TODO add description
 *
 * @function
 * @memberOf built.core.utils.helpers
 * @return {$element}       jquery element
 *
 */
function registerElement(value, required){
    var idKey = 'auf-id';

    required = _.isUndefined(required) ? true : required;
    if(required && !value) throw 'No input element provided.';

    var $el = getElement(value);

    _.each($el, function(each){
        $target = $(each);

        if(!$target.data(idKey)){
            $target.data(idKey, _.uniqueId());
        }
    });

    return $el;
}

/**
 * #TODO add description
 *
 * @function
 * @memberOf built.core.utils.helpers
 * @return {$element}       jquery element
 *
 */
function getElementId($el){
    var idKey = 'auf-id';
    return $el.data(idKey);
}

/**
 * compose a function from one module to another and maintain original module scope.
 * @param  {object} intoScope the scope you wish to compose the method into
 * @param  {object} fromScope the scope you wish to retrieve the method from
 * @param  {string} func      the function name, as a string
 * @return {undefined}
 *
 * @example
 * compose(this, fooModule, 'fooModuleMethod');
 */
/**
 * #TODO add description
 *
 * @function
 * @memberOf built.core.utils.helpers
 * @return {$element}       jquery element
 *
 */
function compose (intoScope, fromScope, func) {
    intoScope[func] = _.bind(fromScope[func], fromScope);
}

/**
 * Identical to compose, but takes list of n-function names.
 * @param  {object} intoScope the scope you wish to compose the method into
 * @param  {object} fromScope the scope you wish to retrieve the method from
 * @return {undefined}
 *
 * @example
 * composeAll(
 *     this,
 *     fooModule,
 *     'fooModuleMethod1',
 *     'fooModuleMethod2',
 *     'fooModuleMethod3'
 * );
 */
/**
 * #TODO add description
 *
 * @function
 * @memberOf built.core.utils.helpers
 * @return {$element}       jquery element
 *
 */
function composeAll(intoScope, fromScope) {
    var args;

    function iterator(func, i, funcs) {
        compose(intoScope, fromScope, func);
    }

    funcs = Array.prototype.slice.call(arguments, 2);

    _.each(funcs, iterator);
}

/**
 * normalizes an integer against a min and max
 * @param  {int} value the value you wish to normalize
 * @param  {int} min   the value's min limit
 * @param  {int} max   the value's max limit
 * @return {int}       normalized integer
 */
/**
 * #TODO add description
 *
 * @function
 * @memberOf built.core.utils.helpers
 * @return {$element}       jquery element
 *
 */
function normalizeInt(value, min, max) {
    // Ternary is faster than Math.min|max
    value = value > max ? max : value;
    value = value < min ? min : value;

    return value;
}

/**
 * #TODO add description
 *
 * @function
 * @memberOf built.core.utils.helpers
 * @return {$element}       jquery element
 *
 */
function sortArrayAscending(a, b) {
    // see: http://bit.ly/1c0cPTU
    return a - b;
}

/**
 * #TODO add description
 *
 * @function
 * @memberOf built.core.utils.helpers
 * @return {$element}       jquery element
 *
 */
function mixins(Source, Destination){
    names = Array.prototype.slice.call(arguments, 2);
    _.each(names, function(name){
        Destination.prototype[name] = function(){
            return Source.prototype[name].apply(this, arguments);
        };
    });
}

// Taken directly from Marionette.
// For slicing `arguments` in functions
var protoSlice = Array.prototype.slice;
/**
 * #TODO add description
 *
 * @function
 * @memberOf built.core.utils.helpers
 * @return {$element}       jquery element
 *
 */
function slice(args) {
  return protoSlice.call(args);
}

/**
 * #TODO add description
 *
 * @function
 * @memberOf built.core.utils.helpers
 * @return {$element}       jquery element
 *
 */
function throwError(message, name) {
  var error = new Error(message);
  error.name = name || 'Error';
  throw error;
}

// Exports

exports.compose                    = compose;
exports.composeAll                 = composeAll;
exports.normalizeInt               = normalizeInt;
exports.sortArrayAscending         = sortArrayAscending;
exports.sortArrayAscending         = sortArrayAscending;
exports.registerElement            = registerElement;
exports.getElementId               = getElementId;
exports.mixins                     = mixins;
exports.MSIEVersion                = _MSIEVersion();
exports.isMSIE                     = exports.MSIEVersion > -1 ? true : false;
exports.slice                      = slice;
exports.throwError                 = throwError;

});
