app.service('coupons.report.service', ['$http', 'baseUrl', 'User', function ($http, baseUrl, User) {

    this.getReport = function (ID, params) {
        // params.appId = User.authorizerAppid;
        // params.merchantId = '';
        return $http.get(baseUrl + 'cardUsers/data/list', { params: params }).then(function (res) {
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };

    this.getCoupons = function(){
        return $http.get(baseUrl + 'cards').then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    }

}]);
