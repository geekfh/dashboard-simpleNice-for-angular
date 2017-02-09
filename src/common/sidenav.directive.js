angular.module('sidebar')
    .directive('sidebar',['tplUrl', function(tplUrl){
        return {
            restrict: 'E',
            templateUrl: tplUrl + 'tpl/common/sidebar.html',
            controller: 'sidebar as menu',
            replace: true
        }
    }]);
