define(function(require, exports, module) {

var PhysicsEngine = require('famous/physics/PhysicsEngine');
var Particle = require('famous/physics/bodies/Particle');
var Spring = require('famous/physics/forces/Spring');
var Drag = require('famous/physics/forces/Drag');
var TouchSync = require('famous/inputs/TouchSync');
var ScrollSync = require('famous/inputs/ScrollSync');
var Engine = require('famous/core/Engine');
var MouseSync = require('famous/inputs/MouseSync');
var events = require('../../events');
var SimpleDriver = require('./simple').SimpleDriver;
var GenericSync = require('famous/inputs/GenericSync');

var BounceDriver = SimpleDriver.extend({
    _hasSpring: false,
    mobileStrength:0.003,
    strength: 0.005,
    constructor: function(options) {
        SimpleDriver.prototype.constructor.apply(this, arguments);
        this._spring = new Spring({
            period: 300,
            dampingRatio: 1
        });
    },

    shouldLimitPastBounds: function(){
        return false;
    },

    updateParticle: function(isPastLimits, anchorPoint, velocity) {
        var springOptions = {
            anchor: anchorPoint
        };

        if(this._throwMod){
            this._throwMod.callback();
        }
        if (isPastLimits) {
            this._spring.setOptions(springOptions);

            if (!this._hasSpring) {
                // add a spring
                this.scrollView.unbindParticle();
                this._particle.setVelocity(0);
                this._physicsEngine.attach([this._spring], this._particle);
                this._hasSpring = true;
                // this.scrollView._scrollableView.setNeedsDisplay(true);
                // this.scrollView._scrollableView.on(events.RENDER, this.scrollView.triggerScrollUpdate);
            }

            // trackpad adds velocity and keeps triggering wheel events
            // that means that after you release the touchpad, you'll keep getting
            // those events.  if you're past the limits and scroll events keep
            // happening, we want to update the position to the limiting
            // location of the scroll every 'wheel' event
            this.scrollView.positionX.set(anchorPoint[0]);
            this.scrollView.positionY.set(anchorPoint[1]);

        } else {
            if (this._hasSpring) {
                this._physicsEngine.detachAll();
                this.scrollView.bindParticle();
                this._particle.setVelocity(0);
                this._hasSpring = false;
                this.scrollView._scrollableView.setNeedsDisplay(false);
                this.scrollView._scrollableView.off(events.RENDER, this.scrollView.triggerScrollUpdate);
            }
        }
    },

    _updateScrollviewVariables: function(){
        var delta = [];
        var pos = this._particle.getPosition();
        delta[0] = this.scrollView.positionX.get() - pos[0];
        delta[1] = this.scrollView.positionY.get() - pos[1];
        this.scrollView.positionX.set(pos[0]);
        this.scrollView.positionY.set(pos[1]);
        return delta;
    },

    _prepareThrowModification: function() {
        var deferred = $.Deferred();

        var tick = function() {
            var delta = this._updateScrollviewVariables();
            var boundsInfo = this.scrollView.getBoundsInfo(delta);

            if(boundsInfo.isPastLimits && !this._thrownPastLimits){
                var velocity = this._particle.getVelocity();

                this._physicsEngine.detachAll();

                this._spring.setOptions({
                    anchor: boundsInfo.anchorPoint
                });
                this._physicsEngine.attach([this._drag, this._friction, this._spring], this._particle);
                this._thrownPastLimits = true;
            }

            this.scrollView.invalidate();
            this.scrollView.triggerScrollUpdate();
            var v = this._particle.getVelocity();
            if(Math.abs(v[0]) < 0.001 && Math.abs(v[1]) < 0.001){
                callback();
            }
        }.bind(this);

        var callback = function() {
            Engine.removeListener('postrender', tick);
            deferred.resolve(this);
            this._thrownPastLimits = false;
        }.bind(this);

        Engine.on('postrender', tick);

        return {
            deferred: deferred.promise(),
            callback: callback
        };
    },
});

exports.BounceDriver = BounceDriver;

});
