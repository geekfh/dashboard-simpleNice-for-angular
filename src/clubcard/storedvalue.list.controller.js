/**
 * Created by xuye on 2016/7/19.
 */
app.controller('clubcard.storedvalue.controller', function ($scope, userInfo, $date, $mdDialog, tplUrl, $log, $q, ngTableParams, downloadFile,$rootScope,$http,baseUrl) {
    $scope.date1 = {};
    $scope.date2 = {};
    var today = new Date();
    var merchantName = '', merchantNo = '',numTime = 3600 * 24 * 1000;

    //充值记录搜索参数
    $scope.queryParams1 = {};
    $scope.queryParams1.beginDate = $date.format(today, 0).str;
    $scope.queryParams1.endDate = $date.format(today, 0).str;
    $scope.queryParams1.membershipNo = "";
    $scope.queryParams1.transNo = "";
    $scope.queryParams1.chargeType = "";

    //消费记录搜索参数
    $scope.queryParams2 = {};
    $scope.queryParams2.beginDate = $date.format(today, 0).str;
    $scope.queryParams2.endDate = $date.format(today, 0).str;
    $scope.queryParams2.membershipNo = "";

    //交易门店选择类型
    $scope.storeTypeList = [{storeType : "所有门店", value : "1"},{storeType : "指定门店", value : "2"}, {storeType : "指定分组", value : "3"}];
    //充值方式类型选择
    $scope.rechargeTypelist = [
        {type : '会员导入', value : '0'},
        {type : '批量充值', value : '1'},
        {type : '刷卡支付', value : '2'},
        {type : '现金支付', value : '3'},
        {type : '微信支付', value : '4'},
        {type : '支付宝支付', value : '5'}
    ];

    //默认所有门店
    $scope.queryParams1.visibleRange = '1';
    $scope.queryParams2.visibleRange = '1';


    //是否点击查询按钮
    $scope.isSearched = false;
    $scope.isSearched2 = false;

    //显示正在加载
    $scope.showSearching = false;
    $scope.showSearching2 = false;
    //是否第一次查询
    $scope.isFirst = true;
    $scope.isFirst2 = true;

    //充值记录汇总
    $scope.totalRecharge= {};
    //消费记录汇总
    $scope.totalConsume = {};

    /*userInfo.getUser().then(function(res){
        $scope.selectedStore = res.object.mchtName;
        merchantName = res.object.mchtName;
        merchantNo = res.object.mchtNo;
        $scope.consumeSearch(res.object.mchtNo);
    });*/

    //详情
    $scope.dealDetail = function(item, isRecharge){
        item.isRecharge = isRecharge;
        //需要调详情接口获取详情数据
        //
        $scope.$emit('show.detail', 'tpl/clubcard/storedvalue/detail.html', item);
    };

    $scope.queryMcht1   = queryMcht1;
    $scope.mchtItemChange1 = mchtItemChange1;
    $scope.mchtTextChange1   = mchtTextChange1;

    $scope.queryMcht2   = queryMcht2;
    $scope.mchtItemChange2 = mchtItemChange2;
    $scope.mchtTextChange2   = mchtTextChange2;

    //切换选择指定门店or分组
    $scope.changeStoreType1 = function(type){
        $scope.queryParams1.mchtNo = "";
        $scope.queryParams1.groupId = "";
        if(type == '3'){
            //请求接口获取门店所有分组
            if(!$scope.groupList){
                userInfo.get('/mchtGroup/listAll').then(function(res){
                    $scope.groupList = res.object;
                    if($scope.groupList.length < 1)
                        $scope.groupList.unshift({"groupId": "", "groupName": "暂无分组"});
                });
            }
        }
    };
    //切换选择指定门店or分组
    $scope.changeStoreType2 = function(type){
        $scope.queryParams2.mchtNo = "";
        $scope.queryParams2.groupId = "";

        if(type == '3'){
            //请求接口获取门店所有分组
            if(!$scope.groupList){
                userInfo.get('/mchtGroup/listAll').then(function(res){
                    $scope.groupList = res.object;
                    if($scope.groupList.length < 1)
                        $scope.groupList.unshift({"groupId": "", "groupName": "暂无分组"});
                });
            }
        }
    };

    //带输入框的下拉列表 搜索函数-门店
    function queryMcht1 (query) {
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
    function mchtTextChange1(text) {
        //$scope.queryParams1.mchtName = text;
        $scope.queryParams1.mchtNo = "";
    }
    //带输入框的下拉列表点击函数-门店
    function mchtItemChange1(item) {
        if(item){
            $scope.queryParams1.mchtNo = item.mchtNo;
            // $scope.queryParams1.mchtName = item.mchtName;
        }
    }


    //带输入框的下拉列表 搜索函数-门店
    function queryMcht2 (query) {
        //return  query ? $scope.storeList.filter( createFilterFor(query) ) : $scope.storeList;
        var deferred = $q.defer();
        if(query == null){
            deferred.resolve([]);
        }else{
            userInfo.get('mcht/listByName', {mchtName: query,mchtStatus:3}, true).then(function(res){/**/
                deferred.resolve(res.object);
                if(res.object &&　res.object.length == 1){
                    $scope.queryParams2.mchtNo = res.object[0].mchtNo;
                }
            })
        }
        return deferred.promise;
    }

    //带输入框的文字改变时的搜索函数-门店
    function mchtTextChange2(text) {
        //$scope.queryParams1.mchtName = text;
        $scope.queryParams2.mchtNo = "";
    }
    //带输入框的下拉列表点击函数-门店
    function mchtItemChange2(item) {
        if(item){
            $scope.queryParams2.mchtNo = item.mchtNo;
            // $scope.queryParams1.mchtName = item.mchtName;
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

    //充值记录查询
    var flag = false;
    $scope.rechargeSearch = function(init){
        if(init){
            $scope.date1.begin = new Date(+new Date() - 6 * numTime);
            $scope.date1.end = new Date();
        }
        $scope.queryParams1.beginDate = $date.format($scope.date1.begin, 0).str;
        $scope.queryParams1.endDate = $date.format($scope.date1.end, 0).str;

        //console.log($scope.date1.end);
        if(Math.abs($scope.date1.end - $scope.date1.begin) > ($scope.date1.maxDay-1)*24*60*60*1000){
            return  ws.alert({msg:"查询时间间隔不能超过" + $scope.date1.maxDay + "天"})
        }
        if($scope.queryParams1.membershipNo && ($scope.queryParams1.membershipNo.length != 12 && $scope.queryParams1.membershipNo.length != 13))
            return ws.alert({msg:'请输入正确的会员卡号'});
        if($scope.queryParams1.transNo && $scope.queryParams1.transNo.length != 18)
            return ws.alert({msg:'请输入正确的流水号'});
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
        //console.log($scope.queryParams1);

        //第一次查询
        if(!flag){
            flag = true;
            getRecord();
            getTotalRecharge();
        }
        else{
            $scope.isFirst = false;
            $scope.isSearched = false ;
            $scope.showSearching = true;
            getRecord();
            getTotalRecharge();
        }
    };

    //消费记录查询
    var flag2 = false;
    $scope.consumeSearch = function(init){
        if(init){
            $scope.date2.begin = new Date(+new Date() - 6 * numTime);
            $scope.date2.end = new Date();
        }
        $scope.queryParams2.beginDate = $date.format($scope.date2.begin, 0).str;
        $scope.queryParams2.endDate = $date.format($scope.date2.end, 0).str;

        //console.log($scope.date2.end);
        if(Math.abs($scope.date2.end - $scope.date2.begin) > ($scope.date2.maxDay-1)*24*60*60*1000){
            return  ws.alert({msg:"查询时间间隔不能超过" + $scope.date2.maxDay + "天"})
        }
        if($scope.queryParams2.membershipNo && ($scope.queryParams2.membershipNo.length != 12 && $scope.queryParams2.membershipNo.length != 13))
            return ws.alert({msg:'请输入正确的会员卡号'});

        $scope.showSearching2 = true;
        //console.log($scope.queryParams2);
        //第一次查询
        if(!flag2){
            flag2 = true;
            getRecord2();
            getTotalConsume();
        }
        else{
            $scope.isFirst2 = false;
            $scope.isSearched2 = false;
            getRecord2();
            getTotalConsume();
        }
    };

    //获取充值记录
    function getRecord(){
        //查询表格每条记录
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
                        userInfo.get('memberCardStored/recharge', $scope.queryParams1, true).then(function (res) {
                            $scope.isSearched = true;
                            $scope.showSearching = false;

                            /*$scope.amount = fen2yuan(res.object.totalAmount);
                            $scope.paid = fen2yuan(res.object.totalPaid);
                            $scope.gift = fen2yuan(res.object.totalGift);*/

                            if(res.object.totalRows){
                                params.total(res.object.totalRows);
                            }else{
                                params.total(0);
                            }

                            if(res.object.list && res.object.list.length > 0) {
                                $scope.noData1 = false;
                                $defer.resolve(res.object.list);
                            } else {
                                $scope.noData1 = true;
                                $scope.noDataInfo1 =  '暂无数据';
                                $defer.resolve([]);
                                /*$scope.amount = 0;
                                $scope.paid = 0;
                                $scope.gift = 0;*/
                            }
                        })
                    }
                }
            )
        }
    }
    //查询统计数据-充值
    function getTotalRecharge(){
        userInfo.get('memberCardStored/rechargeCount', $scope.queryParams1, true).then(function(res){
            $scope.totalRecharge.amount = fen2yuan(res.object.totalAmount);
            $scope.totalRecharge.paid = fen2yuan(res.object.totalPaid);
            $scope.totalRecharge.gift = fen2yuan(res.object.totalGift);
        })
    }

    //获取消费记录
    function getRecord2(){
        //查询表格记录
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
                        console.log($scope.queryParams2);
                        //userInfo.get('memberCardStored/consume', $scope.queryParams2, true).then(function (res) {
                        $http.get(baseUrl + 'memberCardStored/consume', {params:$scope.queryParams2}).then(function (res) {
                            res = res.data;
                            if(res.code == -502){
                                return window.location.href = 'index.html#/login';
                            }
                            else if(res.code == -106){
                                res.object = res.object || {};
                            }
                            else if(res.code != '0'){
                                $scope.isSearched2 = true;
                                $scope.showSearching2 = false;
                                $scope.noData2 = true;
                                $scope.noDataInfo2 = res.message || '暂无数据';
                                ws.alert({msg: res.message});
                                return;
                            }
                            $scope.isSearched2 = true;
                            $scope.showSearching2 = false;

                            if(res.object.totalRows){
                                params.total(res.object.totalRows);
                            }else{
                                params.total(0);
                            }
                            if (res.object.list && res.object.list.length > 0) {
                                $scope.noData2 = false;
                                $defer.resolve(res.object.list);
                            } else {
                                $scope.noData2 = true;
                                $scope.noDataInfo2 = '暂无数据';
                                $defer.resolve([]);
                            }
                        })
                    }
                }
            )
        }
    }

    //查询统计数据-消费
    function getTotalConsume(){
        userInfo.get('memberCardStored/consumeCount', $scope.queryParams2, true).then(function(res){
            $scope.totalConsume.consume = fen2yuan(res.object.totalConsume);
            $scope.totalConsume.reduct = fen2yuan(res.object.totalReduct);
            $scope.totalConsume.paid = fen2yuan(res.object.totalPaid);
        })
    }

    //默认查询-充值记录
    $scope.rechargeSearch(true);

    var firstChange = true;
    $scope.tabChange = function(){
        if(firstChange){
            $scope.consumeSearch(true);
            firstChange = false;
        }
    };

    //下载表格-充值记录
    $scope.getExcel1 = function(e){
        getExcel(e,$scope.noData1, $scope.queryParams1, 1);
    };

    //下载表格-消费记录
    $scope.getExcel2 = function(e){
        getExcel(e,$scope.noData2, $scope.queryParams2, 2);
    };

    function getExcel(e,noData, queryParams, downloading){
        if(noData) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';
        for(var key in queryParams){
            if(queryParams[key]){
                kv += key+'=' + queryParams[key] + '&';
            }
        }
        if(downloading == 1)
            return e.target.href = '/server/s300/memberCardStored/rechargeExport?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
        if(downloading == 2)
            return e.target.href = '/server/s300/memberCardStored/export?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    }

    function fen2yuan(num) {
        return Number(num)/100
    }


    //重置-充值记录
    $scope.rechargeReload = function(){
        $scope.queryParams1.visibleRange = '1';
        $scope.queryParams1.mchtNo = '';
        $scope.queryParams1.groupId = '';
        $scope.queryParams1.membershipNo = '';
        $scope.queryParams1.transNo = '';
        $scope.queryParams1.chargeType = '';
        $scope.date1.begin = new Date(+new Date() - 6 * numTime);
        $scope.date1.end = new Date();
        $scope.queryParams1.beginDate = $date.format($scope.date2.begin, 0).str;
        $scope.queryParams1.endDate = $date.format($scope.date2.end, 0).str;
        $scope.ngTable1.page(1);
        $scope.ngTable1.reload();
        getTotalRecharge();
    };
    //重置-消费记录
    $scope.consumeReload = function(){
        $scope.queryParams2.visibleRange = '1';
        $scope.queryParams2.groupId = '';
        $scope.queryParams2.membershipNo = '';
        $scope.queryParams2.mchtNo = '';
        //$scope.queryParams2.mchtNo = merchantNo;
        //$scope.selectedStore = merchantName;

        //默认7天
        $scope.date2.begin = new Date(+new Date() - 6 * numTime);
        $scope.date2.end = new Date();
        $scope.queryParams2.beginDate = $date.format($scope.date2.begin, 0).str;
        $scope.queryParams2.endDate = $date.format($scope.date2.end, 0).str;
        $scope.ngTable2.page(1);
        $scope.ngTable2.reload();
        getTotalConsume();
    }

});























