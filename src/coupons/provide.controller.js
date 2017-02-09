app.controller('coupons.provide.controller', function (userInfo, ngTableParams, $date, $scope, $filter, $rootScope) {

    var vm = this, today = new Date(), numTime = 24 * 3600 * 1000;

    vm.queryParams = {};
    vm.searchIng = false;

    //搜索門店參數
    var params = {};
    params.page = 1;
    params.rows = 10;

    //取消判断是否授权功能
    /*userInfo.get('merchant/info').then(function(res){
        vm.user = res.object;
        if(vm.user.authStatus && vm.user.authStatus !== '0'){
            init();
        }
    });
    userInfo.getUser().then(function(res){
        vm.users = res.object;
    })*/
    init();
    $scope.date = {};
    $scope.date.dayIndex = 0;
    $scope.date.maxDate = $date.format(new Date()).time; //最大时间
    $scope.date.minDate = new Date('2015-01-01'); //最小时间

    $scope.date.begin = new Date(+new Date() - 6 * numTime);
    $scope.date.end = new Date();

    

    vm.queryParams.beginDate = $filter('date')($scope.date.begin, 'yyyy-MM-dd');
    vm.queryParams.endDate = $filter('date')($scope.date.end, 'yyyy-MM-dd');

    function init(){
        vm.ngTable = new ngTableParams({page: 1, count: 10},{
            getData: function($defer, params) {
                vm.searchIng = true;
                vm.queryParams.page = params.page();
                vm.queryParams.rows = params.count();

                userInfo.get('cardUsers/list', vm.queryParams, true).then(function(res){
                    params.total(res.object.totalRows);
                    vm.searchIng = false;

                    if(res.object.list.length){
                        vm.noData = false;
                        angular.forEach(res.object.list, function(it){
                            it.createTime = it.createTime.replace(/\-/, ' ').replace(/(\d{2})(?=\d)/g, '$1-').replace(/\-/, '');
                        })
                        $defer.resolve(res.object.list);
                    }else{
                        vm.noData = res.msg || '暂无数据';
                        $defer.resolve([]);
                    }
                })
            }
        });
        userInfo.getWigets().then(function(res){
            if(res.indexOf('coupons.provide_store.list') == -1){
                vm.queryParams.storeName = $rootScope.userInfo.mchtNo;
                getProviders();
            }else{
                vm.pois = [];
                userInfo.get('poi/store/list', params, true).then(function(res){/*cards/store/list*/
                    vm.pois = res.object.list;
                    //vm.pois.unshift({'pmpMerchantNo': '', 'storeName': '全部门店'});
                });
            }
        })
    }

    vm.reload = function(){
        $scope.date.begin = new Date(+new Date() - 6 * numTime);
        $scope.date.end = new Date();
        vm.queryParams.beginDate = $filter('date')($scope.date.begin, 'yyyy-MM-dd');
        vm.queryParams.endDate = $filter('date')($scope.date.end, 'yyyy-MM-dd');
        vm.queryParams.title = '';
        vm.queryParams.storeMerchantNo = '';
        vm.queryParams.salesmanId = '';
        vm.ngTable.page(1);
        vm.ngTable.reload();
    }
    $scope.$watch('vm.queryParams.storeName', function(val){
        if(!val){
            vm.queryParams.salesmanId = '';
        }else{
            getProviders();
        }
    })
    function getProviders(){
        var url = 'cardUsers/providers?storeMerchantNo=' + vm.queryParams.storeName;
        userInfo.get(url).then(function(res){
            vm.salesmanNames = ws.fillEmpty(res.object.list, 'USER_NAME');
            //vm.salesmanNames.unshift({'account': '', 'user_name': '全部核销员'})
        });
    }


    vm.getExcel = function(e){
        if(vm.noData) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';

        for(var key in vm.queryParams){
            if(vm.queryParams[key]){
                kv += key+'=' + vm.queryParams[key] + '&';
            }
        }
        
        return e.target.href = '/server/s300/cardUsers/down?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };



    vm.search = function(){
        vm.queryParams.beginDate = $filter('date')($scope.date.begin, 'yyyy-MM-dd');
        vm.queryParams.endDate = $filter('date')($scope.date.end, 'yyyy-MM-dd');
        vm.ngTable.page(1);
        vm.ngTable.reload();
    };
});
