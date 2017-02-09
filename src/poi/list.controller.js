angular.module('poi.list', []).controller('poi.list.controller', function(ngTableParams, $mdDialog, tplUrl, $state, $rootScope, userInfo, $scope, $q, $timeout){
    //tabs标签页
    $scope.tabIndex = 'list';
    //二个table表格带的搜索参数
    $scope.queryParams = {};
    $scope.queryParams2 = {};
    $scope.user = {};
    //登录的商户门店
    var mchtName = '', mchtNo;
    userInfo.get('merchant/info').then(function(res){
        $scope.user = res.object;
    })

    //门店选择项
    $scope.groupOrNames = [{id: 1, text: '指定门店'}, {id: 2, text: '指定分组'}];
    $scope.selected = 1;
    //侦测下拉框选择的是门店名称还是门店分组
    $scope.$watch('selected', function(val){
        if(val == 1){
            $scope.queryParams.groupId = '';  
            $scope.queryParams.mchtName = '';  
        }else{
            $scope.queryParams.mchtName = '';
            $scope.queryParams.mchtId = ''; 
            getGroup();
        }
    })
    $scope.getGroup = getGroup;
    //获取所有分组信息
    function getGroup(){
        userInfo.get('mchtGroup/listAll').then(function(res){
            $scope.groups = res.object;
            if(!res.object.length){
                $scope.groups.unshift({groupId: '', groupName: '暂无分组'})
            }else{
                //$scope.groups.unshift({groupId: '', groupName: '全部分组'})
            }
        }) 
    }
    //带输入框的下拉列表 搜索函数    
    $scope.querySearch = function(text){
        console.log($scope.selectedMchtName);
        var deferred = $q.defer();
        if(text == null){
            deferred.resolve([]); 
        }else{
            userInfo.get('mcht/listByName', {mchtName: text, mchtStatus: 1}, true).then(function(res){
                deferred.resolve(res.object);
            })
        } 
        return deferred.promise;
    }
    //带输入框的文字改变时的搜索函数 
    $scope.searchTextChange = function(text){
        if(text) return $scope.querySearch(text);
        else $scope.queryParams.mchtId = '';
    }
    //带输入框的下拉列表点击函数
    $scope.selectedItemChange = function(item){
        item ? $scope.queryParams.mchtId = item.mchtId : void 0;
    }
    //切换tab标签
    $scope.tabChange = function(str){
        $scope.tabIndex = str;
        $scope.selected = 1;
        $scope.queryParams.mchtName = mchtName;
        $scope.queryParams.groupId = '';
        $scope.queryParams.mchtId = mchtNo;

        $scope.status = 1;
        //全部分组
        if(str == 'list'){

            //table 表格
            if($scope.ngTable){
                $scope.ngTable.page(1);
                $scope.ngTable.reload();
            }else{
                $scope.ngTable = new ngTableParams(
                    {page: 1, count: 10},
                    {
                        getData: function($defer, params) {

                            $scope.queryParams.page = params.page();
                            $scope.queryParams.rows = params.count();
                            console.log($scope.queryParams);
                            userInfo.get('mcht/listPage', $scope.queryParams, true).then(function(res){
                                isSearching = false;
                                if(!res.object) return $scope.noData = res.msg || '暂无数据', params.total(0), $defer.resolve([]);
                                params.total(res.object.totalRows);

                                if(res.object.list.length){
                                    $scope.noData = false;
                                    $defer.resolve(res.object.list);
                                }else{
                                    $scope.noData = res.msg || '暂无数据';
                                    $defer.resolve([]);
                                }

                            })
                        }
                    }
                )
            }
        }
        //分组列表
        if(str == 'group'){
            $scope.selectList = [];
            if($scope.ngTable2){
                $scope.ngTable2.page(1);
                $scope.ngTable2.reload();
            }else{
                $scope.ngTable2 = new ngTableParams(
                    {page: 1, count: 10},
                    {
                        getData: function($defer, params) {

                            $scope.queryParams.page = params.page();
                            $scope.queryParams.rows = params.count();

                            userInfo.get('mcht/group/listPage', $scope.queryParams, true).then(function(res){
                                isSearching = false;
                                if(!res.object) return $scope.noData = res.msg || '暂无数据', params.total(0), $defer.resolve([]);
                                params.total(res.object.totalRows);
                                if(res.object.list.length){
                                    $scope.noData2 = false;
                                    $defer.resolve(res.object.list);
                                    compare(res.object.list);
                                    $rootScope.checkAll = false;
                                }else{
                                    $scope.noData2 = res.msg || '暂无数据';
                                    $defer.resolve([]);
                                }

                            })
                        }
                    }
                )
            }
            //开始展示  开始分组
            $scope.status = 1;
            //开始禁用移出该组和分组到二个按纽
            $scope.selectState = false;
        }   
    }
    //对比函数
    function compare(array){
        if(!$scope.selectList.length) return;
        for(var i in array){
            for(var j in $scope.selectList){
                if(array[i].mchtId == $scope.selectList[j].mchtId){
                    array[i].ischeck = true;
                    continue;
                }
            }
        }
    }
    //搜索
    var isSearching = false;
    $scope.search = function(){
        if(isSearching) return;
        isSearching = true;
        $scope.selectList = [];
        if($scope.tabIndex == 'list'){
            $scope.ngTable.page(1);
            $scope.ngTable.reload();
        }
        if($scope.tabIndex == 'group'){
            $scope.ngTable2.page(1);
            $scope.ngTable2.reload();
        }
    }
    //默认选中登录商户，并自动查询
    userInfo.getUser().then(function(res){
        mchtName = res.object.mchtName;
        mchtNo = res.object.mchtId;
        $scope.selectedMchtName = mchtName;
        $scope.ifAutoShow = true;
        $scope.tabChange('list');

    });

    //侦测是否勾选了门店
    $scope.$watch('selectList.length', function(val){
        if(val) $scope.selectState = true;
        else $scope.selectState = false;
    })
    //
    $scope.groups = [];
    $scope.isOrder = false;
    
    //添加分组
    $scope.addGroup = function(){
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/common/add_group.html',
            controller: function(scope){
                scope.model = {};
                scope.close = function(){
                   $mdDialog.hide(); 
                }
                scope.confirm = function(err){
                    if(err){
                        return scope.formError = 'formError';
                    }else{
                        scope.formError = '';
                    }
                    userInfo.post('mchtGroup/create', scope.model).then(function(res){
                        ws.alert({msg: '添加分组成功', cb:function(){
                            $mdDialog.hide();
                            getGroup();
                        }});
                    })
                }
            }
        })
    }
    //移动到分组
    $scope.moveToGroup = function(item){
        moveOrRemove(item.groupId);
    }
    //移出分组
    $scope.removeGroup = function(){
        moveOrRemove();
    }
    function moveOrRemove(groupId){
        var obj = {};
        if(groupId){
            obj.type = '1';
            obj.groupId = groupId;
        }else{
            obj.type = '2';
        }
        obj.ids = [];
        angular.forEach($scope.selectList, function(it){
            obj.ids.push(it.mchtId);
        })
        userInfo.put('mchtGroup/grouping', obj).then(function(res){
            ws.alert(
                {msg: groupId ? '移动分组成功' : '移除分组成功', cb: function(){
                    $scope.ngTable2.reload();
                }
                }
            );
            clearSelectList(true)
        })
        
    }
    $scope.clearSelectList = clearSelectList;
    //清除已选择的 分组信息
    function clearSelectList(isFinish){
        angular.forEach($scope.ngTable2.data, function(ii){
            ii.ischeck = false;
        })
        $rootScope.checkAll = false;
        $scope.selectList = [];
        if(isFinish) $scope.status = 1;
    }
    //门店详情
    $scope.detail = function(id){
        $state.go('poi.detail', {id: id})
    }
    $scope.create = function(id){
        if($scope.user.authStatus != '1') return ws.alert({msg: '请先授权!'});
        localStorage.setItem("lastPoiPage","poi.list");
        $state.go('poi.create', {id: id})
    }
    //保存选择数据的数组
    $scope.selectList = [];
    //单选框
    $scope.changeCheck = function(item){
        var ischeck = item.ischeck ? false : true;
        if(ischeck){
            $scope.selectList.push(item);
        }else{
            $rootScope.checkAll = false;
            var index = ws.indexOf(item.mchtId, $scope.selectList, 'mchtId');
            $scope.selectList.splice(index, 1);
        }
    }
    //选择全部
    $scope.changeCheckAll = function(checked, data){
        checked = !checked;
        if(checked){
            angular.forEach(data, function(item, i){
                var index = ws.indexOf(item.mchtId, $scope.selectList, 'mchtId');
                item.ischeck = true;
                if(index === false){
                    $scope.selectList.push(item);
                }
            })
        }else{
            angular.forEach(data, function(item, i){
                var index = ws.indexOf(item.mchtId, $scope.selectList, 'mchtId');
                item.ischeck = false;
                if(index !== false){
                    $scope.selectList.splice(index, 1);
                }
            })
        }
    }
    //下载表格
    $scope.getExcel = function(e){
        if($scope.noData) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';

        for(var key in $scope.queryParams){
            if($scope.queryParams[key]){
                kv += key+'=' + $scope.queryParams[key] + '&';
            }
        }
        return e.target.href = '/server/s300/mcht/download?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };

    //重置
    $scope.reload = function(){
        $scope.selected = 1;
        $scope.queryParams.groupId = '';
        $scope.queryParams.mchtId = mchtNo;
        $scope.queryParams.mchtName = mchtName;
        $scope.selectedMchtName = mchtName;

        if($scope.tabIndex == 'list'){
            $scope.ngTable.page(1);
            $scope.ngTable.reload();
        }
        if($scope.tabIndex == 'group'){
            $scope.ngTable2.page(1);
            $scope.ngTable2.reload();
        }
    }


});



angular.module('poi.list').filter('poiFilter', function(){
    return function(status){
        return ['系统错误', '正在审核', '审核通过', '审核驳回'][status-1];
    }
});
angular.module('poi.list').filter('poiFilterMsg', function(){
    return function(status){
        return ['系统错误', '已提交至微信审核中，预计5个工作日内完成', '生效', '审核驳回'][status-1];
    }
});
