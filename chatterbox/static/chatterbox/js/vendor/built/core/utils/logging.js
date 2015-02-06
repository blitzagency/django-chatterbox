define(function(require, exports, module){

    var _ = require('underscore');
    var _loggers = {};
    var _levelNames = {
            0: 'NOTSET',
            1: 'TRACE',
            2: 'DEBUG',
            3: 'INFO',
            4: 'WARN',
            5: 'ERROR',
            NOTSET: 0,
            TRACE: 1,
            DEBUG: 2,
            INFO: 3,
            WARN: 4,
            ERROR: 5};

    var PlaceHolder = function(options){
        var logger = options.logger;
        // we can't store objects as keys of objects
        // in JS, So we'd either have to implement a HashTable:
        // http://stamat.wordpress.com/2013/07/03/javascript-quickly-find-very-large-objects-in-a-large-array/
        // or for now just use _.intersection to ensure we don't
        // have duplicates. Going to assume we won't have a ton of
        // objects here, or this will get nas-tay-tay O(N) baby!

        this.loggerMap = [logger];
        //this.loggerMap[logger] = null;
    };

    _.extend(PlaceHolder.prototype, {
        append: function(logger){
            // see PlaceHolder constructor above for why we are
            // doing this with arrays. =(
            if (_.intersection(this.loggerMap, [logger]).length === 0){
                this.loggerMap.push(logger);
            }

            // if (!_.has(this.loggerMap, logger)){
            //     this.loggerMap[logger] = null;
            // }
        }
    });

    var Logger = function(options){
        var level = options.level || _levelNames.NOTSET;
        options.level = _checkLevel(level);

        _.extend(this, options);

        var noop = function(){};

        this.trace = noop;
        this.debug = noop;
        this.info = noop;
        this.warn = noop;
        this.error = noop;
    };

    _.extend(Logger.prototype, {

        setLevel: function(level){
            this.level = _checkLevel(level);

            var prefix = this.name;

            _.each(_loggers, function(v, k){
                if (k.indexOf(prefix) === 0 && v instanceof Logger){
                    _applyLevelLoggers(v);
                }
            });
        },

        isEnabledFor: function(level){
            return level >= this.getEffectiveLevel();
        },

        getEffectiveLevel: function(){
            var logger = this;
            while(logger){
                if(logger.level){
                    return logger.level;
                }

                logger = logger.parent;
            }

            return 0;
        }
    });

    function config(data){
        _.each(data.loggers, function(v, k){
            var logger = getLogger(k);
            logger.setLevel(v.level);
        });
    }

    function getLogger(name){
        name = name || 'root';
        var result = null;

        if (_.has(_loggers, name)){
            result = _loggers[name];

            if (result instanceof PlaceHolder){
                var placeholder = result;
                result = new Logger({name: name});
                _loggers[name] = result;
                _applyChildren(placeholder, result);
                _applyParents(result);
                _applyLevelLoggers(result);
            }

        } else {
            result = new Logger({name: name});
            _loggers[name] = result;
            _applyParents(result);
            _applyLevelLoggers(result);
        }

        return result;
    }

    function _applyLevelLoggers(logger){
        var maxLevel = _levelNames.ERROR;
        var noop = function(){};

        while (maxLevel > 0){
            var name = _levelNames[maxLevel].toLowerCase();

            if (logger.isEnabledFor(maxLevel)){
                logger[name] = _consoleMethod(name);
            } else {
                logger[name] = noop;
            }

            maxLevel--;
        }
    }

    function _applyChildren(placeholder, logger){
        var name = logger.name,
            namelen = name.length;

        // assumes array, not object which would be (value, key)
        // for the args to the _.each function.
        // if PlaceHolder changes to use objects/HashTables, this
        // will potentiall need to change also, depending on how the
        // new data structure iterates.
        _.each(placeholder.loggerMap, function(c){
            if(c.parent.name.substring(0, namelen) != name){
                logger.parent = c.parent;
                c.parent = logger;
            }
        });
    }

    function _applyParents(logger){
        var name = logger.name,
            i = name.lastIndexOf('.'),
            parts = name.substring(0, i).split('.'),
            result = null;

        while (parts.length > 0 && !result){
            var substr = parts.join('.');

            if(!_.has(_loggers, substr)){
                _loggers[substr] = new PlaceHolder({logger:logger});
            } else {
                var obj = _loggers[substr];

                if (obj instanceof Logger){
                    result = obj;
                } else {

                    if(obj instanceof PlaceHolder){
                        obj.append(logger);
                    }
                }
            }
            parts.pop();
        }

        if (!result){
            result = _loggers.root;
        }

        logger.parent = result;
    }

    function _checkLevel(level){
        // is int?
        if (typeof level === 'number' && level % 1 === 0){
            return level;
        }

        return _levelNames[level.toUpperCase()];
    }

    // the following 2 functions courtesy of:
    // https://github.com/pimterry/loglevel/blob/master/lib/loglevel.js#L23-L46

    function _consoleMethod(name){
        var noop = function () {};

        if (typeof console === 'undefined') {
                return noop;
        } else if (console[name] === undefined) {
            return _bindToConsole(console, 'log') || noop;
        } else {
            return _bindToConsole(console, name);
        }
    }

    function _bindToConsole(console, methodName) {
        var method = console[methodName];

        if (method.bind === undefined) {
            if (Function.prototype.bind === undefined) {
                return function() {
                    method.apply(console, arguments);
                };
            } else {
                return Function.prototype.bind(console);
            }
        } else {
            return method.bind(console);
        }
    }

    _loggers.root = new Logger({'name': 'root', 'level':'notset'});
    module.exports.getLogger = getLogger;
    module.exports.config = config;

});

