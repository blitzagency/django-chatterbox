define(function(require, exports, module) {

var ApplicationDelegate = require('./delegate').ApplicationDelegate;

function main(options){
    var app = this;

    app.addRegions({
        main: '.js-main',
        modal: '.js-modal',
        activity: '.js-activity'
    });

    new ApplicationDelegate({app: app});
}

exports.main = main;
});