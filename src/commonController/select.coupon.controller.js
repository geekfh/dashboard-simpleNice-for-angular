app.controller('select.coupon.controller', function ($scope, $rootScope, ngTableParams, $mdDialog, userInfo, $state) {
    $scope.queryParams = {};
    $scope.selectedCoupon = {};
    $scope.ngTable = new ngTableParams(
        {page: 1, count: 5},
        {
            getData: function($defer, params) {

                $scope.queryParams.page = params.page();
                $scope.queryParams.rows = params.count();
                $scope.queryParams.type = $rootScope.autoCouponType;
                var url = 'cards/couponList/';
                //if(/create_f|edit_f/.test(location.href)) $scope.queryParams.type = 1;
                userInfo.get(url, $scope.queryParams, true).then(function(res){
                    $scope.start = true;
                    res = ws.changeRes(res);
                    params.total(res.object.totalRows);
                    if(res.object.list.length){
                        if(!($rootScope.lastSelectedCoupon && $rootScope.lastSelectedCoupon.cardId)) $rootScope.lastSelectedCoupon = {};
                        else{
                            $scope.selectedCoupon.cardId = $rootScope.lastSelectedCoupon.cardId;
                            $scope.selectedCoupon.title = $rootScope.lastSelectedCoupon.title;
                            $scope.selectedCoupon.quantity = $rootScope.lastSelectedCoupon.quantity;
                        }
                        //compare($rootScope.lastSelectedCoupon, res.object.list);
                        if(!$scope.hasCoupon) $scope.hasCoupon = true;

                        var int = ws.indexOf($scope.selectedCoupon.cardId, res.object.list, 'cardId');
                        if(int === false) $scope.selectedCoupon = {};

                        $defer.resolve(res.object.list);
                    }else{
                        $defer.resolve([]);
                    }

                })
            }
        }
    );
    //全选
    $scope.checkAll = function(val, data){
        var ischeck = val ? false : true;
        angular.forEach(data, function(it){
            it.isCheck = ischeck;
            if(ischeck){
                if(ws.indexOf(it.merchantNo, $rootScope.poiLists, 'merchantNo') === false){
                    if(!$rootScope.poiLists) $rootScope.poiLists = [];
                    $rootScope.poiLists.push(it);
                }
            }else{
                var int = ws.indexOf(it.merchantNo, $rootScope.poiLists, 'merchantNo')
                if(int !== false){
                    if(!$rootScope.poiLists) $rootScope.poiLists = [];
                    $rootScope.poiLists.splice(int, 1);
                }
            }
        })
    }
    //搜索
    $scope.search = function(){
        $scope.ngTable.reload();
    }
    //选择
    $scope.check = function(item){
        $scope.selectedCoupon.cardId = item.cardId;
        $scope.selectedCoupon.title = item.title;
        $scope.selectedCoupon.quantity = item.quantity;
    }
    //关闭
    $scope.close = function(){
        $mdDialog.hide();
    }
    //确认
    $scope.confirm = function(){
        $rootScope.selectedCoupon = $scope.selectedCoupon;
        if(!($rootScope.selectedCoupon && $rootScope.selectedCoupon.cardId)) return ws.alert({msg: '请选择优惠券'});
        $rootScope.$broadcast('select.coupon.end', $rootScope.selectedCoupon);
        $mdDialog.hide();
    }
    //对比
    function compare(selected, list){
        if(!selected) return;
        if(ws.isEmptyObj(selected)) return;
        for(var i in list){
            if(selected.cardId == list[i].cardId){
                list[i].isCheck = true;
                continue;
            }

        }
    }

    //创建优惠券
    $scope.createCoupons = function(){
        $state.go('coupons.list');
        //营销中心栏目 点击创建优惠券刷新左边菜单栏
        if($scope.queryParams.type == '3' || $scope.queryParams.type == '4' || $scope.queryParams.type == '5' || $scope.queryParams.type == '6'){
            $scope.$emit('ngRepeatFinish');
        }
        $mdDialog.hide();
    }
})