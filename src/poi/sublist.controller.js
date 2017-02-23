angular.module('poi.sublist', ['poi.list']).controller('poi.sublist.controller', function(NgTableParams, $mdDialog, tplUrl, $state, $rootScope, userInfo, $scope, $q, $timeout) {

    $scope.wxPoiInfo = {};
    $scope.noData = true;
    $scope.isAuthorised = false;   //对应的品牌商户是否已授权微信公众号
    //getwxPoiInfo();

    /*
     * 判断用户角色---商户用户角色如下
     * StoreAdmin-个体商户管理员,  StoreCashier-个体商户门店收银员， BrandAdmin-品牌管理员，BrandStoreAdmin-品牌门店管理员,BrandStoreCashier-品牌门店收银员
     * */
    if($rootScope.userInfo){
        $rootScope.userInfo.role=='BrandAdmin' || $rootScope.userInfo.role=='BrandStoreAdmin' || $rootScope.userInfo.role=='BrandStoreCashier' ? $scope.isBrand = true : $scope.isBrand = false;
    }else{
        userInfo.getUser().then(function(res){
            res.object.role=='BrandAdmin' || res.object.role=='BrandStoreAdmin' || res.object.role=='BrandStoreCashier' ? $scope.isBrand = true: $scope.isBrand = false;
        });
    }

    //获取门店的品牌商户信息
    userInfo.get('mcht/info.json').then(function(res){
        $scope.user = res.object;
        if($scope.user.authStatus != '1'){
            //return ws.noAjaxDialog("该品牌没有授权微信公众号，请先授权!",function(){});
            return $scope.isAuthorised = false;
        }else {
            $scope.isAuthorised = true;
            getwxPoiInfo();
        }
    });

    //获取微信门店信息
    function getwxPoiInfo() {
        userInfo.get('/poi').then(function (res) {
            if (!res.object)
                $scope.noData = true;
            else{
                $scope.wxPoiInfo = res.object;
                $scope.noData = false;
            }
        })
    }


    //门店详情
    $scope.detail = function () {
        var mchtNo = $rootScope.userInfo.mchtNo;
        $state.go('poi.subdetail', {id: mchtNo});
    };

    //删除微信门店
    $scope.delete = function () {
        ws.noAjaxDialog('您真的要删除该微信门店吗？', function(){
            userInfo.del('/poi').then(function(res){
                getwxPoiInfo();
            })
        })
    };

    //创建微信门店
    $scope.create = function(){
        var mchtNo = $rootScope.userInfo.mchtNo;
        localStorage.setItem("lastPoiPage","poi.sublist");
        $state.go('poi.create', {id: mchtNo})
    }

    //授权
    $scope.authorize = function(){
        $state.go('settings.wxchat');
        /*window.location.reload();*/
        $scope.$emit('ngRepeatFinish');
    }


});

