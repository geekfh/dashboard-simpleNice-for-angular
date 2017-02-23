app.controller('balanceController', function (NgTableParams, $scope, userInfo, $date,$timeout, $q, $log,  $filter, downloadFile) {
    $scope.date = {};
    var today = new Date();
    var numTime = 3600 * 24 * 1000;

    $scope.queryParams = {};

    $scope.queryParams.startDate = $date.format(today, 0).string;
    $scope.queryParams.endDate = $date.format(today, 0).string;
    $scope.downloading = false;
    $scope.downloadTip = "下载结算记录";

    //交易门店选择类型
    $scope.storeTypeList = [
        {
            storeType : "所有门店",
            value : "1"
        },
        {
            storeType : "指定门店",
            value : "5"
        },
        {
            storeType : "指定分组",
            value : "4"
        }
    ];
    //结算类型
    $scope.balanceTypeList = [
        {
            balanceType : "所有类型",
            value : "0"
        },
        {
            balanceType : "刷卡",
            value : "1"
        },
        {
            balanceType : "微信",
            value : "2"
        },
        {
            balanceType : "微信（特约）",
            value : "3"
        },
        {
            balanceType : "支付宝",
            value : "4"
        },
        {
            balanceType : "支付宝（特约）",
            value : "5"
        },
        {
            balanceType : "钱盒钱包",
            value : "6"
        }
    ];
    /*$scope.selectedType = "1";*/
    $scope.queryParams.visibleRange = "1";
    $scope.queryParams.chaCode = "0";

    $scope.simulateQuery = false;
    $scope.querySearch   = querySearch;
    $scope.selectedItemChange = selectedItemChange;
    $scope.searchTextChange   = searchTextChange;

    $scope.changeStoreType = function(selectedType){
        /*$scope.queryParams.visibleRange = selectedType;//ng-model绑定selectedType失败，在这里赋值
        console.log($scope.queryParams.visibleRange);*/
        //获取门店所有分组
        if(selectedType == 4){
            userInfo.get('mchtGroup/listAll').then(function(res){
                $scope.storeGroupList = res.object;
                if(!res.object.length){
                    $scope.storeGroupList.unshift({groupId: '', groupName: '暂无分组'})
                }
                //不能
                /*else{
                    $scope.storeGroupList.unshift({groupId: '', groupName: '全部分组'})
                }*/
            })
        }
    }

    $scope.changeStoreGroup = function(selectedGroup){
        $scope.queryParams.groupId = selectedGroup;
    }
    $scope.platformTip = function(data){
        $scope.$emit('show.detail', 'tpl/common/platformTip.html', data, function(){
            window.open(data.href, '_blank');
        })
    }
    $scope.search = function(initSearch){
        if(initSearch){
            $scope.queryParams.startDate = $date.format(new Date(+new Date() - 6 * numTime), 0).str;
            $scope.queryParams.endDate = $date.format(new Date(), 0).str;
        }else{
            $scope.queryParams.startDate = $date.format($scope.date.begin, 0).string;
            $scope.queryParams.endDate = $date.format($scope.date.end, 0).string;
        }
        if(Math.abs($scope.date.end - $scope.date.begin) > ($scope.date.maxDay-1)*24*60*60*1000){
            return  ws.alert({msg:"查询时间间隔不能超过" + $scope.date.maxDay + "天"})
        }
        /*$scope.queryParams.visibleRange = $scope.selectedType;*/
        if($scope.queryParams.visibleRange == '5'){
            console.log($scope.searchText, 'iii')
            if(!$scope.queryParams.mchtNo){
                ws.alert(
                    {msg: '请选择指定门店！'}
                );
                return ;
            }
            $scope.queryParams.groupId = '';
        }else if($scope.queryParams.visibleRange == '4'){
            if(!$scope.queryParams.groupId){
                ws.alert(
                    {msg: '分组名称不能为空！'}
                );
                return ;
            }
            $scope.queryParams.mchtNo = '';
        }else if($scope.queryParams.visibleRange == '1'){
            $scope.queryParams.mchtNo = '';
            $scope.queryParams.groupId = '';
        }
        /*console.log($scope.queryParams, '9090')*/

        if($scope.ngTable){
            $scope.ngTable.reload();
        }else {
            $scope.ngTable = new NgTableParams(
                {page : 1, count : 10},
                {
                    getData : function(params){
                        $scope.queryParams.page = params.page();
                        $scope.queryParams.rows = params.count();

                        return userInfo.get('mchtBill/settleDetails/listPage.json', $scope.queryParams, true).then(function(res){
                            $scope.ifSearched = true;

                            if(res.object){
                                params.total(res.object.pageData.totalRows);

                                $scope.noData = false;
                                $scope.settleAmt = res.object.settleAmt;
                                $scope.waitingSettleAmt = res.object.waitingSettleAmt;

                                angular.forEach(res.object.pageData.list, function(data, index){
                                    res.object.pageData.list[index].settleDate = data.settleDate.substr(0, 4) + '-' + data.settleDate.substr(4, 2) + '-' + data.settleDate.substr(6, 2);
                                    res.object.pageData.list[index].ifFailed = (data.settleState == '结算失败');
                                });

                                return res.object.pageData.list;
                            } else {
                                /*$scope.noData = res.message || '暂无数据';*/
                                $scope.settleAmt = '';
                                $scope.waitingSettleAmt = '';
                                $scope.noData = '暂无数据';
                                return [];
                            }
                        })
                    }
                }
            );
        }
    }
    $scope.getExcel = function(){
        if($scope.noData) return ws.alert({msg: '暂无数据可供下载'});
        var times = 0,fileArr = [];
        userInfo.get('mchtBill/settleDetails/download',$scope.queryParams, true).then(function(res){
            $scope.downloading = true;
            $scope.downloadTip = "正在下载...";
            var timeInterval = setInterval(function(){
                times++;
                userInfo.get('report/polling').then(function(res){
                    if(res.object && res.object.length > 0){
                        for(var i=0,l=res.object.length; i<l; i++){
                            fileArr.push(res.object[i].data);
                        }
                        downloadFile.download(fileArr);
                        clearInterval(timeInterval);
                        $scope.downloading = false;
                        $scope.downloadTip = "下载结算记录"
                    }
                });
                //超过一分钟结束轮询
                if(times > 20){
                    clearInterval(timeInterval);
                    $scope.downloading = false;
                    $scope.downloadTip = "下载结算记录";
                    /*ws.alert({msg:"下载失败，请重试！"});*/
                    ws.noAjaxDialogOneBtn('下载失败，请重试！', function(){});
                }
            },5000)
        });
        //test
        //downloadFile.download(["./static/file/test.rar"]);
    };

    // 默认查询
    $scope.search(true);

    function querySearch (text) {
        console.log('querySearch');
        var deferred = $q.defer();
        if(text == null){
            deferred.resolve([]);
        }else{
            userInfo.get('mcht/listByName', {mchtName: text,mchtStatus:3}, true).then(function(res){
                if(res.object.length == '1'){//用户没点击选择框时，从这里赋值用户输入的mchtNo
                    $scope.queryParams.mchtNo = res.object[0].mchtNo;
                }else if(!res.object.length){//搜索不到门店时，清空mchtNo
                    $scope.queryParams.mchtNo = '';
                }
                deferred.resolve(res.object);
            })
        }
        return deferred.promise;
    }
    function searchTextChange(text) {
        $log.info('Text changed to ' + text);
        if(!text){//清空输入框时，清空mchtNo
            $scope.queryParams.mchtNo = '';
        }
    }
    function selectedItemChange(item) {
        if(item){
            $scope.queryParams.mchtNo = item.mchtNo;
        }
        $log.info('Item changed to ' + JSON.stringify(item));
    }

    //重置
    $scope.reload = function(){
        $scope.queryParams.visibleRange = "1";
        $scope.queryParams.chaCode = "0";
        //默认7天
        $scope.date.begin = new Date(+new Date() - 6 * numTime);
        $scope.date.end = new Date();
        $scope.queryParams.startDate = $date.format($scope.date.begin, 0).string;
        $scope.queryParams.endDate = $date.format($scope.date.end, 0).string;
        $scope.ngTable.page(1);
        $scope.ngTable.reload();
    }
})