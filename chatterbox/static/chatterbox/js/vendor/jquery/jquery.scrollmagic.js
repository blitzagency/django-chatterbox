/*
ScrollMagic
The jQuery plugin for doing magical scroll interactions.
(c) Jan Paepke 2014 (@janpaepke)
License & Info: http://janpaepke.github.io/ScrollMagic

Inspired by and partially based on SUPERSCROLLORAMA by John Polacek (@johnpolacek)
http://johnpolacek.github.com/superscrollorama/

Powered by the Greensock Tweening Platform (GSAP): http://www.greensock.com/js
Greensock License info at http://www.greensock.com/licensing/
*/
/**
@overview ##Info
@version 1.0.8
@license Dual licensed under MIT license and GPL.
@author Jan Paepke - e-mail@janpaepke.de

@todo: bug: when cascading pins (pinning one element multiple times) and later removing them without reset, positioning errors occur.
@todo: bug: having multiple scroll directions with cascaded pins doesn't work (one scroll vertical, one horizontal)
@todo: bug: pin positioning problems with centered pins in IE9 (i.e. in examples)
@toto: improvement: check if its possible to take the recalculation of the start point out of the scene update, while still making sure it is always up to date (performance)
@todo: feature: consider public method to trigger pinspacerresize (in case size changes during pin)
@todo: feature: have different tweens, when scrolling up, than when scrolling down
@todo: feature: make pins work with -webkit-transform of parent for mobile applications. Might be possible by temporarily removing the pin element from its container and attaching it to the body during pin. Reverting might be difficult though (cascaded pins).
*/
(function($) {
    /**
     * The main class that is needed once per scroll container.
     *
     * @constructor
     *
     * @example
     * // basic initialization
     * var controller = new ScrollMagic();
     *
     * // passing options
     * var controller = new ScrollMagic({container: "#myContainer", loglevel: 3});
     *
     * @param {object} [options] - An object containing one or more options for the controller.
     * @param {(string|object)} [options.container=window] - A selector, DOM Object or a jQuery object that references the main container for scrolling.
     * @param {boolean} [options.vertical=true] - Sets the scroll mode to vertical (`true`) or horizontal (`false`) scrolling.
     * @param {object} [options.globalSceneOptions={}] - These options will be passed to every Scene that is added to the controller using the addScene method. For more information on Scene options see {@link ScrollScene}.
     * @param {number} [options.loglevel=2] Loglevel for debugging:
     ** `0` => silent
     ** `1` => errors
     ** `2` => errors, warnings
     ** `3` => errors, warnings, debuginfo
     *
     */

    ScrollMagic = function(options) {

        "use strict";

        /*
         * ----------------------------------------------------------------
         * settings
         * ----------------------------------------------------------------
         */
        var
        NAMESPACE = "ScrollMagic",
            DEFAULT_OPTIONS = {
                container: window,
                vertical: true,
                globalSceneOptions: {},
                loglevel: 2,
                tickDriver: null
            };

        /*
         * ----------------------------------------------------------------
         * private vars
         * ----------------------------------------------------------------
         */

        var
        ScrollMagic = this,
            _options = $.extend({}, DEFAULT_OPTIONS, options),
            _sceneObjects = [],
            _updateScenesOnNextTick = false, // can be boolean (true => all scenes) or an array of scenes to be updated
            _scrollPos = 0,
            _scrollDirection = "PAUSED",
            _isDocument = true,
            _viewPortSize = 0,
            _enabled = true;

        /*
         * ----------------------------------------------------------------
         * private functions
         * ----------------------------------------------------------------
         */

        /**
         * Internal constructor function of ScrollMagic
         * @private
         */
        var construct = function() {
            $.each(_options, function(key, value) {
                if (!DEFAULT_OPTIONS.hasOwnProperty(key)) {
                    log(2, "WARNING: Unknown option \"" + key + "\"");
                    delete _options[key];
                }
            });
            _options.container = $(_options.container).first();
            // check ScrolContainer
            if (_options.container.length === 0) {
                log(1, "ERROR creating object ScrollMagic: No valid scroll container supplied");
                return; // cancel
            }
            _isDocument = !$.contains(document, _options.container.get(0));
            // update container size immediately
            _viewPortSize = _options.vertical ? _options.container.height() : _options.container.width();
            // set event handlers
            _options.container.on("scroll resize", onChange);

            if (!_options.tickDriver){
                _options.tickDriver = defaultTickDriver(_options, onTick);
            } else {
                _options.tickDriver = _options.tickDriver(_options, onTick);
            }

            _options.tickDriver.on();
            log(3, "added new " + NAMESPACE + " controller");
        };

        var defaultTickDriver = function(options, tickHandler){
            var tweenLiteEnabled = false;

            var on = function(){
                try {
                    TweenLite.ticker.addEventListener("tick", tickHandler); // prefer TweenMax Ticker, but don't rely on it for basic functionality
                    tweenLiteEnabled = true;
                } catch (e) {
                    options.container.on("scroll resize", tickHandler); // okay then just update on scroll/resize...
                }
            };

            var off = function(){
                if (tweenLiteEnabled) {
                    TweenLite.ticker.removeEventListener("tick", tickHandler);
                } else {
                    options.container.off("scroll resize", tickHandler);
                }
            };

            return {
                on: on,
                off: off
            };
        };

        /**
         * Default function to get scroll pos - is overwriteable using ScrollMagic.scrollPos()
         * @private
         */
        var getScrollPos = function() {
            return _options.vertical ? _options.container.scrollTop() : _options.container.scrollLeft();
        };

        /**
         * Handle updates on tick instead of on scroll (performance)
         * @private
         */
        var onTick = function(e) {
            if (_updateScenesOnNextTick && _enabled) {
                var
                scenesToUpdate = $.isArray(_updateScenesOnNextTick) ? _updateScenesOnNextTick : _sceneObjects,
                    oldScrollPos = _scrollPos;
                // update scroll pos & direction
                _scrollPos = ScrollMagic.scrollPos();
                var deltaScroll = _scrollPos - oldScrollPos;
                _scrollDirection = (deltaScroll === 0) ? "PAUSED" : (deltaScroll > 0) ? "FORWARD" : "REVERSE";
                // update scenes
                ScrollMagic.updateScene(scenesToUpdate, true);
                if (scenesToUpdate.length === 0 && _options.loglevel >= 3) {
                    log(3, "updating 0 Scenes (nothing added to controller)");
                }
                _updateScenesOnNextTick = false;
            }
        };

        /**
         * Handles Container changes
         * @private
         */
        var onChange = function(e) {
            if (e.type == "resize") {
                _viewPortSize = _options.vertical ? _options.container.height() : _options.container.width();
            }
            _updateScenesOnNextTick = true;
        };

        /**
         * Send a debug message to the console.
         * @private
         *
         * @param {number} loglevel - The loglevel required to initiate output for the message.
         * @param {...mixed} output - One or more variables that should be passed to the console.
         */
        var log = function(loglevel, output) {
            if (_options.loglevel >= loglevel) {
                var
                prefix = "(" + NAMESPACE + ") ->",
                    args = Array.prototype.splice.call(arguments, 1),
                    func = Function.prototype.bind.call(debug, window);
                args.unshift(loglevel, prefix);
                func.apply(window, args);
            }
        };

        /*
         * ----------------------------------------------------------------
         * public functions
         * ----------------------------------------------------------------
         */

        /**
         * Add one ore more scene(s) to the controller.
         * This is the equivalent to `ScrollScene.addTo(controller)`
         * @public
         * @example
         * // with a previously defined scene
         * controller.addScene(scene);
         *
         * // with a newly created scene.
         * controller.addScene(new ScrollScene({duration : 0}));
         *
         * // adding multiple scenes
         * controller.addScene([scene, scene2, new ScrollScene({duration : 0})]);
         *
         * @param {(ScrollScene|array)} ScrollScene - ScrollScene or Array of ScrollScenes to be added to the controller.
         * @return {ScrollMagic} Parent object for chaining.
         */
        this.addScene = function(ScrollScene) {
            if ($.isArray(ScrollScene)) {
                $.each(ScrollScene, function(index, scene) {
                    ScrollMagic.addScene(scene);
                });
            } else {
                if (ScrollScene.parent() != ScrollMagic) {
                    ScrollScene.addTo(ScrollMagic);
                } else if ($.inArray(_sceneObjects, ScrollScene) == -1) {
                    // new scene
                    _sceneObjects.push(ScrollScene);
                    // insert Global defaults.
                    $.each(_options.globalSceneOptions, function(key, value) {
                        if (ScrollScene[key]) {
                            ScrollScene[key].call(ScrollScene, value);
                        }
                    });
                    log(3, "added Scene (" + _sceneObjects.length + " total)");
                }
            }
            return ScrollMagic;
        };

        /**
         * Remove one ore more scene(s) from the controller.
         * This is the equivalent to `ScrollScene.remove()`
         * @public
         * @example
         * // remove a scene from the controller
         * controller.removeScene(scene);
         *
         * // remove multiple scenes from the controller
         * controller.removeScene([scene, scene2, scene3]);
         *
         * @param {(ScrollScene|array)} ScrollScene - ScrollScene or Array of ScrollScenes to be removed from the controller.
         * @returns {ScrollMagic} Parent object for chaining.
         */
        this.removeScene = function(ScrollScene) {
            if ($.isArray(ScrollScene)) {
                $.each(ScrollScene, function(index, scene) {
                    ScrollMagic.removeScene(scene);
                });
            } else {
                var index = $.inArray(ScrollScene, _sceneObjects);
                if (index > -1) {
                    _sceneObjects.splice(index, 1);
                    ScrollScene.remove();
                    log(3, "removed Scene (" + _sceneObjects.length + " total)");
                }
            }
            return ScrollMagic;
        };

        /**
 * Update one ore more scene(s) according to the scroll position of the container.
 * This is the equivalent to `ScrollScene.update()`
 * @public
 * @example
 * // update a specific scene on next tick
   * controller.updateScene(scene);
   *
 * // update a specific scene immediately
 * controller.updateScene(scene, true);
   *
 * // update multiple scenes scene on next tick
 * controller.updateScene([scene1, scene2, scene3]);
 *
 * @param {ScrollScene} ScrollScene - ScrollScene or Array of ScrollScenes that is/are supposed to be updated.
 * @param {boolean} [immediately=false] - If `true` the update will be instant, if `false` it will wait until next tweenmax tick.
    This is useful when changing multiple properties of the scene - this way it will only be updated once all new properties are set (onTick).
 * @return {ScrollMagic} Parent object for chaining.
 */
        this.updateScene = function(ScrollScene, immediately) {
            if ($.isArray(ScrollScene)) {
                $.each(ScrollScene, function(index, scene) {
                    log(3, "updating Scene " + (index + 1) + "/" + ScrollScene.length + " (" + _sceneObjects.length + " total)");
                    ScrollMagic.updateScene(scene, immediately);
                });
            } else {
                if (immediately) {
                    ScrollScene.update(true);
                } else {
                    if (!$.isArray(_updateScenesOnNextTick)) {
                        _updateScenesOnNextTick = [];
                    }
                    if ($.inArray(ScrollScene, _updateScenesOnNextTick) == -1) {
                        _updateScenesOnNextTick.push(ScrollScene);
                    }
                }
            }
            return ScrollMagic;
        };

        /**
         * Update the controller params and all its Scenes.
         * @public
         * @example
         * // update the controller on next tick (saves performance)
         * controller.update();
         *
         * // update the controller immediately
         * controller.update(true);
         *
         * @param {boolean} [immediately=false] - If `true` the update will be instant, if `false` it will wait until next tweenmax tick (better performance)
         * @return {ScrollMagic} Parent object for chaining.
         */
        this.update = function(immediately) {
            onChange({
                type: "resize"
            }); // will update size and set _updateScenesOnNextTick to true
            if (immediately) {
                onTick();
            }
            return ScrollMagic;
        };

        /**
         * **Get** or **Set** the current scrollPosition.
         * Watch out: this will permanently overwrite the controller's scrollPos calculation.
         * If you set it to a number it will always have this value.
         * It usually makes more sense to pass a function, when the scrollPosition calculation is not defined by the containers scrollTop or scrollLeft values.
         * This may be the case for mobile applications using iScroll, as there a child container is moved, instead of actually scrolling the container.
         * Please also mind that your function should return y values for vertical scrolls an x for horizontals.
         * @public
         *
         * @example
         * // get the current scroll Position
         * var scrollPos = controller.scrollPos();
         *
         * // set a new scrollPos calculation function
         * controller.scrollPos(function () {
         * return this.info("vertical") ? -$mychildcontainer.y : -$mychildcontainer.x
         * });
         *
         * @param {(number|function)} [newLoglevel] - The new value or function used for the scroll position of the container.
         * @returns {(number|ScrollMagic)} Current scroll position or parent object for chaining.
         */
        this.scrollPos = function(newScrollPos) {
            if (!arguments.length) { // get
                return getScrollPos.call(ScrollMagic);
            } else { // set
                if (!$.isFunction(newScrollPos)) {
                    newScrollPos = function() {
                        return newScrollPos;
                    };
                }
                getScrollPos = newScrollPos;
            }
            return ScrollMagic;
        };

        /**
 * **Get** all infos or one in particular about the controller.
 * @public
 * @example
 * // returns the current scroll position (number)
 * var scrollPos = controller.info("scrollPos");
 *
 * // returns all infos as an object
 * var infos = controller.info();
 *
 * @param {string} [about] - If passed only this info will be returned instead of an object containing all.
   Valid options are:
   ** `"size"` => the current viewport size of the container
   ** `"vertical"` => true if vertical scrolling, otherwise false
   ** `"scrollPos"` => the current scroll position
   ** `"scrollDirection"` => the last known direction of the scroll
   ** `"container"` => the container element
   ** `"isDocument"` => true if container element is the document.
 * @returns {(mixed|object)} The requested info(s).
 */
        this.info = function(about) {
            var values = {
                size: _viewPortSize, // contains height or width (in regard to orientation);
                vertical: _options.vertical,
                scrollPos: _scrollPos,
                scrollDirection: _scrollDirection,
                container: _options.container,
                isDocument: _isDocument
            };
            if (!arguments.length) { // get all as an object
                return values;
            } else if (values[about] !== undefined) {
                return values[about];
            } else {
                log(1, "ERROR: option \"" + about + "\" is not available");
                return;
            }
        };

        /**
         * **Get** or **Set** the current loglevel option value.
         * @public
         *
         * @example
         * // get the current value
         * var loglevel = controller.loglevel();
         *
         * // set a new value
         * controller.loglevel(3);
         *
         * @param {number} [newLoglevel] - The new loglevel setting of the ScrollMagic controller. `[0-3]`
         * @returns {(number|ScrollMagic)} Current loglevel or parent object for chaining.
         */
        this.loglevel = function(newLoglevel) {
            if (!arguments.length) { // get
                return _options.loglevel;
            } else if (_options.loglevel != newLoglevel) { // set
                _options.loglevel = newLoglevel;
            }
            return ScrollMagic;
        };

        /**
         * **Get** or **Set** the current enabled state of the controller.
         * This can be used to disable all Scenes connected to the controller without destroying or removing them.
         * @public
         *
         * @example
         * // get the current value
         * var enabled = controller.enabled();
         *
         * // disable the controller
         * controller.enabled(false);
         *
         * @param {boolean} [newState] - The new enabled state of the controller `true` or `false`.
         * @returns {(boolean|ScrollMagic)} Current enabled state or parent object for chaining.
         */
        this.enabled = function(newState) {
            if (!arguments.length) { // get
                return _enabled;
            } else if (_enabled != newState) { // set
                _enabled = !! newState;
                ScrollMagic.updateScene(_sceneObjects, true);
            }
            return ScrollMagic;
        };

        /**
         * Destroy the Controller, all Scenes and everything.
         * @public
         *
         * @example
         * // without resetting the scenes
         * controller = controller.destroy();
         *
         * // with scene reset
         * controller = controller.destroy(true);
         *
         * @param {boolean} [resetScenes=false] - If `true` the pins and tweens (if existent) of all scenes will be reset.
         * @returns {null} Null to unset handler variables.
         */
        this.destroy = function(resetScenes) {
            while (_sceneObjects.length > 0) {
                var scene = _sceneObjects[_sceneObjects.length - 1];
                scene.destroy(resetScenes);
            }
            _options.container.off("scroll resize", onChange);
            _options.tickDriver.off();

            log(3, "destroyed " + NAMESPACE + " (reset: " + (resetScenes ? "true" : "false") + ")");
            return null;
        };

        // INIT
        construct();
        return ScrollMagic;
    };


    /**
 * A ScrollScene defines where the controller should react and how.
 *
 * @constructor
 *
 * @example
 * // create a standard scene and add it to a controller
 * new ScrollScene()
 * .addTo(controller);
 *
 * // create a scene with custom options and assign a handler to it.
 * var scene = new ScrollScene({
 *  duration: 100,
 * offset: 200,
 * triggerHook: "onEnter",
 * reverse: false
 * });
 *
 * @param {object} [options] - Options for the Scene. The options can be updated at any time.
     Instead of setting the options for each scene individually you can also set them globally in the controller as the controllers `globalSceneOptions` option. The object accepts the same properties as the ones below.
     When a scene is added to the controller the options defined using the ScrollScene constructor will be overwritten by those set in `globalSceneOptions`.
 * @param {number} [options.duration=0] - The duration of the scene.
    If `0` tweens will auto-play when reaching the scene start point, pins will be pinned indefinetly starting at the start position.
 * @param {number} [options.offset=0] - Offset Value for the Trigger Position. If no triggerElement is defined this will be the scroll distance from the start of the page, after which the scene will start.
 * @param {(string|object)} [options.triggerElement=null] - Selector, DOM Object or jQuery Object that defines the start of the scene. If undefined the scene will start right at the start of the page (unless an offset is set).
 * @param {(number|string)} [options.triggerHook="onCenter"] - Can be a number between 0 and 1 defining the position of the trigger Hook in relation to the viewport.
    Can also be defined using a string:
    ** `"onEnter"` => `1`
    ** `"onCenter"` => `0.5`
    ** `"onLeave"` => `0`
 * @param {boolean} [options.reverse=true] - Should the scene reverse, when scrolling up?
 * @param {boolean} [options.tweenChanges=false] - Tweens Animation to the progress target instead of setting it.
     Does not affect animations where duration is `0`.
 * @param {number} [options.loglevel=2] - Loglevel for debugging.
    ** `0` => silent
    ** `1` => errors
    ** `2` => errors, warnings
    ** `3` => errors, warnings, debuginfo
 *
 */
    ScrollScene = function(options) {

        "use strict";

        /*
         * ----------------------------------------------------------------
         * settings
         * ----------------------------------------------------------------
         */

        var
        TRIGGER_HOOK_STRINGS = ["onCenter", "onEnter", "onLeave"],
            NAMESPACE = "ScrollScene",
            DEFAULT_OPTIONS = {
                duration: 0,
                offset: 0,
                triggerElement: null,
                triggerHook: TRIGGER_HOOK_STRINGS[0],
                reverse: true,
                tweenChanges: false,
                loglevel: 2
            };

        /*
         * ----------------------------------------------------------------
         * private vars
         * ----------------------------------------------------------------
         */

        var
        ScrollScene = this,
            _options = $.extend({}, DEFAULT_OPTIONS, options),
            _state = 'BEFORE',
            _progress = 0,
            _scrollOffset = {
                start: 0,
                end: 0
            }, // reflects the parent's scroll position for the start and end of the scene respectively
            _enabled = true,
            _parent,
            _tween,
            _pin,
            _pinOptions;


        /*
         * ----------------------------------------------------------------
         * private functions
         * ----------------------------------------------------------------
         */

        /**
         * Internal constructor function of ScrollMagic
         * @private
         */
        var construct = function() {
            checkOptionsValidity();

            // internal event listeners
            ScrollScene.on("change.internal", function(e) {
                checkOptionsValidity();
                if (e.what != "loglevel" && e.what != "tweenChanges") { // no need for a scene update scene with these options...
                    if (e.what != "reverse" && _options.triggerElement === null) { // otherwise not necessary or it will be updated in ScrollScene.update()
                        updateScrollOffset();
                    }
                    ScrollScene.update();
                    if ((_state !== "DURING" && e.what == "duration") || (_state === "AFTER" && _options.duration === 0)) { // if duration changed outside of scene (inside scene progress updates pin position) or duration is 0, we are beyond trigger and some other value changed.
                        updatePinState();
                    }
                }
            });
            // internal event listeners
            ScrollScene.on("progress.internal", function(e) {
                updateTweenProgress();
                updatePinState();
            });
        };

        /**
         * Send a debug message to the console.
         * @private
         *
         * @param {number} loglevel - The loglevel required to initiate output for the message.
         * @param {...mixed} output - One or more variables that should be passed to the console.
         */
        var log = function(loglevel, output) {
            if (_options.loglevel >= loglevel) {
                var
                prefix = "(" + NAMESPACE + ") ->",
                    args = Array.prototype.splice.call(arguments, 1),
                    func = Function.prototype.bind.call(debug, window);
                args.unshift(loglevel, prefix);
                func.apply(window, args);
            }
        };

        /**
         * Check the validity of all options and reset to default if neccessary.
         * @private
         */
        var checkOptionsValidity = function() {
            $.each(_options, function(key, value) {
                if (!DEFAULT_OPTIONS.hasOwnProperty(key)) {
                    log(2, "WARNING: Unknown option \"" + key + "\"");
                    delete _options[key];
                }
            });
            _options.duration = parseFloat(_options.duration);
            if (!$.isNumeric(_options.duration) || _options.duration < 0) {
                log(1, "ERROR: Invalid value for option \"duration\":", _options.duration);
                _options.duration = DEFAULT_OPTIONS.duration;
            }
            _options.offset = parseFloat(_options.offset);
            if (!$.isNumeric(_options.offset)) {
                log(1, "ERROR: Invalid value for option \"offset\":", _options.offset);
                _options.offset = DEFAULT_OPTIONS.offset;
            }

            // if (_options.triggerElement !== null && $(_options.triggerElement).length === 0) {
            //     log(1, "ERROR: Element defined in option \"triggerElement\" was not found:", _options.triggerElement);
            //     _options.triggerElement = DEFAULT_OPTIONS.triggerElement;
            // }

            if (!$.isNumeric(_options.triggerHook) && $.inArray(_options.triggerHook, TRIGGER_HOOK_STRINGS) == -1) {
                log(1, "ERROR: Invalid value for option \"triggerHook\": ", _options.triggerHook);
                _options.triggerHook = DEFAULT_OPTIONS.triggerHook;
            }
            if (!$.isNumeric(_options.loglevel) || _options.loglevel < 0 || _options.loglevel > 3) {
                var wrongval = _options.loglevel;
                _options.loglevel = DEFAULT_OPTIONS.loglevel;
                log(1, "ERROR: Invalid value for option \"loglevel\":", wrongval);
            }
            if (_tween && _parent && _options.triggerElement && _options.loglevel >= 2) { // parent is needed to know scroll direction.
                // check if there are position tweens defined for the trigger and warn about it :)
                var
                triggerTweens = _tween.getTweensOf($(_options.triggerElement)),
                    vertical = _parent.info("vertical");
                $.each(triggerTweens, function(index, value) {
                    var
                    tweenvars = value.vars.css || value.vars,
                        condition = vertical ? (tweenvars.top !== undefined || tweenvars.bottom !== undefined) : (tweenvars.left !== undefined || tweenvars.right !== undefined);
                    if (condition) {
                        log(2, "WARNING: Tweening the position of the trigger element affects the scene timing and should be avoided!");
                        return false;
                    }
                });
            }
        };

        /**
         * Update the start and end scrollOffset of the container.
         * The positions reflect what the parent's scroll position will be at the start and end respectively.
         * @private
         */
        var updateScrollOffset = function() {
            _scrollOffset = {
                start: ScrollScene.triggerOffset()
            };
            if (_parent) {
                // take away triggerHook portion to get relative to top
                var size = _parent.info("size");
                var triggerHook = ScrollScene.triggerHook();
                _scrollOffset.start -= size * triggerHook;
            }
            _scrollOffset.end = _scrollOffset.start + _options.duration;
        };

        /**
         * Update the tween progress.
         * @private
         *
         * @param {number} [to] - If not set the scene Progress will be used. (most cases)
         * @return {boolean} true if the Tween was updated.
         */
        var updateTweenProgress = function(to) {
            var progress = (to >= 0 && to <= 1) ? to : _progress;
            if (_tween) {
                if (_tween.repeat() === -1) {
                    // infinite loop, so not in relation to progress
                    if ((_state === "DURING" || (_state === "AFTER" && _options.duration === 0)) && _tween.paused()) {
                        _tween.play();
                    } else if (_state !== "DURING" && !_tween.paused()) {
                        _tween.pause();
                    } else {
                        return false;
                    }
                } else if (progress != _tween.progress()) { // do we even need to update the progress?
                    // no infinite loop - so should we just play or go to a specific point in time?
                    if (_options.duration === 0) {
                        // play the animation
                        if (_state == "AFTER") { // play from 0 to 1
                            _tween.play();
                        } else { // play from 1 to 0
                            _tween.reverse();
                        }
                    } else {
                        // go to a specific point in time
                        if (_options.tweenChanges) {
                            // go smooth
                            _tween.tweenTo(progress * _tween.duration());
                        } else {
                            // just hard set it
                            _tween.progress(progress).pause();
                        }
                    }
                } else {
                    return false;
                }
                return true;
            } else {
                return false;
            }
        };

        /**
         * Update the pin state.
         * @private
         */
        var updatePinState = function(forceUnpin) {
            if (_pin && _parent) {
                var
                containerInfo = _parent.info();

                if (!forceUnpin && (_state === "DURING" || (_state === "AFTER" && _options.duration === 0))) { // during scene or if duration is 0 and we are past the trigger
                    // pinned state
                    if (_pin.css("position") != "fixed") {
                        // change state before updating pin spacer (position changes due to fixed collapsing might occur.)
                        _pin.css("position", "fixed");
                        // update pin spacer
                        updatePinSpacerSize();
                        // add pinned class
                        _pin.addClass(_pinOptions.pinnedClass);
                    }

                    var
                    fixedPos = getOffset(_pinOptions.spacer, true), // get viewport position of spacer
                        scrollDistance = _options.reverse || _options.duration === 0 ? containerInfo.scrollPos - _scrollOffset.start // quicker
                        : Math.round(_progress * _options.duration * 10) / 10; // if no reverse and during pin the position needs to be recalculated using the progress

                    // remove spacer margin to get real position (in case marginCollapse mode)
                    fixedPos.top -= parseFloat(_pinOptions.spacer.css("margin-top"));

                    // add scrollDistance
                    fixedPos[containerInfo.vertical ? "top" : "left"] += scrollDistance;

                    // set new values
                    _pin.css({
                        top: fixedPos.top,
                        left: fixedPos.left
                    });
                } else {
                    // unpinned state
                    var
                    newCSS = {
                        position: _pinOptions.inFlow ? "relative" : "absolute",
                        top: 0,
                        left: 0
                    },
                        change = _pin.css("position") != newCSS.position;

                    if (!_pinOptions.pushFollowers) {
                        newCSS[containerInfo.vertical ? "top" : "left"] = _options.duration * _progress;
                    } else {
                        if (_state === "AFTER" && parseFloat(_pinOptions.spacer.css("padding-top")) === 0) {
                            change = true; // if in after state but havent updated spacer yet (jumped past pin)
                        } else if (_state === "BEFORE" && parseFloat(_pinOptions.spacer.css("padding-bottom")) === 0) { // before
                            change = true; // jumped past fixed state upward direction
                        }
                    }
                    // set new values
                    _pin.css(newCSS);
                    if (change) {
                        // remove pinned class
                        _pin.removeClass(_pinOptions.pinnedClass);
                        // update pin spacer if state changed
                        updatePinSpacerSize();
                    }
                }
            }
        };

        /**
         * Update the pin spacer size.
         * The size of the spacer needs to be updated whenever the duration of the scene changes, if it is to push down following elements.
         * @private
         */
        var updatePinSpacerSize = function() {
            if (_pin && _parent && _pinOptions.inFlow) { // no spacerresize, if original position is absolute
                var
                after = (_state === "AFTER"),
                    before = (_state === "BEFORE"),
                    during = (_state === "DURING"),
                    pinned = (_pin.css("position") == "fixed"),
                    vertical = _parent.info("vertical"),
                    $spacercontent = _pinOptions.spacer.children().first(), // usually the pined element but can also be another spacer (cascaded pins)
                    marginCollapse = ($.inArray(_pinOptions.spacer.css("display"), ["block", "flex", "list-item", "table", "-webkit-box"]) > -1),
                    css = {};

                if (marginCollapse) {
                    css["margin-top"] = before || (during && pinned) ? _pin.css("margin-top") : "auto";
                    css["margin-bottom"] = after || (during && pinned) ? _pin.css("margin-bottom") : "auto";
                } else {
                    css["margin-top"] = css["margin-bottom"] = "auto";
                }

                // set new size
                // if relsize: spacer -> pin | else: pin -> spacer
                if (_pinOptions.relSize.width) {
                    if (pinned) {
                        if ($(window).width() == _pinOptions.spacer.parent().width()) {
                            // relative to body
                            _pin.css("width", "inherit");
                        } else {
                            // not relative to body -> need to calculate
                            _pin.css("width", _pinOptions.spacer.width());
                        }
                    } else {
                        _pin.css("width", "100%");
                    }
                } else {
                    css["min-width"] = $spacercontent.outerWidth(true); // needed for cascading pins
                    css.width = pinned ? css["min-width"] : "auto";
                }
                if (_pinOptions.relSize.height) {
                    if (pinned) {
                        if ($(window).height() == _pinOptions.spacer.parent().height()) {
                            // relative to body
                            _pin.css("height", "inherit");
                        } else {
                            // not relative to body -> need to calculate
                            _pin.css("height", _pinOptions.spacer.height());
                        }
                    } else {
                        _pin.css("height", "100%");
                    }
                } else {
                    css["min-height"] = $spacercontent.outerHeight(!marginCollapse); // needed for cascading pins
                    css.height = pinned ? css["min-height"] : "auto";
                }

                // add space for duration if pushFollowers is true
                if (_pinOptions.pushFollowers) {
                    css["padding" + (vertical ? "Top" : "Left")] = _options.duration * _progress;
                    css["padding" + (vertical ? "Bottom" : "Right")] = _options.duration * (1 - _progress);
                }

                _pinOptions.spacer.css(css);
            }
        };

        /**
         * Updates the Pin state (in certain scenarios)
         * If the controller container is not the document and we are mid-pin-phase scrolling or resizing the main document can result to wrong pin positions.
         * So this function is called on resize and scroll of the document.
         * @private
         */
        var updatePinInContainer = function(e) {
            if (_parent && _pin && _state === "DURING") {
                if (!_parent.info("isDocument")) {
                    updatePinState();
                }
            }
        };

        /**
         * Updates the Pin spacer size state (in certain scenarios)
         * If container is resized during pin and relatively sized the size of the pin might need to be updated...
         * So this function is called on resize of the container.
         * @private
         */
        var updateRelativePinSpacer = function(e) {
            if (_parent && _pin // well, duh
                && (_state === "DURING" || _state === "AFTER" && _options.duration === 0) // element in pinned state?
                && ( // is width or height relatively sized, but not in relation to body? then we need to recalc.
                    (_pinOptions.relSize.width && $(window).width() != _pinOptions.spacer.parent().width()) || (_pinOptions.relSize.height && $(window).height() != _pinOptions.spacer.parent().height())
                )
            ) {
                updatePinSpacerSize();
            }
        };


        /*
         * ----------------------------------------------------------------
         * public functions (getters/setters)
         * ----------------------------------------------------------------
         */

        /**
         * **Get** the parent controller.
         * @public
         * @example
         * // get the parent controller of a scene
         * var controller = scene.parent();
         *
         * @returns {ScrollMagic} Parent controller or `undefined`
         */
        this.parent = function() {
            return _parent;
        };


        /**
         * **Get** or **Set** the duration option value.
         * @public
         * @example
         * // get the current duration value
         * var duration = scene.duration();
         *
         * // set a new duration
         * scene.duration(300);
         *
         * @fires {@link ScrollScene.change}, when used as setter
         * @param {number} [newDuration] - The new duration of the scene.
         * @returns {number} `get` -  Current scene duration.
         * @returns {ScrollScene} `set` -  Parent object for chaining.
         */
        this.duration = function(newDuration) {
            if (!arguments.length) { // get
                return _options.duration;
            } else if (_options.duration != newDuration) { // set
                _options.duration = newDuration;
                ScrollScene.trigger("change", {
                    what: "duration",
                    newval: newDuration
                }); // fire event
            }
            return ScrollScene;
        };

        /**
         * **Get** or **Set** the offset option value.
         * @public
         * @example
         * // get the current offset
         * var offset = scene.offset();
         *
         * // set a new offset
         * scene.offset(100);
         *
         * @fires {@link ScrollScene.change}, when used as setter
         * @param {number} [newOffset] - The new offset of the scene.
         * @returns {number} `get` -  Current scene offset.
         * @returns {ScrollScene} `set` -  Parent object for chaining.
         */
        this.offset = function(newOffset) {
            if (!arguments.length) { // get
                return _options.offset;
            } else if (_options.offset != newOffset) { // set
                _options.offset = newOffset;
                ScrollScene.trigger("change", {
                    what: "offset",
                    newval: newOffset
                }); // fire event
            }
            return ScrollScene;
        };

        /**
         * **Get** or **Set** the triggerElement option value.
         * @public
         * @example
         * // get the current triggerElement
         * var triggerElement = scene.triggerElement();
         *
         * // set a new triggerElement using a selector
         * scene.triggerElement("#trigger");
         * // set a new triggerElement using a jQuery Object
         * scene.triggerElement($("#trigger"));
         * // set a new triggerElement using a DOM Object
         * scene.triggerElement(document.getElementById("trigger"));
         *
         * @fires {@link ScrollScene.change}, when used as setter
         * @param {(string|object)} [newTriggerElement] - The new trigger element for the scene.
         * @returns {(string|object)} `get` -  Current triggerElement.
         * @returns {ScrollScene} `set` -  Parent object for chaining.
         */
        this.triggerElement = function(newTriggerElement) {
            if (!arguments.length) { // get
                return _options.triggerElement;
            } else if (_options.triggerElement != newTriggerElement) { // set
                _options.triggerElement = newTriggerElement;
                ScrollScene.trigger("change", {
                    what: "triggerElement",
                    newval: newTriggerElement
                }); // fire event
            }
            return ScrollScene;
        };

        /**
         * **Get** or **Set** the triggerHook option value.
         * @public
         * @example
         * // get the current triggerHook value
         * var triggerHook = scene.triggerHook();
         *
         * // set a new triggerHook using a string
         * scene.triggerHook("onLeave");
         * // set a new triggerHook using a number
         * scene.triggerHook(0.7);
         *
         * @fires {@link ScrollScene.change}, when used as setter
         * @param {(number|string)} [newTriggerHook] - The new triggerHook of the scene. @see {@link ScrollScene} parameter description for value options.
         * @returns {number} `get` -  Current triggerHook (ALWAYS numerical).
         * @returns {ScrollScene} `set` -  Parent object for chaining.
         */
        this.triggerHook = function(newTriggerHook) {
            if (!arguments.length) { // get
                var triggerPoint;
                if ($.isNumeric(_options.triggerHook)) {
                    triggerPoint = _options.triggerHook;
                } else {
                    switch (_options.triggerHook) {
                        case "onCenter":
                            triggerPoint = 0.5;
                            break;
                        case "onLeave":
                            triggerPoint = 0;
                            break;
                        case "onEnter":
                        default:
                            triggerPoint = 1;
                            break;
                    }
                }
                return triggerPoint;
            } else if (_options.triggerHook != newTriggerHook) { // set
                _options.triggerHook = newTriggerHook;
                ScrollScene.trigger("change", {
                    what: "triggerHook",
                    newval: newTriggerHook
                }); // fire event
            }
            return ScrollScene;
        };

        /**
         * **Get** or **Set** the reverse option value.
         * @public
         * @example
         * // get the current reverse option
         * var reverse = scene.reverse();
         *
         * // set new reverse option
         * scene.reverse(false);
         *
         * @fires {@link ScrollScene.change}, when used as setter
         * @param {boolean} [newReverse] - The new reverse setting of the scene.
         * @returns {boolean} `get` -  Current reverse option value.
         * @returns {ScrollScene} `set` -  Parent object for chaining.
         */
        this.reverse = function(newReverse) {
            if (!arguments.length) { // get
                return _options.reverse;
            } else if (_options.reverse != newReverse) { // set
                _options.reverse = newReverse;
                ScrollScene.trigger("change", {
                    what: "reverse",
                    newval: newReverse
                }); // fire event
            }
            return ScrollScene;
        };

        /**
         * **Get** or **Set** the tweenChanges option value.
         * @public
         * @example
         * // get the current tweenChanges option
         * var tweenChanges = scene.tweenChanges();
         *
         * // set new tweenChanges option
         * scene.tweenChanges(true);
         *
         * @fires {@link ScrollScene.change}, when used as setter
         * @param {boolean} [newTweenChanges] - The new tweenChanges setting of the scene.
         * @returns {boolean} `get` -  Current tweenChanges option value.
         * @returns {ScrollScene} `set` -  Parent object for chaining.
         */
        this.tweenChanges = function(newTweenChanges) {
            if (!arguments.length) { // get
                return _options.tweenChanges;
            } else if (_options.tweenChanges != newTweenChanges) { // set
                _options.tweenChanges = newTweenChanges;
                ScrollScene.trigger("change", {
                    what: "tweenChanges",
                    newval: newTweenChanges
                }); // fire event
            }
            return ScrollScene;
        };

        /**
         * **Get** or **Set** the loglevel option value.
         * @public
         * @example
         * // get the current loglevel
         * var loglevel = scene.loglevel();
         *
         * // set new loglevel
         * scene.loglevel(3);
         *
         * @fires {@link ScrollScene.change}, when used as setter
         * @param {number} [newLoglevel] - The new loglevel setting of the scene. `[0-3]`
         * @returns {number} `get` -  Current loglevel.
         * @returns {ScrollScene} `set` -  Parent object for chaining.
         */
        this.loglevel = function(newLoglevel) {
            if (!arguments.length) { // get
                return _options.loglevel;
            } else if (_options.loglevel != newLoglevel) { // set
                _options.loglevel = newLoglevel;
                ScrollScene.trigger("change", {
                    what: "loglevel",
                    newval: newLoglevel
                }); // fire event
            }
            return ScrollScene;
        };

        /**
         * **Get** the current state.
         * @public
         * @example
         * // get the current state
         * var state = scene.state();
         *
         * @returns {string} `"BEFORE"`, `"DURING"` or `"AFTER"`
         */
        this.state = function() {
            return _state;
        };

        /**
         * **Get** the trigger offset of the scene.
         * @public
         * @deprecated Method is deprecated since 1.0.7. You should now use {@link ScrollScene.triggerOffset}
         */
        this.startPosition = function() {
            return this.triggerOffset();
        };

        /**
         * **Get** the trigger offset of the scene.
         * @public
         * @example
         * // get the scene's trigger offset
         * var triggerOffset = scene.triggerOffset();
         *
         * @returns {number} Start position of the scene. Top position value for vertical and left position value for horizontal scrolls.
         */
        this.triggerOffset = function() {
            var pos = _options.offset;
            var offset;

            if (_parent) {
                var containerInfo = _parent.info();
                // get the trigger position
                if (_options.triggerElement === null) {
                    // return the triggerHook to start right at the beginning
                    pos += containerInfo.size * ScrollScene.triggerHook();
                } else {

                    var containerOffset = getOffset(_parent.info("container")); // container position is needed because element offset is returned in relation to document, not in relation to container.
                    var triggerElement = _options.triggerElement;
                    var type = typeof triggerElement;

                    if(type == "string" && triggerElement.indexOf('%') != -1){
                        offset = this.percentOffset();
                    } else if(
                        (type == "string" && ! isNaN(parseInt(_options.triggerElement, 10))) ||
                        (type == "number")) {
                        offset = this.pixelOffset();
                    } else {

                        offset = this.elementOffset();
                    }

                    if (!containerInfo.isDocument) { // container is not the document root, so substract scroll Position to get correct trigger element position relative to scrollcontent
                        containerOffset.top -= containerInfo.scrollPos;
                        containerOffset.left -= containerInfo.scrollPos;
                    }

                    pos += containerInfo.vertical ?
                          offset.top - containerOffset.top :
                          offset.left - containerOffset.left;
                }
            }
            return pos;
        };

        this.elementOffset = function(){

            // Element as trigger
            var element = $(_options.triggerElement).first();

            // if parent is spacer, use spacer position instead so correct start position is returned for pinned elements.
            while (element.parent().data("ScrollMagicPinSpacer")) {
                element = element.parent();
            }

            var elementOffset = getOffset(element);
            return elementOffset;
        };

        this.percentOffset = function(){
            var info = _parent.info();
            var vertical = info.vertical;
            var containerOffset = getOffset(info.container);

            var scrollHeight = info.container[0].scrollHeight;
            var key = vertical ? "top": "left";

            var percent = parseInt(_options.triggerElement, 10) / 100;

            var top = Math.round((scrollHeight * percent));

            var offset = {top: 0, left: 0};
            offset[key] = (top - info.scrollPos) + containerOffset[key];

            offset.top += $(document).scrollTop();
            offset.left += $(document).scrollLeft();

            return offset;
        };

        this.pixelOffset = function(){
            var top = _options.triggerElement;
            var type = typeof triggerElement;

            if(type == "string"){
                top = parseInt(triggerElement, 10);
            }

            var info = _parent.info();
            var vertical = info.vertical;
            var containerOffset = getOffset(info.container);

            var key = vertical ? "top": "left";

            var offset = {top: 0, left: 0};
            offset[key] = (top - info.scrollPos) + containerOffset[key];

            offset.top += $(document).scrollTop();
            offset.left += $(document).scrollLeft();

            return offset;
        };

        /**
         * **Get** the current scroll offset for the start of the scene.
         * Mind, that the scrollOffset is related to the size of the container, if `triggerHook` is bigger than `0` (or `"onLeave"`).
         * This means, that resizing the container will influence the scene's start offset.
         * @public
         * @example
         * // get the current scroll offset for the start and end of the scene.
         * var start = scene.scrollOffset();
         * var end = scene.scrollOffset() + scene.duration();
         * console.log("the scene starts at", start, "and ends at", end);
         *
         * @returns {number} The scroll offset (of the container) at which the scene will trigger. Y value for vertical and X value for horizontal scrolls.
         */
        this.scrollOffset = function() {
            return _scrollOffset.start;
        };

        /*
         * ----------------------------------------------------------------
         * public functions (scene modification)
         * ----------------------------------------------------------------
         */

        /**
         * Update the Scene in the parent Controller to reflect the current state.
         * This is the equivalent to `ScrollMagic.updateScene(scene, immediately)`
         * @public
         * @example
         * // update the scene on next tick
         * scene.update();
         *
         * // update the scene immediately
         * scene.update(true);
         *
         * @fires ScrollScene.update
         *
         * @param {boolean} [immediately=false] - If `true` the update will be instant, if `false` it will wait until next tweenmax tick (better performance).
         * @returns {ScrollScene} Parent object for chaining.
         */
        this.update = function(immediately) {
            if (_parent) {
                if (immediately) {
                    if (_parent.enabled() && _enabled) {
                        var
                        scrollPos = _parent.info("scrollPos"),
                            newProgress;
                        // if triggerElement is set we need to update the start position as it may have changed.
                        if (_options.triggerElement !== null) {
                            updateScrollOffset();
                        }

                        if (_options.duration > 0) {
                            newProgress = (scrollPos - _scrollOffset.start) / (_scrollOffset.end - _scrollOffset.start);
                        } else {
                            newProgress = scrollPos >= _scrollOffset.start ? 1 : 0;
                        }

                        ScrollScene.trigger("update", {
                            startPos: _scrollOffset.start,
                            endPos: _scrollOffset.end,
                            scrollPos: scrollPos
                        });

                        ScrollScene.progress(newProgress);
                    } else if (_pin && _pin.css("position") == "fixed") {
                        updatePinState(true); // unpin in position
                    }
                } else {
                    _parent.updateScene(ScrollScene, false);
                }
            }
            return ScrollScene;
        };

        /**
         * **Get** or **Set** the scene's progress.
         * Usually it shouldn't be necessary to use this as a setter, as it is set automatically by scene.update().
         * @public
         * @example
         * // get the current scene progress
         * var progress = scene.progress();
         *
         * // set new scene progress
         * scene.progress(0.3);
         *
         * @fires {@link ScrollScene.enter}, when used as setter
         * @fires {@link ScrollScene.start}, when used as setter
         * @fires {@link ScrollScene.progress}, when used as setter
         * @fires {@link ScrollScene.end}, when used as setter
         * @fires {@link ScrollScene.leave}, when used as setter
         *
         * @param {number} [progress] - The new progress value of the scene `[0-1]`.
         * @returns {number} `get` -  Current scene progress.
         * @returns {ScrollScene} `set` -  Parent object for chaining.
         */
        this.progress = function(progress) {
            if (!arguments.length) { // get
                return _progress;
            } else { // set
                var
                doUpdate = false,
                    oldState = _state,
                    scrollDirection = _parent ? _parent.info("scrollDirection") : "PAUSED";

                if (progress <= 0 && _state !== 'BEFORE' && (progress >= _progress || _options.reverse)) {
                    // go back to initial state
                    _progress = 0;
                    _state = 'BEFORE';
                    doUpdate = true;
                } else if (progress > 0 && progress < 1 && (progress >= _progress || _options.reverse)) {
                    _progress = progress;
                    _state = 'DURING';
                    doUpdate = true;
                } else if (progress >= 1 && _state !== 'AFTER') {
                    _progress = 1;
                    _state = 'AFTER';
                    doUpdate = true;
                } else if (_state === "DURING" && !_options.reverse) {
                    updatePinState(); // in case we scrolled back and reverse is disabled => update the pin position, so it doesn't scroll back as well.
                }

                if (doUpdate) {
                    // fire events
                    var
                    eventVars = {
                        progress: _progress,
                        state: _state,
                        scrollDirection: scrollDirection
                    },
                        stateChanged = _state != oldState,
                        instantReverse = (_state === 'BEFORE' && _options.duration === 0);

                    if (stateChanged) {
                        if (_state === 'DURING' || _options.duration === 0) {
                            ScrollScene.trigger("enter", eventVars);
                        }
                        if (_state === 'BEFORE' || oldState === 'BEFORE') {
                            ScrollScene.trigger(instantReverse ? "end" : "start", eventVars);
                        }
                    }
                    ScrollScene.trigger("progress", eventVars);
                    if (stateChanged) {
                        if (_state === 'AFTER' || oldState === 'AFTER') {
                            ScrollScene.trigger(instantReverse ? "start" : "end", eventVars);
                        }
                        if (_state !== 'DURING' || _options.duration === 0) {
                            ScrollScene.trigger("leave", eventVars);
                        }
                    }
                }

                return ScrollScene;
            }
        };

        /**
         * Add a tween to the scene.
         * If you want to add multiple tweens, wrap them into one TimelineMax object and add it.
         * The duration of the tween is streched to the scroll duration of the scene, unless the scene has a duration of `0`.
         * @public
         * @example
         * // add a single tween
         * scene.setTween(TweenMax.to("obj"), 1, {x: 100});
         *
         * // add multiple tweens, wrapped in a timeline.
         * var timeline = new TimelineMax();
         * var tween1 = TweenMax.from("obj1", 1, {x: 100});
         * var tween2 = TweenMax.to("obj2", 1, {y: 100});
         * timeline
         * .add(tween1)
         * .add(tween2);
         * scene.addTween(timeline);
         *
         * @param {object} TweenMaxObject - A TweenMax, TweenLite, TimelineMax or TimelineLite object that should be animated in the scene.
         * @returns {ScrollScene} Parent object for chaining.
         */
        this.setTween = function(TweenMaxObject) {
            if (_tween) { // kill old tween?
                ScrollScene.removeTween();
            }
            try {
                // wrap Tween into a TimelineMax Object to include delay and repeats in the duration and standardize methods.
                _tween = new TimelineMax({
                    smoothChildTiming: true
                })
                    .add(TweenMaxObject)
                    .pause();
            } catch (e) {
                log(1, "ERROR calling method 'setTween()': Supplied argument is not a valid TweenMaxObject");
            } finally {
                // some propertties need to be transferred it to the wrapper, otherwise they would get lost.
                if (TweenMaxObject.repeat) { // TweenMax or TimelineMax Object?
                    if (TweenMaxObject.repeat() === -1) {
                        _tween.repeat(-1);
                        _tween.yoyo(TweenMaxObject.yoyo());
                    }
                }
                checkOptionsValidity();
                log(3, "added tween");
                updateTweenProgress();
                return ScrollScene;
            }
        };

        /**
         * Remove the tween from the scene.
         * @public
         * @example
         * // remove the tween from the scene without resetting it
         * scene.removeTween();
         *
         * // remove the tween from the scene and reset it to initial position
         * scene.removeTween(true);
         *
         * @param {boolean} [reset=false] - If `true` the tween will be reset to its initial values.
         * @returns {ScrollScene} Parent object for chaining.
         */
        this.removeTween = function(reset) {
            if (_tween) {
                if (reset) {
                    updateTweenProgress(0);
                }
                _tween.kill();
                _tween = undefined;
                log(3, "removed tween (reset: " + (reset ? "true" : "false") + ")");
            }
            return ScrollScene;
        };

        /**
 * Pin an element for the duration of the tween.
 * If the scene duration is 0 the element will never be unpinned.
 * Note, that pushFollowers has no effect, when the scene duration is 0.
 * @public
 * @example
 * // pin element and push all following elements down by the amount of the pin duration.
 * scene.setPin("#pin");
 *
 * // pin element and keeping all following elements in their place. The pinned element will move past them.
 * scene.setPin("#pin", {pushFollowers: false});
 *
 * @param {(string|object)} element - A Selctor, a DOM Object or a jQuery object for the object that is supposed to be pinned.
 * @param {object} [settings] - settings for the pin
 * @param {boolean} [settings.pushFollowers=true] - If `true` following elements will be "pushed" down for the duration of the pin, if `false` the pinned element will just scroll past them.
     Ignored, when duration is `0`.
 * @param {string} [settings.spacerClass="scrollmagic-pin-spacer"] - Classname of the pin spacer element, which is used to replace the element.
 * @param {string} [settings.pinnedClass=""] - Classname that should be added to the pinned element during pin phase (and removed after).
 *
 * @returns {ScrollScene} Parent object for chaining.
 */
        this.setPin = function(element, settings) {
            var
            defaultSettings = {
                pushFollowers: true,
                spacerClass: "scrollmagic-pin-spacer",
                pinnedClass: ""
            };
            settings = $.extend({}, defaultSettings, settings);

            // validate Element
            element = $(element).first();
            if (element.length === 0) {
                log(1, "ERROR calling method 'setPin()': Invalid pin element supplied.");
                return ScrollScene; // cancel
            } else if (element.css("position") == "fixed") {
                log(1, "ERROR: Pin does not work with elements that are positioned 'fixed'.");
                return ScrollScene; // cancel
            }

            if (_pin) { // preexisting pin?
                if (_pin === element) {
                    // same pin we already have -> do nothing
                    return ScrollScene; // cancel
                } else {
                    // kill old pin
                    ScrollScene.removePin();
                }

            }
            _pin = element;

            _pin.parent().hide(); // hack start to force jQuery css to return stylesheet values instead of calculated px values.
            var
            inFlow = _pin.css("position") != "absolute",
                pinCSS = _pin.css(["display", "top", "left", "bottom", "right"]),
                sizeCSS = _pin.css(["width", "height"]);
            _pin.parent().show(); // hack end.

            // create spacer
            var spacer = $("<div></div>")
                .addClass(settings.spacerClass)
                .css(pinCSS)
                .data("ScrollMagicPinSpacer", true)
                .css({
                    position: inFlow ? "relative" : "absolute",
                    "margin-left": "auto",
                    "margin-right": "auto",
                    "box-sizing": "content-box",
                    "-moz-box-sizing": "content-box",
                    "-webkit-box-sizing": "content-box"
                });

            if (!inFlow && settings.pushFollowers) {
                log(2, "WARNING: If the pinned element is positioned absolutely pushFollowers is disabled.");
                settings.pushFollowers = false;
            }

            // set the pin Options
            _pinOptions = {
                spacer: spacer,
                relSize: { // save if size is defined using % values. if so, handle spacer resize differently...
                    width: sizeCSS.width.slice(-1) === "%",
                    height: sizeCSS.height.slice(-1) === "%"
                },
                pushFollowers: settings.pushFollowers,
                inFlow: inFlow, // stores if the element takes up space in the document flow
                origStyle: _pin.attr("style"), // save old styles (for reset)
                pinnedClass: settings.pinnedClass // the class that should be added to the element when pinned
            };

            // if relative size, transfer it to spacer and make pin calculate it...
            if (_pinOptions.relSize.width) {
                spacer.css("width", sizeCSS.width);
            }
            if (_pinOptions.relSize.height) {
                spacer.css("height", sizeCSS.height);
            }

            // now place the pin element inside the spacer
            _pin.before(spacer)
                .appendTo(spacer)
            // and set new css
            .css({
                position: inFlow ? "relative" : "absolute",
                top: "auto",
                left: "auto",
                bottom: "auto",
                right: "auto"
            });

            // add listener to document to update pin position in case controller is not the document.
            $(window).on("scroll resize", updatePinInContainer);

            log(3, "added pin");

            // finally update the pin to init
            updatePinState();

            return ScrollScene;
        };

        /**
         * Remove the pin from the scene.
         * @public
         * @example
         * // remove the pin from the scene without resetting it (the spacer is not removed)
         * scene.removePin();
         *
         * // remove the pin from the scene and reset the pin element to its initial position (spacer is removed)
         * scene.removePin(true);
         *
         * @param {boolean} [reset=false] - If `false` the spacer will not be removed and the element's position will not be reset.
         * @returns {ScrollScene} Parent object for chaining.
         */
        this.removePin = function(reset) {
            if (_pin) {
                if (reset || !_parent) { // if there's no parent no progress was made anyway...
                    _pin.insertBefore(_pinOptions.spacer)
                        .attr("style", _pinOptions.origStyle);
                    _pinOptions.spacer.remove();
                } else {
                    if (_state === "DURING") {
                        updatePinState(true); // force unpin at position
                    }
                }
                $(window).off("scroll resize", updatePinInContainer);
                _pin = undefined;
                log(3, "removed pin (reset: " + (reset ? "true" : "false") + ")");
            }
            return ScrollScene;
        };

        /**
         * Add the scene to a controller.
         * This is the equivalent to `ScrollMagic.addScene(scene)`
         * @public
         * @example
         * // add a scene to a ScrollMagic controller
         * scene.addTo(controller);
         *
         * @param {ScrollMagic} controller - The controller to which the scene should be added.
         * @returns {ScrollScene} Parent object for chaining.
         */
        this.addTo = function(controller) {
            if (_parent != controller) {
                // new parent
                if (_parent) { // I had a parent before, so remove it...
                    _parent.removeScene(ScrollScene);
                }
                _parent = controller;
                checkOptionsValidity();
                updateScrollOffset();
                updatePinSpacerSize();
                _parent.info("container").on("resize", updateRelativePinSpacer);
                log(3, "added " + NAMESPACE + " to controller");
                controller.addScene(ScrollScene);
                ScrollScene.update();
                return ScrollScene;
            }
        };

        /**
         * **Get** or **Set** the current enabled state of the scene.
         * This can be used to disable this scene without removing or destroying it.
         * @public
         *
         * @example
         * // get the current value
         * var enabled = scene.enabled();
         *
         * // disable the scene
         * scene.enabled(false);
         *
         * @param {boolean} [newState] - The new enabled state of the scene `true` or `false`.
         * @returns {(boolean|ScrollScene)} Current enabled state or parent object for chaining.
         */
        this.enabled = function(newState) {
            if (!arguments.length) { // get
                return _enabled;
            } else if (_enabled != newState) { // set
                _enabled = !! newState;
                ScrollScene.update(true);
            }
            return ScrollScene;
        };

        /**
         * Remove the scene from its parent controller.
         * This is the equivalent to `ScrollMagic.removeScene(scene)`
         * The scene will not be updated anymore until you readd it to a controller.
         * To remove the pin or the tween you need to call removeTween() or removePin() respectively.
         * @public
         * @example
         * // remove the scene from its parent controller
         * scene.remove();
         *
         * @returns {ScrollScene} Parent object for chaining.
         */
        this.remove = function() {
            if (_parent) {
                _parent.info("container").off("resize", updateRelativePinSpacer);
                var tmpParent = _parent;
                _parent = undefined;
                log(3, "removed " + NAMESPACE + " from controller");
                tmpParent.removeScene(ScrollScene);
            }
            return ScrollScene;
        };

        /**
         * Destroy the scene and everything.
         * @public
         * @example
         * // destroy the scene without resetting the pin and tween to their initial positions
         * scene = scene.destroy();
         *
         * // destroy the scene and reset the pin and tween
         * scene = scene.destroy(true);
         *
         * @param {boolean} [reset=false] - If `true` the pin and tween (if existent) will be reset.
         * @returns {null} Null to unset handler variables.
         */
        this.destroy = function(reset) {
            this.removeTween(reset);
            this.removePin(reset);
            this.remove();
            this.off("start end enter leave progress change update change.internal progress.internal");
            log(3, "destroyed " + NAMESPACE + " (reset: " + (reset ? "true" : "false") + ")");
            return null;
        };

        /*
         * ----------------------------------------------------------------
         * EVENTS
         * ----------------------------------------------------------------
         */

        /**
         * Scene start event.
         * Fires whenever the scroll position its the starting point of the scene.
         * It will also fire when scrolling back up going over the start position of the scene. If you want something to happen only when scrolling down/right, use the scrollDirection parameter passed to the callback.
         *
         * @event ScrollScene.start
         *
         * @example
         * scene.on("start", function (event) {
         *  alert("Hit start point of scene.");
         * });
         *
         * @property {object} event - The event Object passed to each callback
         * @property {string} event.type - The name of the event
         * @property {ScrollScene} event.target - The ScrollScene object that triggered this event
         * @property {number} event.progress - Reflects the current progress of the scene
         * @property {string} event.state - The current state of the scene `"BEFORE"`, `"DURING"` or `"AFTER"`
         * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
         */
        /**
         * Scene end event.
         * Fires whenever the scroll position its the ending point of the scene.
         * It will also fire when scrolling back up from after the scene and going over its end position. If you want something to happen only when scrolling down/right, use the scrollDirection parameter passed to the callback.
         *
         * @event ScrollScene.end
         *
         * @example
         * scene.on("end", function (event) {
         *  alert("Hit end point of scene.");
         * });
         *
         * @property {object} event - The event Object passed to each callback
         * @property {string} event.type - The name of the event
         * @property {ScrollScene} event.target - The ScrollScene object that triggered this event
         * @property {number} event.progress - Reflects the current progress of the scene
         * @property {string} event.state - The current state of the scene `"BEFORE"`, `"DURING"` or `"AFTER"`
         * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
         */
        /**
         * Scene enter event.
         * Fires whenever the scene enters the "DURING" state.
         * Keep in mind that it doesn't matter if the scene plays forward or backward: This event always fires when the scene enters its active scroll timeframe, regardless of the scroll-direction.
         *
         * @event ScrollScene.enter
         *
         * @example
         * scene.on("enter", function (event) {
         *  alert("Entered a scene.");
         * });
         *
         * @property {object} event - The event Object passed to each callback
         * @property {string} event.type - The name of the event
         * @property {ScrollScene} event.target - The ScrollScene object that triggered this event
         * @property {number} event.progress - Reflects the current progress of the scene
         * @property {string} event.state - The current state of the scene `"BEFORE"`, `"DURING"` or `"AFTER"`
         * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
         */
        /**
         * Scene leave event.
         * Fires whenever the scene's state goes from "DURING" to either "BEFORE" or "AFTER".
         * Keep in mind that it doesn't matter if the scene plays forward or backward: This event always fires when the scene leaves its active scroll timeframe, regardless of the scroll-direction.
         *
         * @event ScrollScene.leave
         *
         * @example
         * scene.on("leave", function (event) {
         *  alert("Left a scene.");
         * });
         *
         * @property {object} event - The event Object passed to each callback
         * @property {string} event.type - The name of the event
         * @property {ScrollScene} event.target - The ScrollScene object that triggered this event
         * @property {number} event.progress - Reflects the current progress of the scene
         * @property {string} event.state - The current state of the scene `"BEFORE"`, `"DURING"` or `"AFTER"`
         * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
         */
        /**
         * Scene update event.
         * Fires whenever the scene is updated (but not necessarily changes the progress).
         *
         * @event ScrollScene.update
         *
         * @example
         * scene.on("update", function (event) {
         *  console.log("Scene updated.");
         * });
         *
         * @property {object} event - The event Object passed to each callback
         * @property {string} event.type - The name of the event
         * @property {ScrollScene} event.target - The ScrollScene object that triggered this event
         * @property {number} event.startPos - The starting position of the scene (in relation to the conainer)
         * @property {number} event.endPos - The ending position of the scene (in relation to the conainer)
         * @property {number} event.scrollPos - The current scroll position of the container
         */
        /**
         * Scene progress event.
         * Fires whenever the progress of the scene changes.
         *
         * @event ScrollScene.progress
         *
         * @example
         * scene.on("progress", function (event) {
         *  console.log("Scene progress changed.");
         * });
         *
         * @property {object} event - The event Object passed to each callback
         * @property {string} event.type - The name of the event
         * @property {ScrollScene} event.target - The ScrollScene object that triggered this event
         * @property {number} event.progress - Reflects the current progress of the scene
         * @property {string} event.state - The current state of the scene `"BEFORE"`, `"DURING"` or `"AFTER"`
         * @property {string} event.scrollDirection - Indicates which way we are scrolling `"PAUSED"`, `"FORWARD"` or `"REVERSE"`
         */
        /**
         * Scene change event.
         * Fires whenvever a property of the scene is changed.
         *
         * @event ScrollScene.change
         *
         * @example
         * scene.on("change", function (event) {
         *  console.log("Scene Property \"" + event.what + "\" changed to " + event.newval);
         * });
         *
         * @property {object} event - The event Object passed to each callback
         * @property {string} event.type - The name of the event
         * @property {ScrollScene} event.target - The ScrollScene object that triggered this event
         * @property {string} event.what - Indicates what value has been changed
         * @property {mixed} event.newval - The new value of the changed property
         */

        /**
         * Add one ore more event listener.
         * The callback function will be fired at the respective event, and an object containing relevant data will be passed to the callback.
         * @public
         *
         * @example
         * function callback (event) {
         *  console.log("Event fired! (" + event.type + ")");
         * }
         * // add listeners
         * scene.on("change update progress start end enter leave", callback);
         *
         * @param {string} name - The name or names of the event the callback should be attached to.
         * @param {function} callback - A function that should be executed, when the event is dispatched. An event object will be passed to the callback.
         * @returns {ScrollScene} Parent object for chaining.
         */
        this.on = function(name, callback) {
            if ($.isFunction(callback)) {
                var names = $.trim(name).toLowerCase()
                    .replace(/(\w+)\.(\w+)/g, '$1.' + NAMESPACE + '_$2') // add custom namespace, if one is defined
                .replace(/( |^)(\w+)( |$)/g, '$1$2.' + NAMESPACE + '$3'); // add namespace to regulars.
                $(ScrollScene).on(names, callback);
            } else {
                log(1, "ERROR calling method 'on()': Supplied argument is not a valid callback!");
            }
            return ScrollScene;
        };

        /**
         * Remove one or more event listener.
         * @public
         *
         * @example
         * function callback (event) {
         *  console.log("Event fired! (" + event.type + ")");
         * }
         * // add listeners
         * scene.on("change update", callback);
         * // remove listeners
         * scene.off("change update", callback);
         *
         * @param {string} name - The name or names of the event that should be removed.
         * @param {function} [callback] - A specific callback function that should be removed. If none is passed all callbacks to the event listener will be removed.
         * @returns {ScrollScene} Parent object for chaining.
         */
        this.off = function(name, callback) {
            var names = $.trim(name).toLowerCase()
                .replace(/(\w+)\.(\w+)/g, '$1.' + NAMESPACE + '_$2') // add custom namespace, if one is defined
            .replace(/( |^)(\w+)( |$)/g, '$1$2.' + NAMESPACE + '$3'); // add namespace to regulars.
            $(ScrollScene).off(names, callback);
            return ScrollScene;
        };

        /**
         * Trigger an event.
         * @public
         *
         * @example
         * this.trigger("change");
         *
         * @param {string} name - The name of the event that should be triggered.
         * @param {object} [vars] - An object containing info that should be passed to the callback.
         * @returns {ScrollScene} Parent object for chaining.
         */
        this.trigger = function(name, vars) {
            log(3, 'event fired:', name, "->", vars);
            var event = {
                type: $.trim(name).toLowerCase(),
                target: ScrollScene
            };
            if ($.isPlainObject(vars)) {
                event = $.extend({}, vars, event);
            }
            // fire all callbacks of the event
            $(ScrollScene).trigger(event);
            return ScrollScene;
        };

        // INIT
        construct();
        return ScrollScene;
    };

    /*
     * ----------------------------------------------------------------
     * global logging functions and making sure no console errors occur
     * ----------------------------------------------------------------
     */
    var
    console = (window.console = window.console || {}),
        loglevels = [
            "error",
            "warn",
            "log"
        ];
    if (!console['log']) {
        console.log = $.noop; // no console log, well - do nothing then...
    }
    $.each(loglevels, function(index, method) { // make sure methods for all levels exist.
        if (!console[method]) {
            console[method] = console.log; // prefer .log over nothing
        }
    });
    // debugging function
    var debug = function(loglevel) {
        if (loglevel > loglevels.length || loglevel <= 0) loglevel = loglevels.length;
        var now = new Date(),
            time = ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2) + ":" + ("00" + now.getMilliseconds()).slice(-3),
            method = loglevels[loglevel - 1],
            args = Array.prototype.splice.call(arguments, 1),
            func = Function.prototype.bind.call(console[method], console);

        args.unshift(time);
        func.apply(console, args);
    };
    // a helper function that should generally be faster than jQuery.offset() and can also return position in relation to viewport.
    var getOffset = function($elem, relativeToViewport) {
        var offset = {
            top: 0,
            left: 0
        },
            elem = $elem[0];
        if (elem) {
            if (elem.getBoundingClientRect) { // check if available
                var rect = elem.getBoundingClientRect();
                offset.top = rect.top;
                offset.left = rect.left;
                if (!relativeToViewport) { // clientRect is by default relative to viewport...
                    offset.top += $(document).scrollTop();
                    offset.left += $(document).scrollLeft();
                }
            } else { // fall back to jquery
                offset = $elem.offset() || offset; // if element has offset undefined (i.e. document) use 0 for top and left
                if (relativeToViewport) { // jquery.offset is by default NOT relative to viewport...
                    offset.top -= $(document).scrollTop();
                    offset.left -= $(document).scrollLeft();
                }
            }
        }
        return offset;
    };

})(jQuery);
