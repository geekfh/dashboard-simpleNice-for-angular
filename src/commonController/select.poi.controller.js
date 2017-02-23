app.controller('select.poi.controller', function ($scope, $rootScope, NgTableParams, $mdDialog, userInfo, $q) {
    $scope.queryParams = {};
    var pageData;
    $scope.ngTable = new NgTableParams(
        {page: 1, count: 10},
        {
            getData: function($defer, params) {
                $scope.queryParams.page = params.page();
                $scope.queryParams.rows = params.count();
                var url = 'poi/store/list.json';
                if(/create_f|edit_f/.test(location.href)) $scope.queryParams.type = 1;
                userInfo.get(url, $scope.queryParams, true).then(function(res){
                    $scope.start = true;
                    res = ws.changeRes(res);
                    params.total(res.object.totalRows);
                    if(res.object.list.length){
                        //默认没有勾选全选按钮
                        $rootScope.isCheckAll = false;
                        isCheckAll(res.object.list);

                        if(!$rootScope.poiLists) $rootScope.poiLists = [];
                        compare($rootScope.poiLists, res.object.list);
                        pageData = res.object.list;
                        $defer.resolve(res.object.list);
                    }else{
                        pageData = [];
                        $defer.resolve([]);

                    }
                })
            }
        }
    );
    //交易门店选择类型
    $scope.storeTypeList = [{storeType : "所有门店", value : "1"}, {storeType : "指定分组", value : "2"}, {storeType : "指定门店", value : "3"}];
    //默认全部门店
    $scope.selectedStoreType = 1;

    //选择门店类型
    $scope.changeStoreType = function(selectedType){
        //所有门店 清空参数
        if(selectedType == 1){
            $scope.queryParams.groupId = '';
            $scope.queryParams.storeName = '';
        }
        //获取门店所有分组
        if(selectedType == 2){
            $scope.queryParams.storeName = '';
            userInfo.get('mchtGroup/listAll.json').then(function(res){
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
        //指定门店
        if(selectedType == 3){
            $scope.queryParams.groupId = '';
        }
    };
    $scope.changeStoreGroup = function(selectedGroup){
        $scope.queryParams.groupId = selectedGroup;
    };

    /*$scope.querySearch   = querySearch;
    $scope.selectedItemChange = selectedItemChange;
    $scope.searchTextChange   = searchTextChange;

    function querySearch (text) {
        var deferred = $q.defer();
        if(text == null){
            deferred.resolve([]);
        }else{
            userInfo.get('poi/store/list', {storeName: text}, true).then(function(res){
                if(res.object.length == '1'){
                    //用户没点击选择框时，从这里赋值用户输入的mchtName
                    $scope.queryParams.storeName = res.object[0].mchtName;
                }
                deferred.resolve(res.object);
            })
        }
        return deferred.promise;
    }
    function searchTextChange(text) {
        if(!text){
            //清空输入框时，清空mchtName
            $scope.queryParams.storeName = '';
        }else{
            $scope.queryParams.storeName = text;
        }
    }
    function selectedItemChange(item) {
        if(item){
           // $scope.queryParams.mchtNo = item.mchtNo;
            $scope.queryParams.storeName = item.mchtName;
        }
    }*/

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
        $scope.ngTable.page(1);
        $scope.ngTable.reload();
    }
    //单个点击
    $scope.check = function(val, item){
        var ischeck = val ? false : true;
        if(ischeck){
            if(!$rootScope.poiLists) $rootScope.poiLists = [];
            $rootScope.poiLists.push(item);
            isCheckAll(pageData)
        }else{
            $rootScope.isCheckAll = false;
            //获取二级数组的索引值
            var int = ws.indexOf(item.merchantNo, $rootScope.poiLists, 'merchantNo')
            if(int !== false){
                if(!$rootScope.poiLists) $rootScope.poiLists = [];
                $rootScope.poiLists.splice(int, 1);
            }
        }
    };

    //判断是否勾选全选按钮
    function isCheckAll(list){
        var flag = true;
        angular.forEach(list, function(it){
            if(ws.indexOf(it.merchantNo, $rootScope.poiLists, 'merchantNo') === false){
                flag = false;
            }
        });
        $rootScope.isCheckAll = flag;
    }
    //关闭
    $scope.close = function(){
        $mdDialog.hide();
    }
    //确认
    $scope.confirm = function(){
        if(!$rootScope.poiLists || ($rootScope.poiLists && !$rootScope.poiLists.length)) return ws.alert({msg: '请选择门店'});
        $rootScope.$broadcast('select.poi.end', $rootScope.poiLists)
        $mdDialog.hide();
    }
    //对比
    function compare(array, list){
        if(!array || !array.length) return;
        for(var i in list){
            for(var j in array){
                if(array[j].merchantNo == list[i].merchantNo){
                    list[i].isCheck = true;
                    continue;
                }
            }
        }
    }
})