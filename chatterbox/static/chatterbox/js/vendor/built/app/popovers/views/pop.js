/**
 * Pop View
 * @module built.app.popovers.views.pop
 */
define(function(require, exports, module) {

var _ = require('underscore');
var marionette = require('marionette');
var dom = require('built/ui/helpers/dom');
var keys = require('built/app/keys');
var ClickTestResponder = require('built/core/responders/clicks').ClickTestResponder;

var PopView = marionette.View.extend(
/** @lends built.app.popovers.views.pop.PopView.prototype */
{
    view: null,
    defaultEdge: 'bottom',

    /**
     * Creates a new PopView
     *
     * @constructs
     * @extends marionette.View
     * @param {object} [options] Options for Initialization
     *
     */
    constructor: function(){
        marionette.View.prototype.constructor.apply(this, arguments);
    },

    show: function(view, options){
        options = options || {};

        if(this.deferred){
            this.deferred.reject();
        }

        this.deferred = $.Deferred();

        var rect; // {x, y, width, height} or jquery Element

        if (!options.rect) throw new Error('Must provide at least a \'rect\' option');

        if(this.currentView) this.destroy();

        rect = options.rect;

        if(rect instanceof jQuery){
            this._anchorElement = rect;
            rect = this.rectForAnchorElement(anchorElement);
        } else {
            this._anchorElement = options.anchorElement || null;
        }

        view.render();

        this.open(view);

        this.currentView = view;
        this._anchorRect = rect;
        this._anchorEdge = options.anchor || this.defaultEdge;

        // because we need the object to have it's final dimensions
        // for positioning, we trigger show on the child view
        // before it's *technically* shown in case the view
        // adds items to it's collection onShow etc, which could
        // alter the dimensions.
        marionette.triggerMethod.call(view, 'show');

        this.showRelativeToRect(rect, options.anchor);

        marionette.triggerMethod.call(this, 'show', view);

        return this.deferred.promise();
    },

    rectForAnchorElement: function($el){
        var clientRect = dom.getElementBounds($el);
        var rect = {
            x: clientRect.left,
            y: clientRect.top,
            width: $el.prop('scrollWidth'),
            height: $el.prop('scrollHeight')};

        return rect;
    },

    showRelativeToRect: function(rect, edge){
        // Warning, if you call this directly, you will be
        // responsible for repositioning the the view
        // if something related in your viewport changes.
        // Chances are you wanted show() instead
        // of calling this directly.

        // don't show anything until after layout has happened
        this.$el.css({
            position: 'absolute',
            visibility: 'hidden',
            zIndex: 1
        });


        // we need this in the DOM first so we can
        // get some measurements. This is primiarily
        // for an anchor edge of 'top'
        if(this._anchorElement){
            this._anchorElement.append(this.$el);

            if(this._anchorElement.prop('style').position != 'relative'){
                this._anchorElement.css({position: 'relative'});
            }

        } else {
            $('body').append(this.el);
        }

        this.layout();
        this.$el.css({visibility: 'visible'});
    },

    layout: function(){
        var viewBounds = dom.getElementBounds(this.currentView.$el);

        // the view.$el could have an absolutely positioned
        // element, etc inside of it. getElementBounds would
        // report the improper dimensions, so we make the corrective
        // adjustement using scrollWidth and scrollHeight of
        // view.$el's parent container aka this.$el
        var viewRect = {
            x: viewBounds.left,
            y: viewBounds.top,
            width: this.$el.prop('scrollWidth'),
            height: this.$el.prop('scrollHeight')
        };

        var css = {};

        if(_.isFunction(this._anchorEdge)){

            this._anchorEdge(
                this._anchorRect,
                this._anchorElement,
                viewRect,
                css);

        } else {

            this.defaultLayout(
                this._anchorEdge,
                this._anchorRect,
                this._anchorElement,
                viewRect,
                css);
        }

        this.$el.css(css);
    },

    defaultLayout: function(anchorEdge, anchorRect, $anchorElement, viewRect, css){
        switch(anchorEdge){
            case 'bottom':
                this.anchorBottom(anchorRect, $anchorElement, viewRect, css);
                break;

            case 'top':
                this.anchorTop(anchorRect, $anchorElement, viewRect, css);
                break;

            case 'left':
                this.anchorLeft(anchorRect, $anchorElement, viewRect, css);
                break;

            case 'right':
                this.anchorRight(anchorRect, $anchorElement, viewRect, css);
                break;
        }
    },

    // generic layout methods
    anchorBottom: function(anchorRect, $anchorElement, viewRect, css){
        css.top = anchorRect.y + anchorRect.height;
        css.left = anchorRect.x;
    },

    anchorRight: function(anchorRect, $anchorElement, viewRect, css){
        css.top = anchorRect.y;
        css.left = anchorRect.x + anchorRect.width;
    },

    anchorLeft: function(anchorRect, $anchorElement, viewRect, css){
        css.top = anchorRect.y;
        css.left = anchorRect.x;
    },

    anchorTop: function(anchorRect, $anchorElement, viewRect, css){
        css.top = anchorRect.y;
        css.left = anchorRect.x;
    },

    performKeyEquivalent: function(e){
        return false;
    },

    keyDown: function (e){
        // if escape is pressed while this pop view is
        // displayed, auto wire up closing it.
        if (e.keyCode == 27){ // ESCAPE
            this.destroy();
        }

        // no matter what we stop the key event
        // propagation here.
        return true;
    },

    wantsDismissFromClick: function(){
        this.destroy();
    },

    open: function(view){
        this.$el.empty().append(view.el);

        // ensure the relationship is maintained
        // any key presses should be handled first
        // by the this.view. If it chooses not to handle
        // then, then we get our chance to handle them here.
        keys.registerInResponderChain(this);
        keys.registerInResponderChain(view);

        // if we click anywhere outside of this
        // pop view, we want this view to destroy.
        this._clicks = new ClickTestResponder({
            el: view.$el,
            clickOutside: _.bind(this.wantsDismissFromClick, this)
        });

        view.once('complete', _.bind(this.destroy, this));
    },

    destroy: function(){
        keys.removeFromResponderChain(this.currentView);
        keys.removeFromResponderChain(this);
        this._clicks.destroy();

        this.$el.remove();

        // save the view as Region.destroy will
        // delete this.currentView
        var view = this.currentView;
        marionette.Region.prototype.destroy.call(this);

        this.deferred.resolve(view);
        this.deferred = null;
    },
});

exports.PopView = PopView;

});


