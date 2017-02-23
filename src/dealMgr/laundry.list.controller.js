app.controller('dealMgrController', function ($scope, userInfo, $date, $mdDialog, tplUrl, $log, $q, $timeout, NgTableParams) {
    $scope.date = {};
    var today = new Date();

    $scope.queryParams1 = {};
    $scope.queryParams1.beginDate = $date.format(today, 0).str;
    $scope.queryParams1.endDate = $date.format(today, 0).str;

    $scope.queryParams2 = {};
    $scope.queryParams2.serialNum = "";
    $scope.queryParams2.cardNumB = "";
    $scope.queryParams2.cardNumA = "";

    //交易门店选择类型
    $scope.storeTypeList = [{storeType : "指定门店", value : 1}, {storeType : "指定分组", value : 2}];
    $scope.selectedType = 1;

    $scope.selectedGroup = "";
    $scope.selectedCashier = "";
    $scope.terminalNo = "";
    $scope.selectedPayment = "";
    $scope.selectedSettlePeriod = "";
    $scope.selectedTranState = "";

    //
    $scope.paymentType = ["所有方式","刷卡","微信支付","支付宝支付"];
    $scope.settlementPeriod = ["所有结算周期", "T+0", "T+1", "S+0"];
    $scope.transactionState = ["所有状态", "成功", "失败", "已撤销", "已冲正", "余额查询"];

    //是否展示高级选项
    $scope.showAdvancedOps = false;

    //是否点击查询按钮
    $scope.isSearching = false;
    $scope.isSearchingAct = false;

    //显示正在加载
    $scope.isLoading = true;
    $scope.isLoadingAct = true;

    getStoreList();

    $scope.dealDetail = function(){
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/dealMgr/deal.html',
            controllerAs: 'dealCtrl',
            controller: function(){
                this.close = function(){
                    $mdDialog.hide();
                };
            }
        }).then(function(data){
        });
    };


    //筛选查询
    $scope.filterQuery = function(){
        alert(1);
        getStoreList();
        getCashierList();
    };
    //获取所有门店列表
    function getStoreList(){
        /*userInfo.get('mcht/listPage').then(function(res){
            $scope.storeList = res.object.list;
            console.log($scope.storeList);
            $scope.storeList.map( function (store) {
                store.value = store.mchtName.toLowerCase();
                return store;
            });
        })*/
    }

    //获取收银员
    function getCashierList(){
        //请求接口获取所有收银员
        /*userInfo.get('mcht/listByName', {mchtName: text}).then(function(res){
         $scope.cashierList = res.object.list;
         })*/
    }

   /* $scope.storeList = [
        {
            name : "分店一",
            id : "1"
        },{
            name : "分店二",
            id : "2"
        },{
            name : "分店三",
            id : "3"
        },{
            name : "兰州拉面一",
            id : "4"
        },{
            name : "兰州拉面二",
            id : "5"
        },{
            name : "兰州拉面三",
            id : "6"
        }

    ];*/


    $scope.simulateQuery = false;
    $scope.querySearch   = querySearch;
    $scope.selectedItemChange = selectedItemChange;
    $scope.searchTextChange   = searchTextChange;

    //切换选择交易门店
    $scope.changeStoreType = function(type){
        if(type == 2){
            //请求接口获取门店所有分组
            userInfo.get('/mchtGroup/listAll').then(function(res){
                $scope.groupList = res.object;
            });
        }
        /*if(type == 1){
            //获取所有门店
            userInfo.get('mcht/listPage').then(function(res){
                $scope.storeList = res.object.list;
                $scope.storeList.map( function (store) {
                    store.value = store.mchtName.toLowerCase();
                    return store;
                });
            })
        }*/

    };

    //切换选择收银员
    $scope.changeCashier = function(cashier){

    };

    //带输入框的下拉列表 搜索函数
    function querySearch (query) {
        return  query ? $scope.storeList.filter( createFilterFor(query) ) : $scope.storeList;

    }
    //带输入框的文字改变时的搜索函数
    function searchTextChange(text) {
        //$log.info("你输入的门店名称是：" + text);
        $scope.mchtName = text;
    }
    //带输入框的下拉列表点击函数
    function selectedItemChange(item) {
        if(item){
            //$log.info("你选择的门店id是：" + item.mchtId + "你选择的门店名称是：" + item.mchtName + "你选择的门店No是：" + item.mchtNo);
            $scope.mchtId = item.mchtId;
        }

    }
    //带输入框的下拉列表 过滤器
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }

    //查询
    var timeOut,flag = false;
    $scope.search = function(){

        $scope.queryParams1.beginDate = $date.format($scope.date.begin, 0).str;
        $scope.queryParams1.endDate = $date.format($scope.date.end, 0).str;
        $scope.queryParams1.groupId = $scope.selectedGroup;
        $scope.queryParams1.cashierId = $scope.selectedCashier;
        $scope.queryParams1.terminalNo = $scope.terminalNo;
        $scope.queryParams1.payment = $scope.selectedPayment;
        $scope.queryParams1.settlePeriod = $scope.selectedSettlePeriod;
        $scope.queryParams1.transState = $scope.selectedTranState;
        console.log($scope.queryParams1);

        $scope.isSearching = true ;
        //if(timeOut) $timeout.cancel(timeOut);
        //第一次查询
        if(!flag){
            timeOut = $timeout(function () {
                flag = true;
                $scope.isLoading = false ;

                //请求接口，获取流水记录
                if($scope.ngTable1){
                    $scope.ngTable1.reload();
                }else{
                    $scope.ngTable1 = new NgTableParams(
                        {page: 1, count: 10, name: 'table1'},
                        {
                            getData: function($defer, params) {

                                $scope.queryParams1.page = params.page();
                                $scope.queryParams1.rows = params.count();
                                /*userInfo.get('/sys/quotaPage', $scope.queryParams1, true).then(function(res){

                                    if(res.object && res.object.totalRows)
                                        params.total(res.object.totalRows);
                                    else
                                        params.total(0);
                                    if(res.object　&& res.object.list &&　res.object.list.length){
                                        $scope.noData1 = false;
                                        $defer.resolve(res.object.list);
                                    }else{
                                        $scope.noData1 = true;
                                        $scope.noDataInfo1 = res.msg || '没有相关结果，请修改关键词重试。';
                                        $defer.resolve([]);
                                    }
                                })*/
                            }
                        }
                    )
                }

            }, 500);
        }
        else{
            $scope.isLoading = true;
            timeOut = $timeout(function () {
                $scope.isLoading = false ;
                //请求接口，获取流水记录
                if($scope.ngTable1){
                    $scope.ngTable1.reload();
                }else{
                    $scope.ngTable1 = new NgTableParams(
                        {page: 1, count: 10, name: 'table1'},
                        {
                            getData: function($defer, params) {

                                $scope.queryParams1.page = params.page();
                                $scope.queryParams1.rows = params.count();
                                /*userInfo.get('/sys/quotaPage', $scope.queryParams1, true).then(function(res){

                                 if(res.object && res.object.totalRows)
                                 params.total(res.object.totalRows);
                                 else
                                 params.total(0);
                                 if(res.object　&& res.object.list &&　res.object.list.length){
                                 $scope.noData1 = false;
                                 $defer.resolve(res.object.list);
                                 }else{
                                 $scope.noData1 = true;
                                 $scope.noDataInfo1 = res.msg || '没有相关结果，请修改关键词重试。';
                                 $defer.resolve([]);
                                 }
                                 })*/
                            }
                        }
                    )
                }

            }, 500);
        }
    }
    //精准搜索
    var flagAct = false;
    $scope.searchAct = function(){
        $scope.isSearchingAct = true ;
        //if(timeOut) $timeout.cancel(timeOut);
        //第一次查询
        if(!flagAct){
            timeOut = $timeout(function () {
                flagAct = true;
                $scope.isLoadingAct = false ;

                //请求接口，获取流水记录
                if($scope.ngTable2){
                    $scope.ngTable2.reload();
                }else{
                    $scope.ngTable2 = new NgTableParams(
                        {page: 1, count: 10, name: 'table2'},
                        {
                            getData: function($defer, params) {

                                $scope.queryParams2.page = params.page();
                                $scope.queryParams2.rows = params.count();
                                /*userInfo.get('/sys/quotaPage', $scope.queryParams2, true).then(function (res) {

                                    if (res.object && res.object.totalRows)
                                        params.total(res.object.totalRows);
                                    else
                                        params.total(0);
                                    if (res.object && res.object.list && res.object.list.length) {
                                        $scope.noData2 = false;
                                        $defer.resolve(res.object.list);
                                    } else {
                                        $scope.noData2 = true;
                                        $scope.noDataInfo2 = res.msg || '没有相关结果，请修改关键词重试。';
                                        $defer.resolve([]);
                                    }
                                })*/
                            }
                        }
                    )
                }
            }, 500);
        }
        else{
            $scope.isLoadingAct = true;
            timeOut = $timeout(function () {
                $scope.isLoadingAct = false ;
                //请求接口，获取流水记录
                if($scope.ngTable2){
                    $scope.ngTable2.reload();
                }else{
                    $scope.ngTable2 = new NgTableParams(
                        {page: 1, count: 10, name: 'table2'},
                        {
                            getData: function($defer, params) {

                                $scope.queryParams2.page = params.page();
                                $scope.queryParams2.rows = params.count();
                                /*userInfo.get('/sys/quotaPage', $scope.queryParams2, true).then(function (res) {

                                    if (res.object && res.object.totalRows)
                                        params.total(res.object.totalRows);
                                    else
                                        params.total(0);
                                    if (res.object && res.object.list && res.object.list.length) {
                                        $scope.noData2 = false;
                                        $defer.resolve(res.object.list);
                                    } else {
                                        $scope.noData2 = true;
                                        $scope.noDataInfo2 = res.msg || '没有相关结果，请修改关键词重试。';
                                        $defer.resolve([]);
                                    }
                                })*/
                            }
                        }
                    )
                }

            }, 500);
        }
    }

    //下载表格-筛选查询
    $scope.getExcel1 = function(e){
        if($scope.noData1) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';

        for(var key in $scope.queryParams1){
            if($scope.queryParams1[key]){
                kv += key+'=' + $scope.queryParams1[key] + '&';
            }
        }
        return e.target.href = 'api/store/down?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };

    //下载表格-精确查询
    $scope.getExcel2 = function(e){
        if($scope.noData2) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';

        for(var key in $scope.queryParams2){
            if($scope.queryParams2[key]){
                kv += key+'=' + $scope.queryParams2[key] + '&';
            }
        }
        return e.target.href = 'api/store/down?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };

 
})























