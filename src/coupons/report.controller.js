app.controller('coupons.report.controller', ['coupons.report.service', '$state', 'NgTableParams', 'userInfo', '$scope', '$filter', '$rootScope', function (Service, $state, NgTableParams, userInfo, $scope, $filter, $rootScope) {

    var  vm = this, searching = false, today = new Date(), numTime = 24 * 3600 * 1000;
    vm.queryParams = {};
    //搜索門店參數
    var params = {};
    params.page = 1;
    params.rows = 10;

    //取消判断是否授权功能
    /*userInfo.get('merchant/info').then(function(res){
        vm.user = res.object;
        if(vm.user.authStatus == '1' || vm.user.authStatus == '2'){
            init();
        }
    });
    userInfo.getUser().then(function(res){
        vm.users = res.object;
    })*/
    init();
    vm.selected = $state.params.id || '';

    //时间控件
    $scope.date = {};
    $scope.date.dayIndex = 0;
    $scope.date.maxDate = new Date(); //最大时间
    $scope.date.minDate = new Date('2015-01-01'); //最小时间

    $scope.date.begin = new Date(+new Date() - 6 * numTime);
    $scope.date.end = new Date();

    function init(){
        Service.getCoupons().then(function (res) {
            if ( res.code == 0 ) {
                if (res.object.list && res.object.list.length ) {
                    vm.selects = res.object.list;
                    vm.noData = false;
                } else {
                    vm.selects = [];
                    vm.selects.push({cardId: '', baseInfo: {title: '暂没有卡券'}});
                    vm.noData = res.msg || '您还未创建任何卡券，请新增卡券';
                }
            } else {
                vm.noData = res.msg || '您还未创建任何卡券，请新增卡券';
            }

        });
        vm.pois = [];
        if($rootScope.powers && $rootScope.powers.indexOf('coupons.report_store.list') >= 0){
            userInfo.get('poi/store/list',params,true).then(function(res){
                vm.pois = res.object.list;
                //vm.pois.unshift({'merchantNo': '', 'storeName': '全部门店'});
            }); 
        }
         
        vm.ngTable = new NgTableParams(
            { page: 1, count: 10 },
            {
                getData: function ($defer, params) {
                    searching = true;
                    vm.queryParams.page = params.page();
                    vm.queryParams.rows = params.count();
                    vm.queryParams.beginDate = $filter('date')($scope.date.begin, 'yyyy-MM-dd');
                    vm.queryParams.endDate = $filter('date')($scope.date.end, 'yyyy-MM-dd');
                    console.log(vm.queryParams);
                    Service.getReport(vm.selected, vm.queryParams).then(function (res) {
                        params.total(res.object.totalRows);
                        if ( res.code == 0 ) {
                            if ( res.object.list.length ) {
                                vm.noData = false;
                                /*angular.forEach(res.object.list, function(item){
                                    item.statisticDate = item.statisticDate.replace(/\-.+$/, '');
                                    item.statisticDate = item.statisticDate.replace(/(\d{2})(?=\d)/g, '$1-');
                                    item.statisticDate = item.statisticDate.replace(/\-/, '');
                                })*/
                                $defer.resolve(res.object.list)
                            } else {
                                vm.noData = '暂无数据';
                                $defer.resolve([]);
                            }
                        } else {
                            $defer.resolve([]);
                            vm.noData = res.msg || '暂无数据';
                        }

                        searching = false;
                    })
                }
            }
        );
    }

    vm.reload = function(){
        $scope.date.begin = new Date(+new Date() - 6 * numTime);
        $scope.date.end = new Date();
        vm.queryParams.storeMerchantNo = null;
        vm.queryParams.cardId = null;
        vm.ngTable.page(1);
        vm.ngTable.reload();
    };

    vm.getExcel = function(e){
        if(vm.noData) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';

        for(var key in vm.queryParams){
            if(vm.queryParams[key]){
                kv += key+'=' + vm.queryParams[key] + '&';
            }
        }

        return e.target.href = '/server/s300/cardUsers/data/down?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };

    searching = false;
    vm.search = function () {
        if ( searching ) return;
        vm.queryParams.beginDate = $filter('date')($scope.date.begin, 'yyyy-MM-dd');
        vm.queryParams.endDate = $filter('date')($scope.date.end, 'yyyy-MM-dd');
        vm.ngTable.page(1);
        vm.ngTable.reload();
    };

}]);
