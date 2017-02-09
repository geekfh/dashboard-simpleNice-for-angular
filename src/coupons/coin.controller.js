app.controller('coupons.coin', ['coupons.create.service', '$rootScope', '$alert', '$state', '$filter', '$mdDialog', 'tplUrl', 'NgTableParams', '$scope', function (Service, $rootScope, $alert, $state, $filter, $mdDialog, tplUrl, NgTableParams, $scope) {

    var vm = this, today = new Date();
    vm.queryParams = {};
    

    $scope.date = {};
    $scope.date.dayIndex = 0;
    $scope.date.maxDate = new Date(); //最大时间
    $scope.date.minDate = new Date('2015-01-01'); //最小时间

    $scope.date.begin = new Date();
    $scope.date.end = new Date();

    vm.queryParams.beginDate = $filter('date')($scope.date.begin, 'yyyy-MM-dd');
    vm.queryParams.endDate = $filter('date')($scope.date.end, 'yyyy-MM-dd');
    
    // 查询 券点列表
    vm.ngTable = new NgTableParams(
        { page: 1, count: 10 },
        {
            getData: function ($defer, params) {
                vm.searchIng = true;
                vm.queryParams.page = params.page();
                vm.queryParams.rows = params.count();
                Service.coinList(vm.queryParams).then(function (res) {
                    if(res.code == 0){
                        if(res.object.length){
                            vm.noData = false;
                            $defer.resolve(res.object);
                            params.total(res.total_num);
                        }else{
                            vm.noData = res.msg || '暂无数据';
                            $defer.resolve([]);
                        }
                    }else{
                        vm.noData = res.msg || '暂无数据';
                        $defer.resolve([]);
                    }

                    vm.searchIng = false;
                });
            }
        }
    );


    // 查询 券点余额
    Service.getCoin().then(function(res){
       vm.coins = res;
    });

    vm.search = function(){
        vm.queryParams.beginDate = $filter('date')($scope.date.begin, 'yyyy-MM-dd');
        vm.queryParams.endDate = $filter('date')($scope.date.end, 'yyyy-MM-dd');
        vm.ngTable.reload()
    }
    
    
    // 查询 券点流水
    var detailId = $state.params.id;
    if(detailId){
        coinDetail(detailId)
    }


    function coinDetail (id) {
        Service.coinDetail(id).then(function(res){
            vm.coinDetail = res.order_info;
        })
    }

    // 下载表格
    vm.getExcel = function(e){
        if(vm.noData) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';
        for(var key in vm.queryParams){
            if(vm.queryParams[key]){
                kv += key+'=' + vm.queryParams[key] + '&';
            }
        }
        return e.target.href = '/server/s300/coin/infoList/down?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };

    // 充值券点
    vm.showConfirm = function(invalid) {
        if(invalid){
            vm.formError = true;
            return
        }else{
            vm.formError = false;
        }
        $mdDialog.show({
            clickOutsideToClose: true,
            title: 'title',
            templateUrl: tplUrl + 'tpl/coupons/coin_dialog.html',
            controllerAs: 'vm',
            controller: [ function(){
                var _vm = this, orderInfo;
                _vm.showInput = false;
                _vm.step = 1;

                _vm.selected = '100';
                _vm.click = function(n){
                    console.log(n);
                    _vm.selected = n;
                    _vm.showInput = n == 'other' ? true : false;
                };

                _vm.next = function(){
                    _vm.coin = _vm.input || _vm.selected;
                    if(isNaN(_vm.coin)) {
                        return;
                    }
                    // 充值券点
                    Service.payCoin(_vm.coin).then(function(res){
                        orderInfo = res.object;

                        _vm.qrcode_url = orderInfo.qrcode_url;
                        _vm.step = 2;
                    });
                };

                _vm.makeSure = function(){
                    Service.coinDetail(orderInfo.order_id).then(function(res){
                        var status = res.order_info.status;
                        
                        if(status == 'ORDER_STATUS_SUCC'){
                            vm.ngTable.reload();
                            $mdDialog.hide();
                        }else if(status == 'ORDER_STATUS_WAITING'){
                            $alert({msg: '等待支付，请确认支付成功'})
                        }else if(status == 'ORDER_STATUS_ROLLBACK'){
                            $alert({msg: '支付失败，请重试'})
                        }
                    });
                };

                _vm.cancel = function(){
                    console.log('取消充值');
                    $mdDialog.cancel();
                }
            }]
        });

    };
}])
    .filter('coinStatus', ['coupons.create.service', function(Service){
        var statuses = Service.coinStatus();
        return function(status){
            return statuses[status];
        }
    }])
    .filter('orderType', function(){
        var types = {ORDER_TYPE_SYS_ADD: '平台赠送', ORDER_TYPE_WXPAY: '充值', ORDER_TYPE_REFUND: '库存回退券点', ORDER_TYPE_REDUCE: '券点兑换库存', ORDER_TYPE_SYS_REDUCE: '平台扣减'};
        return function(type){
            return types[type];
        }
    });