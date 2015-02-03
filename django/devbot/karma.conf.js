// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'requirejs'],

    files: [
        {pattern: 'project/static/js/common.js', included: true},
        {pattern: 'project/static/js/app/**/*.js', included: false},
        {pattern: 'project/static/js/app/**/*.html', included: false},
        {pattern: 'project/static/js/vendor/**/*.js', included: false, served: true},
        {pattern: 'project/static/js/specs/**/*.js', included: false, served: true},
        {pattern: 'project/static/js/specs/**/*.html', included: false, served: true},
        {pattern: 'project/static/js/specs/**/*.png', included: false, served: true},
        {pattern: 'project/static/js/specs/**/*.jpg', included: false, served: true},
        {pattern: 'project/static/js/specs/**/*.gif', included: false, served: true},

        'project/static/js/karma-main.js'
    ],

    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false

  });
};