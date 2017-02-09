app.controller('downloadController', function ($scope, userInfo, $date) {
    $scope.date = {};
    var today = new Date();

    $scope.queryParams = {};

    $scope.queryParams.beginDate = $date.format(today, 0).str;
    $scope.queryParams.endDate = $date.format(today, 0).str;
 
})