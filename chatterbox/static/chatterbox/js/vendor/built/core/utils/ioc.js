/**
 * Inversion of Control Container
 * @module built.core.utils.ioc
 */
define(function(require, exports, module){

    var marionette = require('marionette');
    var _ = require('underscore');


    var Component = marionette.Controller.extend({
        cls: null,
        kwargs:null,
        key:null,
        container: null,
        dependencies: null,

        constructor: function(options){
            marionette.Controller.prototype.constructor.apply(this, arguments);

            this.dependencies = [];
            _.extend(this, options);
        },

        depends: function(key, cls, kwargs){
            this.dependencies.push(new Component({cls:cls, kwargs:kwargs, key:key}));
            return this;
        },

        call: function(kwargs){
            var args = {};
            kwargs = kwargs || {};

            _.map(this.dependencies, function(x){
                var data = {};
                var obj = x.call(x.kwargs);
                data[x.key] = obj;
                _.extend(args, data);
            });

            target = this.cls;

            if(_.isFunction(target)){
                obj = new target(_.extend(args, kwargs));
                return obj;
            } else {
                return target;
            }

        }
    });

    var Container = marionette.Controller.extend(
    /** @lends built.core.utils.ioc.Container.prototype */
    {
        registry: {},

        /**
         * Creates a new Container
         *
         * @constructs
         * @extends marionette.Controller
         * @param {object} [options] Options for Initialization
         *
         */
        constructor: function(options) {
            marionette.Controller.prototype.constructor.apply(this, arguments);
        },

        register: function(name, cls, kwargs){
            var component = new Component({cls:cls});
            component.container = this;
            this.registry[name.toLowerCase()] = component;
            return component;
        },

        resolve: function(name){
            name = name.toLowerCase();
            var component = this.registry[name];
            return component.call();
        }
    });

    exports.Container = Container;
});

