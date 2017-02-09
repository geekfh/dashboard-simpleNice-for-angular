app.controller('coupons.record.controller', function (ngTableParams, $date, userInfo, $scope, $filter, $rootScope) {
//check
    var vm = this, today = new Date(), numTime = 24 * 3600 * 1000;
    vm.queryParams1 = {};
    vm.queryParams2 = {};
    vm.searchIng1 = false;
    vm.searchIng2 = false;
    //搜索門店參數
    var params1 = {};
    params1.page = 1;
    params1.rows = 10;
    var params2 = {};
    params2.page = 1;
    params2.rows = 10;
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

    initCheck();

    $scope.date1 = {};
    $scope.date1.dayIndex = 0;
    $scope.date1.maxDate = new Date(); //最大时间
    $scope.date1.minDate = new Date('2015-01-01'); //最小时间

    $scope.date1.begin = new Date(+new Date() - 6 * numTime);
    $scope.date1.end = new Date();


    $scope.date2 = {};
    $scope.date2.dayIndex = 0;
    $scope.date2.maxDate = $date.format(new Date()).time; //最大时间
    $scope.date2.minDate = new Date('2015-01-01'); //最小时间

    $scope.date2.begin = new Date(+new Date() - 6 * numTime);
    $scope.date2.end = new Date();



    vm.queryParams1.beginDate = $filter('date')($scope.date1.begin, 'yyyy-MM-dd');
    vm.queryParams1.endDate = $filter('date')($scope.date1.end, 'yyyy-MM-dd');


    vm.queryParams2.beginDate = $filter('date')($scope.date2.begin, 'yyyy-MM-dd');
    vm.queryParams2.endDate = $filter('date')($scope.date2.end, 'yyyy-MM-dd');

    function initCheck(){
        vm.ngTable1 = new ngTableParams({page: 1, count: 10},{
            getData: function($defer, params) {
                vm.searchIng1 = true;
                vm.queryParams1.page = params.page();
                vm.queryParams1.rows = params.count();
                userInfo.get('cardUsers/consume/list', vm.queryParams1, true).then(function(res){
                    params.total(res.object.totalRows);
                    vm.searchIng1 = false;
                    if(res.code == 0){
                        if(res.object.list.length){
                            vm.noData1 = false;
                            $defer.resolve(res.object.list);
                        }else{
                            vm.noData1 = res.msg || '暂无数据';
                            $defer.resolve([]);
                        }
                    }else{
                        vm.noData1 = res.msg || '暂无数据';
                    }
                })
            }
        });

        userInfo.getWigets().then(function(res){
            if(res.indexOf('coupons.provide_store.list') == -1){
                vm.queryParams1.storeName = $rootScope.userInfo.mchtNo;
                getProviders1();
            }else{
                vm.pois = [];
                userInfo.get('poi/store/list', params1, true).then(function(res){
                    vm.pois = res.object.list;
                    //vm.pois.unshift({'pmpMerchantNo': '', 'storeName': '全部门店'});
                });
            }
        })
    }

    vm.reload1 = function(){
        $scope.date1.begin = new Date(+new Date() - 6 * numTime);
        $scope.date1.end = new Date();
        vm.queryParams1.beginDate = $filter('date')($scope.date1.begin, 'yyyy-MM-dd');
        vm.queryParams1.endDate = $filter('date')($scope.date1.end, 'yyyy-MM-dd');
        vm.queryParams1.title = '';
        vm.queryParams1.storeMerchantNo = '';
        vm.queryParams1.salesmanId = '';
        vm.ngTable1.page(1);
        vm.ngTable1.reload();

    }
    
    $scope.$watch('vm.queryParams1.storeName', function(val){
        if(!val){
            vm.queryParams1.salesmanId = '';
        }else{
            getProviders1();
        }
    })
    function getProviders1(){
        var url = 'cardUsers/providers?storeMerchantNo=' + vm.queryParams1.storeName;
        userInfo.get(url).then(function(res){
            vm.salesmanNames = ws.fillEmpty(res.object.list, 'USER_NAME');
            //vm.salesmanNames.unshift({'account': '', 'user_name': '全部核销员'})
        });
    }

    vm.getExcel1 = function(e){
        if(vm.noData1) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';

        for(var key in vm.queryParams1){
            if(vm.queryParams1[key]){
                kv += key+'=' + vm.queryParams1[key] + '&';
            }
        }

        return e.target.href = '/server/s300/cardUsers/consume/down?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };

    vm.search1 = function(){
        vm.queryParams1.beginDate = $filter('date')($scope.date1.begin, 'yyyy-MM-dd');
        vm.queryParams1.endDate = $filter('date')($scope.date1.end, 'yyyy-MM-dd');
        vm.ngTable1.page(1);
        vm.ngTable1.reload();
    };

    var firstChange = true;
    vm.tabChange = function(tab){
        if(tab == 'provide' && firstChange){
            initProvide();
        }
        firstChange = false;
    };

    function initProvide(){
        vm.ngTable2 = new ngTableParams({page: 1, count: 10},{
            getData: function($defer, params) {
                vm.searchIng2 = true;
                vm.queryParams2.page = params.page();
                vm.queryParams2.rows = params.count();

                userInfo.get('cardUsers/list', vm.queryParams2, true).then(function(res){
                    params.total(res.object.totalRows);
                    vm.searchIng2 = false;

                    if(res.object.list.length){
                        vm.noData2 = false;
                        angular.forEach(res.object.list, function(it){
                            it.createTime = it.createTime.replace(/\-/, ' ').replace(/(\d{2})(?=\d)/g, '$1-').replace(/\-/, '');
                        })
                        $defer.resolve(res.object.list);
                    }else{
                        vm.noData2 = res.msg || '暂无数据';
                        $defer.resolve([]);
                    }
                })
            }
        });
        userInfo.getWigets().then(function(res){
            if(res.indexOf('coupons.provide_store.list') == -1){
                vm.queryParams2.storeName = $rootScope.userInfo.mchtNo;
                getProviders2();
            }else{
                vm.pois = [];
                userInfo.get('poi/store/list', params2, true).then(function(res){/*cards/store/list*/
                    vm.pois = res.object.list;
                    //vm.pois.unshift({'pmpMerchantNo': '', 'storeName': '全部门店'});
                });
            }
        })
    }

    vm.reload2 = function(){
        $scope.date2.begin = new Date(+new Date() - 6 * numTime);
        $scope.date2.end = new Date();
        vm.queryParams2.beginDate = $filter('date')($scope.date2.begin, 'yyyy-MM-dd');
        vm.queryParams2.endDate = $filter('date')($scope.date2.end, 'yyyy-MM-dd');
        vm.queryParams2.title = '';
        vm.queryParams2.storeMerchantNo = '';
        vm.queryParams2.salesmanId = '';
        vm.ngTable2.page(1);
        vm.ngTable2.reload();
    }
    $scope.$watch('vm.queryParams2.storeName', function(val){
        if(!val){
            vm.queryParams2.salesmanId = '';
        }else{
            getProviders2();
        }
    })
    function getProviders2(){
        var url = 'cardUsers/providers?storeMerchantNo=' + vm.queryParams2.storeName;
        userInfo.get(url).then(function(res){
            vm.salesmanNames = ws.fillEmpty(res.object.list, 'USER_NAME');
            //vm.salesmanNames.unshift({'account': '', 'user_name': '全部核销员'})
        });
    }


    vm.getExcel2 = function(e){
        if(vm.noData2) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';

        for(var key in vm.queryParams2){
            if(vm.queryParams2[key]){
                kv += key+'=' + vm.queryParams2[key] + '&';
            }
        }

        return e.target.href = '/server/s300/cardUsers/down?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };



    vm.search2 = function(){
        vm.queryParams2.beginDate = $filter('date')($scope.date2.begin, 'yyyy-MM-dd');
        vm.queryParams2.endDate = $filter('date')($scope.date2.end, 'yyyy-MM-dd');
        vm.ngTable2.page(1);
        vm.ngTable2.reload();
    };

    
});
