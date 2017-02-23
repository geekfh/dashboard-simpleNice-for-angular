app.controller('detailsController', function ($scope, userInfo, $date, $mdDialog, tplUrl, $log, $q, NgTableParams, downloadFile, $rootScope) {
    $scope.date = {};
    var today = new Date();
    var merchantName = '', merchantNo = '',numTime = 3600 * 24 * 1000;

    $scope.queryParams = {};
    $scope.queryParams.startDate = $date.format(today, 0).string;
    $scope.queryParams.endDate = $date.format(today, 0).string;

    $scope.queryParams2 = {};
    //查询时间类型
    $scope.checkTimeTypeList = [{
        value: '1',
        name: '按交易时间'
    },{
        value: '2',
        name: '按结算时间'
    }];

    $scope.checkTimeType = '0';


    //交易门店选择类型
    $scope.storeTypeList = [{storeType : "所有门店", value : "0"},{storeType : "指定门店", value : "2"}, {storeType : "指定分组", value : "3"}];
    //收款方式选择类型
    $scope.paymentMethodList = [
        {
            name : "所有方式",
            value : "0"
        }, {
            name : "刷卡",
            value : "1"
        }, {
            name : "微信支付",
            value : "2"
        }, {
            name : "微信（特约）",
            value : "3"
        }, {
            name : "支付宝",
            value : "4"
        }, {
            name : "支付宝（特约）",
            value : "5"
        }, {
            name : "钱盒钱包",
            value : "6"
        }, {
            name : "现金",
            value : "9"
        }
    ];
    //结算状态选择类型
    $scope.settleStatusList = [
        {
            name : "所有结算状态",
            value : "0"
        }, {
            name : "已结算",
            value : "1"
        }, {
            name : "未结算",
            value : "2"
        }, {
            name : "结算失败",
            value : "3"
        }
    ];
    //结算周期选择类型
    $scope.settleCycleList = [
        {
            name : "所有结算周期",
            value : "0"
        }, {
            name : "T+1",
            value : "1"
        }, {
            name : "S+0",
            value : "2"
        }, {
            name : "T+0",
            value : "3"
        }
    ];
    //结算账户选择类型
   /* $scope.settleCardNoList = [{
        name : "所有结算账户222",
        value : ""
    }]*/

    //默认选择指定门店
    $scope.queryParams.visibleRange = '0';
    $scope.queryParams.groupId = "";
    $scope.queryParams.snNo = "";
    $scope.queryParams.dateQueryType = '1';
    $scope.queryParams.paymentMethod = '0';
    $scope.queryParams.settleStatus = '0';
    $scope.queryParams.settleCycle = '0';

    //是否点击查询按钮
    $scope.showSearching = false;
    $scope.isSearched = false;

    $scope.isFirst = true;
    //是否正在下载
    $scope.downloading1 = false;
    $scope.downloading2 = false;
    $scope.downloadTip1 = "下载对账单";
    $scope.downloadTip2 = "下载对账单";


    //切换指定门店or分组
    $scope.changeStoreType = function(type){
        if(type == "3"){
            //获取所有分组
            userInfo.get('/mchtGroup/listAll').then(function(res){
                $scope.groupList = res.object;
            });
        } else if (type == "2") {
            $scope.queryParams.groupId = "";
        }
    };

    //品牌登录-帧听商户ID发生变化时，搜索收银员列表
    $scope.$watch('queryParams.mchtNo', function(current){
        if(current){
            userInfo.get('mchtUser/listByMchtNo', {mchtNo: current},true).then(function (res) {
                console.log('listByMchtNo');
                $scope.cashierList = res.object.list;
                if($scope.cashierList.length > 0){
                    $scope.cashierList.unshift({userId:0, userName:"所有收银员"});
                }
                $scope.cashierList.map( function (cashier) {
                    cashier.value = cashier.userName.toLowerCase();
                    return cashier;
                });

            })
        }else{
            $scope.cashierList = [];
        }
    });

    $scope.querySearch = querySearch;
    $scope.selectedItemChange = selectedItemChange;
    $scope.searchTextChange   = searchTextChange;

    $scope.queryCashier   = queryCashier;
    $scope.cashierItemChange = cashierItemChange;
    $scope.cashierTextChange   = cashierTextChange;

    //带输入框的下拉列表 搜索函数
    function querySearch (query) {
        //return  query ? $scope.storeList.filter( createFilterFor(query) ) : $scope.storeList;
        var deferred = $q.defer();
        if(query == null){
            deferred.resolve([]);
        }else{
            userInfo.get('mcht/listByName', {mchtName: query,mchtStatus:3}, true).then(function(res){
                deferred.resolve(res.object);
                if(res.object &&　res.object.length == 1){
                    $scope.queryParams.mchtNo = res.object[0].mchtNo;
                }
            })
        }
        return deferred.promise;
    }
    //带输入框的文字改变时的搜索函数
    function searchTextChange(text) {
        //$log.info("你输入的门店名称是：" + text);
        //$scope.queryParams.mchtName = text;
        $scope.queryParams.mchtNo = "";
    }
    //带输入框的下拉列表点击函数
    function selectedItemChange(item) {
        if(item){
            //$log.info("你选择的门店id是：" + item.mchtId + "你选择的门店名称是：" + item.mchtName + "你选择的门店No是：" + item.mchtNo);
            $scope.queryParams.mchtNo = item.mchtNo;
            //$scope.queryParams.mchtName = item.mchtName;
        }
    }

    //带输入框的下拉列表 搜索函数-收银员
    function queryCashier (query) {
        //return  query ? $scope.cashierList.filter( createFilterFor(query) ) : $scope.cashierList;
        if(query){
            // var list = $scope.cashierList.filter( createFilterFor(query) );
            var list = $scope.cashierList.filter( createFilterFor(query) );

            list.length == 1 ? $scope.queryParams.userId = list[0].userId : 0;
            return list;
        }else
            return $scope.cashierList;
    }

    //带输入框的文字改变时的搜索函数-收银员
    function cashierTextChange(text) {
        //$scope.queryParams1.userName = text;
        $scope.queryParams.userId = "";
    }
    //带输入框的下拉列表点击函数-收银员
    function cashierItemChange(item) {
        if(item){
            $scope.queryParams.userId = item.userId;
            //$scope.queryParams.userName = item.userName;
        }
    }

    //带输入框的下拉列表 过滤器
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            //if(state.value)
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }

    //查询
    var flag = true;
    $scope.search = function(initMchtNo){
        if(initMchtNo){
            /*$scope.queryParams.mchtNo = initMchtNo;*/
            $scope.queryParams.startDate = $date.format(new Date(+new Date() - 6 * numTime), 0).string;
            $scope.queryParams.endDate = $date.format(new Date(), 0).string;
        }else{
            $scope.queryParams.startDate = $date.format($scope.date.begin, 0).string;
            $scope.queryParams.endDate = $date.format($scope.date.end, 0).string;
        }
        if($scope.queryParams.dateQueryType == '1'){
            $scope.queryParams.startTime = $scope.date.startTime ? $scope.date.startTime : '000000';
            $scope.queryParams.endTime = $scope.date.endTime ? $scope.date.endTime : '240000';
        }
        if(Math.abs($scope.date.end - $scope.date.begin) > ($scope.date.maxDay-1)*24*60*60*1000){
            return  ws.alert({msg:"查询时间间隔不能超过" + $scope.date.maxDay + "天"})
        }
        if($rootScope.powers &&　$rootScope.powers.length　) {
            if ($rootScope.powers.indexOf('accounts.details.list_store.list') > -1) {
                //若指定门店查询时没有选择门店或没有输入，给出提示
                if($scope.queryParams.visibleRange == '2'){
                    if(!$scope.queryParams.mchtNo)
                        return ws.alert({msg:"请选择指定门店！"})
                }
                else if($scope.queryParams.visibleRange == '3'){
                    if(!$scope.queryParams.groupId){
                        return ws.alert({msg:"请选择门店分组"})
                    }
                }
            }
        }

        $scope.showSearching = true;
        $scope.showAdvancedOps = false;
        if(flag){
            flag = false;
        }else{
            $scope.isFirst = false;
            $scope.isSearched = false;
        }
        getDetailData();
        getSummaryInfo($scope.queryParams);
    };

    function getDetailData(){
        if($scope.ngTable){
            $scope.ngTable.page(1);
            $scope.ngTable.reload();
        }else{
            $scope.ngTable = new NgTableParams(
                {page: 1, count: 10, name: 'table'},
                {
                    getData: function($defer, params) {
                        $scope.queryParams.page = params.page();
                        $scope.queryParams.rows = params.count();
                        userInfo.get('mchtBill/algoDetails/listPage', $scope.queryParams, true).then(function (res) {
                            $scope.showSearching = false;
                            $scope.isSearched = true;

                            if(res.object && res.object.pageData){
                                params.total(res.object.pageData.totalRows);
                                $scope.totalCounts = res.object.pageData.totalRows;
                            }else{
                                params.total(0);
                                $scope.totalCounts = 0;
                            }

                            if (res.object && res.object.pageData && res.object.pageData.list.length > 0) {
                                $scope.noData1 = false;
                                $defer.resolve(res.object.pageData.list);
                            } else {
                                $scope.noData1 = true;
                                $scope.noDataInfo =  '暂无数据';
                                $defer.resolve([]);
                            }
                        })
                    }
                }
            )
        }
    };
    function getSummaryInfo(params){
        userInfo.get('mchtBill/algoDetails/getSummaryInfo', params, true).then(function(res){
            if(res.object){
                $scope.totalAmt = res.object.txAmt ? res.object.txAmt : 0;  //交易本金
                $scope.totalSettleAmt = res.object.settleAmt ? res.object.settleAmt : 0;  //结算金额
                $scope.totalFeeAmt = res.object.feeAmt ? res.object.feeAmt : 0;    //手续费
            }else{
                $scope.totalAmt = 0;  //交易本金
                $scope.totalSettleAmt = 0;  //结算金额
                $scope.totalFeeAmt = 0;    //手续费
            }
        });
    }
    /*userInfo.getUser().then(function(res){
         $scope.selectedStore = res.object.mchtName;
         merchantName = res.object.mchtName;
         merchantNo = res.object.mchtNo;
         $scope.ifAutoShow = true;
         $scope.search(res.object.mchtNo);
    });*/
    $scope.search(true);
    //交易详情
    $scope.dealDetail = function(item){
        $scope.$emit('show.detail', 'tpl/accounts/details/deal.html', item);
    };

    //下载表格-筛选查询
    $scope.getExcel1 = function(){
        getExcel($scope.noData1, $scope.queryParams, 1 ,1);
    };

    //下载表格-精确查询
    $scope.getExcel2 = function(){
        if(!$scope.queryParams2.transNo){
            return ws.alert({msg:"请输入搜索条件！"});
        }
        getExcel($scope.noData2, $scope.queryParams2, 2 ,2);
    };

    //下载对账明细
    var getExcel = function(noData, queryParams, downloading, downloadTip){
        if(noData) return ws.alert({msg: '暂无数据可供下载'});
        var times = 0,fileArr = [];
        userInfo.get('mchtBill/algoDetails/download',queryParams, true).then(function(res){
            downloading == 1 ? $scope.downloading1 = true : $scope.downloading2 = true;
            downloadTip == 1 ? $scope.downloadTip1 = "正在下载..." : $scope.downloadTip2 = "正在下载...";
            var timeInterval = setInterval(function(){
                times++;
                userInfo.get('report/polling').then(function(res){
                    if(res.object && res.object.length > 0){
                        for(var i=0,l=res.object.length; i<l; i++){
                            fileArr.push(res.object[i].data);
                        }
                        downloadFile.download(fileArr);
                        clearInterval(timeInterval);
                        downloading == 1  ? $scope.downloading1 = false : $scope.downloading2 = false;
                        downloadTip == 1 ? $scope.downloadTip1 = "下载交易流水" : $scope.downloadTip2 = "下载交易流水";
                    }
                });
                //超过一分钟结束轮询
                if(times > 20){
                    downloading == 1  ? $scope.downloading1 = false : $scope.downloading2 = false;
                    downloadTip == 1 ? $scope.downloadTip1 = "下载交易流水" : $scope.downloadTip2 = "下载交易流水";
                    ws.noAjaxDialogOneBtn('下载失败，请重试！', function(){});
                    clearInterval(timeInterval);
                }
            },5000)

        });
        //test
        //downloadFile.download(["./static/file/test.rar"]);
    }

    //重置
    $scope.reload = function(){
        $scope.queryParams.visibleRange = '0';
        $scope.queryParams.groupId = "";
        $scope.queryParams.snNo = "";
        $scope.selectedStore = '';
        $scope.selectedUser = '';
        $scope.queryParams.mchtNo = "";
        $scope.queryParams.settleCardNo = "";

        $scope.queryParams.dateQueryType = '1';
        $scope.queryParams.paymentMethod = '0';
        $scope.queryParams.settleStatus = '0';
        $scope.queryParams.settleCycle = '0';

        //重置时间
        $scope.date.startTime = '000000';
        $scope.date.endTime = '240000';

        //默认7天
        $scope.date.begin = new Date(+new Date() - 6 * numTime);
        $scope.date.end = new Date();
        $scope.queryParams.startDate = $date.format($scope.date.begin, 0).string;
        $scope.queryParams.endDate = $date.format($scope.date.end, 0).string;
        $scope.ngTable.page(1);
        $scope.ngTable.reload();
    }

    //监听交易门店的值
    $scope.$watch('queryParams.visibleRange', function(param){
        if(param == '0'){
            var data = {'visibleRange': param};
            $scope.getAccountList(data);
        }
    });
    $scope.$watch('queryParams.groupId', function(param){
        if($scope.queryParams.visibleRange == '3'){
            var data = {'visibleRange': $scope.queryParams.visibleRange, 'groupId': param};
            $scope.getAccountList(data);
        }
    });
    $scope.$watch('queryParams.mchtNo', function(param){
        if($scope.queryParams.visibleRange == '2' && $scope.queryParams.mchtNo){
            var data = {'visibleRange': $scope.queryParams.visibleRange, 'mchtNo': param};
            $scope.getAccountList(data);
        }
    });

    //获取结算账户
    $scope.getAccountList = function(data){
        userInfo.get('mcht/accountInfo/getAccountList', data, true).then(function(res){
            $scope.settleCardNoList = res.object;
            $scope.settleCardNoList.unshift({
                name : "所有结算账户",
                value : ""
            });
            $scope.queryParams.settleCardNo = '';
        });
    }

    //精准查询
    $scope.showSearchingAct = false;
    function getDetailData2(){
        $scope.queryParams2.queryMode = '1';
        if($scope.ngTable2){
            $scope.ngTable2.page(1);
            $scope.ngTable2.reload();
        }else{
            $scope.ngTable2 = new NgTableParams(
                {page: 1, count: 10, name:'table2'},
                {
                    getData: function($defer, params) {
                        $scope.queryParams2.page = params.page();
                        $scope.queryParams2.rows = params.count();
                        userInfo.get('mchtBill/algoDetails/listPage', $scope.queryParams2, true).then(function (res) {
                            $scope.showSearchingAct = false;
                            $scope.isSearchedAct = true;

                            if(res.object && res.object.pageData){
                                params.total(res.object.pageData.totalRows);
                                $scope.totalCounts_02 = res.object.pageData.totalRows;
                            }else{
                                params.total(0);
                                $scope.totalCounts_02 = 0;
                            }

                            if (res.object && res.object.pageData && res.object.pageData.list.length > 0) {
                                $scope.noData2 = false;
                                $defer.resolve(res.object.pageData.list);
                            } else {
                                $scope.noData2 = true;
                                $scope.noDataInfo =  '暂无数据';
                                $defer.resolve([]);
                            }
                        })
                    }
                }
            )
        }
    };
    var flagAct = false;
    $scope.searchAct = function(){
        if(!$scope.queryParams2.transNo){
            return ws.alert({msg:"请输入搜索条件！"});
        }
        $scope.showSearchingAct = true;
        if(!flagAct){
            flagAct = true;
        }
        else{
            $scope.isFirstAct = false;
            $scope.isSearchedAct = false;
        }
        getDetailData2();
        getSummaryInfo($scope.queryParams2);
    };

    //重置-精准查询
    $scope.reload2 = function(){
        $scope.queryParams2.transNo = '';
    }

})