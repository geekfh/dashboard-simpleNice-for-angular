/**
 * Created by xuye on 2016/7/19.
 */
app.controller('flowController', function ($scope, userInfo, $date, $mdDialog, tplUrl, $log, $q, $timeout, ngTableParams, downloadFile,$rootScope) {
    $scope.date = {};
    var today = new Date();
    var merchantName = '',merchantNo = '',numTime = 3600 * 24 * 1000;

    //筛选查询表格搜索参数
    $scope.queryParams1 = {};
    $scope.queryParams1.startDate = $date.format(today, 0).string;
    $scope.queryParams1.endDate = $date.format(today, 0).string;

    //精确搜索表格参数
    $scope.queryParams2 = {};
    $scope.queryParams2.transNo = "";
    $scope.queryParams2.acNoHead = "";
    $scope.queryParams2.acNoTail = "";

    //交易门店选择类型
    $scope.storeTypeList = [{storeType : "指定门店", value : "2"}, {storeType : "指定分组", value : "3"}];
    //付款方式
    $scope.paymentType = [{name:"所有方式", value:200}, {name:"刷卡", value:201}, {name:"微信支付", value:202}, {name:"支付宝支付", value:203}, {name:"现金", value:204}, {name:"电子现金", value:205}, {name:"钱盒钱包", value:206}];
    //结算周期
    $scope.settlementPeriod = [{name:"所有结算周期", value:3}, {name:"T+0", value:0}, {name:"T+1", value:1}, {name:"S+0",value:2}];
    //交易状态
    $scope.transactionState = [{name:"所有状态", value:5}, {name:"成功",value:0}, {name:"失败", value:1}, {name:"已撤销", value:2}, {name:"已冲正", value:3}, {name:"异常交易", value:6} ];/*, {name:"余额查询",value:4}*/
    //交易类型
    $scope.subCodeList = [{name:"所有类型", value:0}, {name:"余额查询", value:1}, {name:"消费",value:2}, {name:"消费冲正",value:3}, {name:"消费撤销",value:4}, {name:"消费撤销冲正",value:5}, {name:"退货",value:6}];

    //默认指定门店
    $scope.queryParams1.visibleRange = '2';
    $scope.queryParams1.groupId = "";
    $scope.queryParams1.iboxNo = "";
    //默认所有
    $scope.queryParams1.userId = 0;
    $scope.queryParams1.paymentMethod = "200";
    $scope.queryParams1.selexDay = "3";
    $scope.queryParams1.tradStatus = "5";
    $scope.queryParams1.subCode = 0;

    //是否展示高级选项
    $scope.showAdvancedOps = false;

    //是否点击查询按钮
    $scope.isSearched = false;
    $scope.isSearchedAct = false;

    //显示正在加载
    $scope.showSearching = false;
    $scope.showSearchingAct = false;
    //是否第一次查询
    $scope.isFirst = true;
    $scope.isFirstAct = true;

    $scope.downloading1 = false;
    $scope.downloading2 = false;
    $scope.downloadTip1 = "下载交易流水";
    $scope.downloadTip2 = "下载交易流水";



    //详情
    $scope.dealDetail = function(item){
        $scope.$emit('show.detail', 'tpl/accounts/flow/detail.html', item);
    };

    $scope.queryMcht   = queryMcht;
    $scope.mchtItemChange = mchtItemChange;
    $scope.mchtTextChange   = mchtTextChange;

    $scope.queryCashier   = queryCashier;
    $scope.cashierItemChange = cashierItemChange;
    $scope.cashierTextChange   = cashierTextChange;

    //切换选择指定门店or分组
    $scope.changeStoreType = function(type){
        //复位请求参数
        $scope.queryParams1.mchtNo = "";
        //$scope.queryParams1.mchtName = "";
        $scope.queryParams1.groupId = "";

        if(type == '3'){
            //请求接口获取门店所有分组
            userInfo.get('/mchtGroup/listAll').then(function(res){
                $scope.groupList = res.object;
                if($scope.groupList.length < 1)
                    $scope.groupList.unshift({"groupId": "", "groupName": "暂无分组"});
                /*else
                    $scope.groupList.unshift({"groupId": "", "groupName": "所有分组"});*/
            });
        }
    };

    //品牌登录-帧听商户ID发生变化时，搜索收银员列表
    $scope.$watch('queryParams1.mchtNo', function(current){
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

    //带输入框的下拉列表 搜索函数-门店
    function queryMcht (query) {
        console.log($scope.selectedStore);
        console.log(query);

        //return  query ? $scope.storeList.filter( createFilterFor(query) ) : $scope.storeList;
        var deferred = $q.defer();
        if(query == null){
            deferred.resolve([]);
        }else{
            userInfo.get('mcht/listByName', {mchtName: query,mchtStatus:3}, true).then(function(res){/**/
                deferred.resolve(res.object);
                if(res.object &&　res.object.length == 1){
                    $scope.queryParams1.mchtNo = res.object[0].mchtNo;
                }
            })
        }
        return deferred.promise;
    }

    //带输入框的文字改变时的搜索函数-门店
    function mchtTextChange(text) {
        //$scope.queryParams1.mchtName = text;
        $scope.queryParams1.mchtNo = "";
    }
    //带输入框的下拉列表点击函数-门店
    function mchtItemChange(item) {
        if(item){
            $scope.queryParams1.mchtNo = item.mchtNo;
           // $scope.queryParams1.mchtName = item.mchtName;
        }
    }

    //带输入框的下拉列表 搜索函数-收银员
    function queryCashier (query) {
        //return  query ? $scope.cashierList.filter( createFilterFor(query) ) : $scope.cashierList;
        if(query){
           // var list = $scope.cashierList.filter( createFilterFor(query) );
           var list = $scope.cashierList.filter( createFilterFor(query) );

            list.length == 1 ? $scope.queryParams1.userId = list[0].userId : 0;
            return list;
        }else
            return $scope.cashierList;
    }

    //带输入框的文字改变时的搜索函数-收银员
    function cashierTextChange(text) {
        //$scope.queryParams1.userName = text;
        $scope.queryParams1.userId = "";
    }
    //带输入框的下拉列表点击函数-收银员
    function cashierItemChange(item) {
        if(item){
            $scope.queryParams1.userId = item.userId;
            //$scope.queryParams1.userName = item.userName;
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

    //筛选查询
    var flag = false;
    $scope.search = function(initMchtNo){
        if(initMchtNo){
            $scope.queryParams1.mchtNo = initMchtNo;
            $scope.queryParams1.startDate = $date.format(new Date(+new Date() - 6 * numTime), 0).string;
            $scope.queryParams1.endDate = $date.format(new Date(), 0).string;
        }else{
            $scope.queryParams1.startDate = $date.format($scope.date.begin, 0).string;
            $scope.queryParams1.endDate = $date.format($scope.date.end, 0).string;
        }

        //console.log($scope.date.end);
        if(Math.abs($scope.date.end - $scope.date.begin) > ($scope.date.maxDay-1)*24*60*60*1000){
            return  ws.alert({msg:"查询时间间隔不能超过" + $scope.date.maxDay + "天"})
        }
        //先判断是品牌or门店
        if(!($rootScope.powers && $rootScope.powers.length)){
            userInfo.getWigets().then(function(res){
                $rootScope.powers = res;
                if($rootScope.powers.indexOf('accounts.flow.list_store.list') >　-1){
                    if($scope.queryParams1.visibleRange == '2'){
                        if(!$scope.queryParams1.mchtNo)
                            return ws.alert({msg:"请选择指定门店！"})
                    }
                    else if($scope.queryParams1.visibleRange == '3'){
                        if(!$scope.queryParams1.groupId){
                            return ws.alert({msg:"请选择门店分组"})
                        }
                    }
                }
            })
        }else if($rootScope.powers.indexOf('accounts.flow.list_store.list') >　-1){
            if($scope.queryParams1.visibleRange == '2'){
                if(!$scope.queryParams1.mchtNo)
                    return ws.alert({msg:"请选择指定门店！"})
            }
            else if($scope.queryParams1.visibleRange == '3'){
                if(!$scope.queryParams1.groupId){
                    return ws.alert({msg:"请选择门店分组"})
                }
            }
        }

        $scope.showSearching = true;
        $scope.showAdvancedOps = false;
        //console.log($scope.queryParams1);

        //第一次查询
        if(!flag){
            flag = true;
            getFlowData();
        }
        else{
            $scope.isFirst = false;
            $scope.isSearched = false ;
            $scope.showSearching = true;
            getFlowData();
        }
    };

    userInfo.getUser().then(function(res){
        $scope.selectedStore = res.object.mchtName;
        merchantName = res.object.mchtName;
        merchantNo = res.object.mchtNo;
        $scope.ifAutoShow = true;
        $scope.search(res.object.mchtNo);
    });

    //精准查询
    var flagAct = false;
    $scope.searchAct = function(){
        if(!$scope.queryParams2.transNo && !$scope.queryParams2.acNoHead && !$scope.queryParams2.acNoTail){
            return ws.alert({msg:"请输入搜索条件！"});
        }
        $scope.showSearchingAct = true;
        //console.log($scope.queryParams2);
        //第一次查询
        if(!flagAct){
            flagAct = true;
            getFlowData2();
        }
        else{
            $scope.isFirstAct = false;
            $scope.isSearchedAct = false;
            getFlowData2();
        }
    };

    //获取流水记录--筛选查询
    function getFlowData(){
        if($scope.ngTable1){
            $scope.ngTable1.page(1);
            $scope.ngTable1.reload();
        }else{
            $scope.ngTable1 = new ngTableParams(
                {page: 1, count: 10, name: 'table1'},
                {
                    getData: function($defer, params) {
                        $scope.queryParams1.page = params.page();
                        $scope.queryParams1.rows = params.count();
                        console.log($scope.queryParams1)
                        userInfo.get('mchtBill/tredeWater/listPage', $scope.queryParams1, true).then(function (res) {
                            $scope.isSearched = true;
                            $scope.showSearching = false;

                            if (res.object){
                                $scope.totalCnt1 = parseInt(res.object.totalCnt);
                                $scope.totalAmt1 = res.object.totalAmt;
                                if(res.object.pageData){
                                    params.total(res.object.pageData.totalRows);
                                }
                            }
                            else{
                                params.total(0);
                                $scope.totalCnt1 = 0;
                                $scope.totalAmt1 = 0;
                            }

                            if (res.object && res.object.pageData && res.object.pageData.list.length > 0) {
                                $scope.noData1 = false;
                                $defer.resolve(res.object.pageData.list);
                            } else {
                                $scope.noData1 = true;
                                $scope.noDataInfo1 =  '暂无数据';
                                $defer.resolve([]);
                                $scope.totalCnt1 = 0;
                                $scope.totalAmt1 = 0;
                            }
                        })
                    }
                }
            )
        }
    }

    //获取流水记录--精准查询
    function getFlowData2(){
        if($scope.ngTable2){
            $scope.ngTable2.page(1);
            $scope.ngTable2.reload();
        }else{
            $scope.ngTable2 = new ngTableParams(
                {page: 1, count: 10, name: 'table2'},
                {
                    getData: function($defer, params) {
                        $scope.queryParams2.page = params.page();
                        $scope.queryParams2.rows = params.count();
                        userInfo.get('mchtBill/tredeWater/acListPage', $scope.queryParams2, true).then(function (res) {
                            $scope.isSearchedAct = true;
                            $scope.showSearchingAct = false;
                            if (res.object){
                                $scope.totalCnt2 = parseInt(res.object.totalCnt);
                                $scope.totalAmt2 = res.object.totalAmt;
                                if(res.object.pageData){
                                    params.total(res.object.pageData.totalRows);
                                }
                            }
                            else{
                                params.total(0);
                                $scope.totalCnt2 = 0;
                                $scope.totalAmt2 = 0;
                            }
                            if (res.object && res.object.pageData && res.object.pageData.list.length > 0) {
                                $scope.noData2 = false;
                                $defer.resolve(res.object.pageData.list);
                            } else {
                                $scope.noData2 = true;
                                $scope.noDataInfo2 = '暂无数据';
                                $defer.resolve([]);
                                $scope.totalCnt2 = 0;
                                $scope.totalAmt2 = 0;
                            }
                        })
                    }
                }
            )
        }
    }

    //下载表格-筛选查询
    $scope.getExcel1 = function(){
        getExcel($scope.noData1, $scope.queryParams1, 1 ,1);
    };

    //下载表格-精确查询
    $scope.getExcel2 = function(){
        if(!$scope.queryParams2.transNo && !$scope.queryParams2.acNoHead && !$scope.queryParams2.acNoTail){
            return ws.alert({msg:"请输入搜索条件！"});
        }
        getExcel($scope.noData2, $scope.queryParams2, 2 ,2);
    };

    function getExcel(noData, queryParams, downloading, downloadTip){
        if(noData) return ws.alert({msg: '暂无数据可供下载'});
        var times = 0,fileArr = [];
        userInfo.get('mchtBill/tredeWater/download',queryParams, true).then(function(res){
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
                    //ws.alert({msg:"下载失败，请重试！"});
                    ws.noAjaxDialogOneBtn('下载失败，请重试！', function(){});
                    clearInterval(timeInterval);
                }
            },5000)
        });
    }



    //门店登录执行
    getCashierList();

    //门店登录-本门店所有收银员
    function getCashierList(){
        var mchtNo;
        if(!($rootScope.powers && $rootScope.powers.length)){
            userInfo.getWigets().then(function(res){
                $rootScope.powers = res;
                if($rootScope.powers.indexOf('accounts.flow.list_store.list') <　0){

                    if($rootScope.userInfo){
                         mchtNo = $rootScope.userInfo.mchtNo;
                        userInfo.get('mchtUser/listByMchtNo', {mchtNo: mchtNo},true).then(function (res) {
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
                        userInfo.getUser().then(function(res){
                             mchtNo = res.object.mchtNo;
                            userInfo.get('mchtUser/listByMchtNo', {mchtNo: mchtNo},true).then(function (res) {
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
                        })
                    }

                }
            })
        }else if($rootScope.powers.indexOf('accounts.flow.list_store.list') < 0){
            if($rootScope.userInfo){
                mchtNo = $rootScope.userInfo.mchtNo;
                userInfo.get('mchtUser/listByMchtNo', {mchtNo: mchtNo},true).then(function (res) {
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
                userInfo.getUser().then(function(res){
                    mchtNo = res.object.mchtNo;
                    userInfo.get('mchtUser/listByMchtNo', {mchtNo: mchtNo},true).then(function (res) {
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
                })
            }

        }

    }

    //重置-筛选查询
    $scope.reload1 = function(){
        //默认指定门店
        $scope.queryParams1.visibleRange = '2';
        $scope.selectedStore = merchantName ;
        $scope.queryParams1.mchtNo = merchantNo;
        $scope.selectedUser = '';

        $scope.queryParams1.groupId = "";
        $scope.queryParams1.iboxNo = "";
        //默认所有
        $scope.queryParams1.userId = 0;
        $scope.queryParams1.paymentMethod = "200";
        $scope.queryParams1.selexDay = "3";
        $scope.queryParams1.tradStatus = "5";
        $scope.queryParams1.subCode = 0;
        //默认7天
        $scope.date.begin = new Date(+new Date() - 6 * numTime);
        $scope.date.end = new Date();
        $scope.queryParams1.startDate = $date.format($scope.date.begin, 0).string;
        $scope.queryParams1.endDate = $date.format($scope.date.end, 0).string;
        $scope.ngTable1.page(1);
        $scope.ngTable1.reload();
    }

    //重置-精准查询
    $scope.reload2 = function(){
        $scope.queryParams2.transNo = '';
        $scope.queryParams2.acNoHead = '';
        $scope.queryParams2.acNoTail = '';
    }
    $scope.$watch('selectedStore',function(value){
        console.log(value);
    })
});























