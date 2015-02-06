define(function (require, exports, module) {
    var application = require('./application');
    var view = require('./view');
    var itemview = require('./itemview');
    var collectionview = require('./collectionview');
    var regions = require('./region');


    // shortcuts
    exports.View = view.FamousView;
    exports.ItemView = itemview.FamousItemView;
    exports.CollectionView = collectionview.CollectionView;
    exports.Region = regions.Region;

});
