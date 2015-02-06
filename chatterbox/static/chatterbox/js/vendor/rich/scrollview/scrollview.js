define(function(require, exports, module) {
    var marionette = require('marionette');
    var rich = require('rich');
    var richUtils = require('rich/utils');
    var Surface = require('famous/core/Surface');
    var View = require('../view').FamousView;
    var GenericSync = require('famous/inputs/GenericSync');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Engine = require('famous/core/Engine');
    var Particle = require('famous/physics/bodies/Particle');
    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var TouchSync = require('famous/inputs/TouchSync');
    var ScrollSync = require('famous/inputs/ScrollSync');
    var MouseSync = require('famous/inputs/MouseSync');
    var EventHandler = require('famous/core/EventHandler');
    var Transitionable = require("famous/transitions/Transitionable");
    var events = require('../events');
    var SimpleDriver = require('./scroll-drivers/simple').SimpleDriver;
    var constraints = require('rich/autolayout/constraints');
    var utils = require('./utils');

    GenericSync.register({
        "touch": TouchSync,
        "scroll": ScrollSync,
        "mouse": MouseSync
    });

    var DIRECTION_X = GenericSync.DIRECTION_X;
    var DIRECTION_Y = GenericSync.DIRECTION_Y;

    var ScrollView = View.extend({
        _isUserScrolling: false,
        renderable: null,
        nestedSubviews: true,
        _hasStalledCount: 0,
        _idleIncrement: 0,
        _directionalLockEnabled: true,
        _scrollEnabled: true,
        _previousScrollUpdate: null,
        _isInAnimatedScroll: false,
        _currentVelocity:[0, 0],

        constraints: function() {
            if(!this._scrollableView) return;
            return [
                'H:|[_scrollableView]|',
                'V:|[_scrollableView]|',
            ];
        },

        constructor: function(options) {
            options || (options = {});
            _.bindAll(this, '_onScrollUpdate', '_onScrollStart', '_onScrollEnd', 'triggerScrollUpdate');

            this.positionX = new Transitionable(0);
            this.positionY = new Transitionable(0);

            // physics
            this._particle = new Particle();
            this._physicsEngine = new PhysicsEngine();
            this._physicsEngine.addBody(this._particle);

            // transitionables setup
            this._scrollModifier = new Modifier();
            this.bindParticle();


            // scrollable wrapper
            this._scrollableView = new rich.Region({
                modifier: this._scrollModifier
            });

            this.contentSize = options.contentSize || this.contentSize || [0, 0];
            this.scrollType = options.scrollType || this.scrollType || ['touch', 'wheel'];


            View.prototype.constructor.apply(this, arguments);

            this.addSubview(this._scrollableView);

            this._scrollHandler = new EventHandler();



            // options
            this.direction = options.direction;

            this.hidesOverflow = _.isUndefined(options.hidesOverflow) ? true : options.hidesOverflow;

            this.perspective = options.perspective || false;

            // set up the scroll driver
            var ScrollDriver = options.scrollDriver || SimpleDriver;
            this._driver = new ScrollDriver({
                scrollView: this,
                physicsEngine: this._physicsEngine,
                particle: this._particle,
                direction: this.direction
            });

            this.on('show', this.wantsSetPerspective);

            if (!_.isUndefined(options.directionalLockEnabled)) {
                this._directionalLockEnabled = options.directionalLockEnabled;
            }
            if (!_.isUndefined(options.scrollEnabled)) {
                this._scrollEnabled = options.scrollEnabled;
            }

            this.listenTo(this._scrollableView, events.RENDER, this._onFamousRender);
        },

        bindParticle: function(){
            this._scrollModifier.transformFrom(function(){
                this._particle.setPosition([this.positionX.get(), this.positionY.get()])
                return Transform.translate(this.positionX.get(), this.positionY.get(), 0);
            }.bind(this));
        },

        unbindParticle: function(){
            this._scrollModifier.transformFrom(function(){
                var pos = this._particle.getPosition();
                return Transform.translate(pos[0], pos[1], 0);
            }.bind(this))
        },

        wantsSetPerspective: function() {
            if (this.perspective) {
                if(this.nestedSubviews){
                    this.container.context.setPerspective(this.perspective);
                }else{
                    this.context.setPerspective(this.perspective);
                }
            }
        },

        setDirectionalLockEnabled: function(val) {
            this._directionalLockEnabled = val;
        },

        getDirectionalLockEnabled: function() {
            return this._directionalLockEnabled;
        },

        setScrollEnabled: function(val) {
            this._scrollEnabled = val;
            if (!this.sync) return;
            if (this._scrollEnabled) {
                this.sync.on('start', this._onScrollStart);
                this.sync.on('update', this._onScrollUpdate);
                this.sync.on('end', this._onScrollEnd);
            } else {
                this.sync.removeListener('start', this._onScrollStart);
                this.sync.removeListener('update', this._onScrollUpdate);
                this.sync.removeListener('end', this._onScrollEnd);
            }
        },

        getScrollEnabled: function() {
            return this._scrollEnabled;
        },

        getContentSize: function() {
            return _.result(this, 'contentSize');
        },

        onShow: function() {
            if(!this.$el && !this.nestedSubviews){
                this.$el = $(this.context.container);
            }
            if (this.hidesOverflow) {
                this.$el.css({
                    overflow: 'hidden',
                    // border: '1px solid red',
                });
            }

            // we have to map the events into an event handler so it conforms
            // to how famous wants things, this listens to all these events and has
            // the event handler dispatch them out
            this._bindScrollEvents();

        },

        getScrollPosition: function() {
            return [this.positionX.get(), this.positionY.get()];
            var pos = this._scrollableView._spec.target.transform.splice(12, 2);
            return pos;
        },

        getScrollVelocity: function(){
            return this._currentVelocity || [0, 0];
        },

        _cleanScrollPosition: function(x, y) {
            var contentSize = this.getContentSize();
            var containerSize = this.getSize();

            var xLimit = -Math.max(contentSize[0] - containerSize[0], 0);
            var yLimit = -Math.max(contentSize[1] - containerSize[1], 0);
            x = Math.max(x, xLimit);
            x = Math.min(x, 0);

            y = Math.max(y, yLimit);
            y = Math.min(y, 0);
            return [x, y];
        },

        setScrollPosition: function(x, y, transition, limit) {
            this.clearScrollAnimations();
            this.halt();
            // should we do something?
            var currPos = this.getScrollPosition();
            if(currPos[0] == x && currPos[1] == y){
                return;
            }

            this._scrollableView.setNeedsDisplay(true);
            limit = _.isUndefined(limit) ? true : limit;
            if (limit) {
                var pos = this._cleanScrollPosition(x, y);
                x = pos[0];
                y = pos[1];
            }

            if (transition) {
                var obj = this._prepareScrollModification(transition.duration);
                this._scrollAnimationCallback = obj.callback;
                this.positionY.set(y, transition, obj.callback);
                this.positionX.set(x, transition, obj.callback);
                return obj.deferred;
            } else {
                this.positionX.set(x, {
                    duration: 0
                });
                this.positionY.set(y, {
                    duration: 0
                });
                this.invalidate();
            }
        },

        invalidate: function(){
            this._scrollableView.invalidateView();
        },

        invalidateLayout: function(){

            richUtils.defer(function(){
                this.update();
            }.bind(this));

            View.prototype.invalidateLayout.apply(this, arguments);
        },

        _getVelocityForPositions: function(pos1, pos2, time){
            var xDiff = pos2[0] - pos1[0];
            var yDiff = pos2[1] - pos1[1];
            return [xDiff/time, yDiff/time];
        },

        _prepareScrollModification: function(duration) {
            var deferred = $.Deferred();

            var self = this;

            var tick = function() {

                self._isInAnimatedScroll = true;
                self.triggerScrollUpdate();
                self._scrollableView.invalidateView();

            };

            var callback = function() {
                Engine.removeListener('postrender', tick);
                this._isInAnimatedScroll = false;
                this._currentVelocity = null;
                deferred.resolve(this);
            }.bind(this);
            if (!duration) {
                this.invalidate()
            } else {
                Engine.on('postrender', tick);
            }

            return {
                deferred: deferred.promise(),
                callback: callback
            };
        },



        show: function(view) {
            this._scrollableView.show(view);
        },

        reset: function() {
            this._scrollableView.reset();
            this.update();
        },

        update: function() {
            this._onScrollUpdate({
                delta:[0,0],
                velocity:[0,0]
            });
        },

        halt: function(){
            this._driver.halt();
            this.positionX.halt();
            this.positionY.halt();
            this.clearScrollAnimations();
            this._particle.setVelocity([0, 0]);
            this.bindParticle();
        },

        _onFamousRender: function() {
            var v = this._particle.getVelocity();
            var xVelocity = Math.round(Math.abs(v[0])*1000);
            var yVelocity = Math.round(Math.abs(v[1])*1000);

            // famous requires that you get the position every frame or else
            // it won't update the value of that item.  this normally happens
            // by doing a positionFrom, but because we turn that on and off
            // we have to manually get the position for it to update each frame
            this._particle.getPosition();

            if(yVelocity === 0 && xVelocity === 0){
                this._idleIncrement ++;
            }else{
                this._idleIncrement = 0;
            }

            // if the velocity has sat at 0 for 300 frames, kill the render
            if(this._idleIncrement > 800){
                this._scrollableView.setNeedsDisplay(false);
            }
        },

        _bindScrollEvents: function() {
            var self = this;
            $(window).mouseout(function(e){
                e = e.originalEvent;
                var from = e.relatedTarget || e.toElement;
                if (!from || from.nodeName == "HTML") {
                    self._scrollHandler.emit('mouseup', e.originalEvent);
                }
            });
            var events = [];

            if(_.contains(this.scrollType, 'touch')){
                events = events.concat(['touchstart', 'touchmove', 'touchend']);
            }
            if(_.contains(this.scrollType, 'wheel')){
                events = events.concat(['mousewheel', 'wheel']);
            }
            if(_.contains(this.scrollType, 'mouse')){
                events = events.concat(['mousedown', 'mousemove', 'mouseup']);
            }


            _.each(events, function(type) {
                this.$el.on(type, function(e) {
                    var $target = $(e.target);
                    var closest = $target.closest('.scroll-ignore');
                    if(closest.length)return;
                    self._scrollType = type;
                    self._scrollHandler.emit(type, e.originalEvent);
                });
            }, this);

            this.sync = new GenericSync({
                "scroll": {},
                "touch": {},
                "mouse": {
                    scale: 5
                }
            });

            if (this._scrollEnabled) {
                this.sync.on('start', this._onScrollStart);
                this.sync.on('update', this._onScrollUpdate);
                this.sync.on('end', this._onScrollEnd);
            }


            this._scrollHandler.pipe(this.sync);
        },

        _onScrollStart: function(data) {
            this._isUserScrolling = true;
            this._scrollDirection = null;
            this._idleIncrement = 0;
            this.trigger('scroll:start', this.getScrollPosition());
        },


        _onScrollEnd: function(data) {
            this._isUserScrolling = false;
            this._driver.wantsThrow(data.velocity, this._scrollType);
            this.trigger('scroll:end', this.getScrollPosition());
        },

        isUserScrolling: function(){
            return this._isUserScrolling;
        },

        _setScrollDirection: function(delta) {
            if (!this._scrollDirection) {
                var x = Math.abs(delta[0]);
                var y = Math.abs(delta[1]);
                if (x > y) {
                    this._scrollDirection = 'x';
                } else {
                    this._scrollDirection = 'y';
                }
            }
        },

        triggerScrollUpdate: function(){
            this._updateScrollVelocity();
            this.trigger('scroll:update', this.getScrollPosition());
        },

        _updateScrollVelocity: function(){

            currTickTime = new Date().getTime();
            currTickPos = this.getScrollPosition();
            if(this._prevTickPos && this._prevTickTime){
                var tickDiff =  currTickTime - this._prevTickTime;
                this._currentVelocity = this._getVelocityForPositions(this._prevTickPos, currTickPos, tickDiff);
            }
            this._prevTickPos = currTickPos;
            this._prevTickTime = currTickTime;
        },



        _shouldScroll: function(contentSize, containerSize) {
            if (this.direction == DIRECTION_X) {
                if (contentSize[0] > containerSize[0]) return true;
            } else if (this.direction == DIRECTION_Y) {
                if (contentSize[1] > containerSize[1]) return true;
            } else {
                // need more testing around this
                return true;
            }
            return false;
        },


        clearScrollAnimations: function(){
            if(this._scrollAnimationCallback){
                this._scrollAnimationCallback();
            }
        },

        getBoundsInfo: function(delta){
            var gotoPosX = this.positionX.get() + delta[0];
            var gotoPosY = this.positionY.get() + delta[1];
            var contentSize = this.getContentSize();
            var containerSize = this.getSize();
            var scrollableDistanceX = contentSize[0] - containerSize[0];
            var scrollableDistanceY = contentSize[1] - containerSize[1];

            var isPastTop = gotoPosY >= 0;
            var isPastBottom = scrollableDistanceY + gotoPosY <= 0;
            var isPastLeft = gotoPosX >= 0;
            var isPastRight = scrollableDistanceX + gotoPosX <= 0;

            var isOutOfBoundsY = isPastTop || isPastBottom;
            var isOutOfBoundsX = isPastLeft || isPastRight;

            var anchorPoint = [gotoPosX, gotoPosY, 0];
            var isPastLimits = false;

            var outOfBoundsX = gotoPosX;
            var outofBoundsY = gotoPosY;
            if(isOutOfBoundsX && this.direction != DIRECTION_Y){
                outOfBoundsX = isPastRight ? -scrollableDistanceX : 0;
                anchorPoint[0] = outOfBoundsX;
                isPastLimits = true;
            }
            if(isOutOfBoundsY && this.direction != DIRECTION_X){
                outofBoundsY = isPastBottom ? -scrollableDistanceY : 0;
                anchorPoint[1] = outofBoundsY;
                isPastLimits = true;
            }

            return {
                gotoPosX: gotoPosX,
                gotoPosY: gotoPosY,
                isPastLimits: isPastLimits,
                anchorPoint: anchorPoint,
                contentSize: contentSize,
                containerSize: containerSize
            };
        },

        _onScrollUpdate: function(data) {
            // if you were animating a scroll, this will kill it
            this.clearScrollAnimations();

            var delta = data.delta;
            this._previousScrollUpdate = data;

            // cache the direction for all future movement until you start again
            this._setScrollDirection(delta);

            // depending on the direction you are scrolling, this will normalize the data
            // setting the other direction to 0, stopping any scroll in that direction
            delta = utils.normalizeVector(delta, this.direction);

            // dampen the delta so it feels right between mobile and desktop
            delta = this._driver.dampenDelta(data.delta, this._scrollType);

            // run calculations based on variables, spit back needed data
            var boundsInfo = this.getBoundsInfo(delta);


            // stop scrolling if size doesn't warrent it
            var shouldScroll =  this._shouldScroll(boundsInfo.contentSize, boundsInfo.containerSize);
            if(!shouldScroll)return;


            // we check with the driver to see if it wants to limit the position of the
            // scroll when we are updating via scroll
            this.setScrollPosition(boundsInfo.gotoPosX, boundsInfo.gotoPosY, null, this._driver.shouldLimitPastBounds());

            // give the driver an opportunity to take control of the particle
            // add a bounce for example
            this._driver.updateParticle(boundsInfo.isPastLimits, boundsInfo.anchorPoint, data.velocity);


            // trigger event handler
            this.triggerScrollUpdate();
        },

    });

    exports.ScrollView = ScrollView;
    exports.DIRECTION_X = DIRECTION_X;
    exports.DIRECTION_Y = DIRECTION_Y;
});
