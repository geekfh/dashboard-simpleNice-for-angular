/**
 * Created by xuye on 2016/7/15.
 */
app.controller("merchantInfoController",function($scope, $timeout, $mdDialog, tplUrl, userInfo, ngTableParams, $q, $rootScope, ws, baseUrl,$http){

    /*
     * 判断用户角色---商户用户角色如下
     * StoreAdmin-个体商户管理员,  StoreCashier-个体商户门店收银员， BrandAdmin-品牌管理员，BrandStoreAdmin-品牌门店管理员,BrandStoreCashier-品牌门店收银员
     * */
    if($rootScope.userInfo){
        $rootScope.userInfo.role=='BrandAdmin' || $rootScope.userInfo.role=='BrandStoreAdmin' || $rootScope.userInfo.role=='BrandStoreCashier' ? $scope.isBrand = true : $scope.isBrand = false;
    }else{
        userInfo.getUser().then(function(res){
            res.object.role=='BrandAdmin' || res.object.role=='BrandStoreAdmin' || res.object.role=='BrandStoreCashier' ? $scope.isBrand = true: $scope.isBrand = false;
        });
    }
    //查询接口获取商户基本信息
    userInfo.get('/sys/getMchtInfo'/*, {mchtName: text}*/).then(function(res){
        $scope.basicInfo = res.object;
        if(res.object &&　res.object.images){
            /*for(var i = 0, length = res.object.images.length; i++; i<length){
                if(res.object.images[i][name] == 'license'){
                    $scope.basicInfo.licenseImg = res.object.images[i][value];
                }
            }*/
            $scope.basicInfo.licenseImg = res.object.images.license;
        }
        //if(!$scope.isBrand) $scope.basicInfo.brandMchtName = $scope.basicInfo.mchtName;
        /*if(!$scope.basicInfo.brandMchtName){
            $scope.basicInfo.brandMchtName = $scope.basicInfo.mchtName;
        }*/
     });



    //若是集团商户，需要判断是否授权
    if(!($rootScope.powers && $rootScope.powers.length)){
        userInfo.getWigets().then(function(res){
            $rootScope.powers = res;
            if($rootScope.powers.indexOf('settings.merchantInfo_brand.logo.update') >　-1){
                userInfo.get('merchant/info').then(function(res) {
                    $scope.wxchatData = res.object;
                    if($scope.wxchatData.weixinType == 1 && $scope.wxchatData.authStatus == 1 ){
                        $scope.canEdit = false;
                    }else{
                        $scope.canEdit = true;
                    }

                });
            }
        })
    }else if($rootScope.powers.indexOf('settings.merchantInfo_brand.logo.update') >　-1){
        userInfo.get('merchant/info').then(function(res) {
            $scope.wxchatData = res.object;
            if($scope.wxchatData.weixinType == 1 && $scope.wxchatData.authStatus == 1 ){
                $scope.canEdit = false;
            }else{
                $scope.canEdit = true;
            }

        });
    }
    function countHan(str){
        var totalCount = 0;
        for(var i=0; i<str.length; i++){

            var c = str.charCodeAt(i);

            if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)){
                totalCount++;
            }
            else{
                totalCount+=2;
            }
        }
        return totalCount;
    }




    //修改基本信息
    $scope.editBrandName = function(){
        if(!$scope.basicInfo.brandMchtName) return ws.alert({msg:'名称不能为空'});
        /*userInfo.put('merchant/info',{brandName:$scope.basicInfo.brandMchtName},true).then(function(res){
            console.log(res);
        })*/
        var count = countHan($scope.basicInfo.brandMchtName || '');
        var han = document.getElementById("mchtName").attributes["han"].value;
        if(count > han) return ws.alert({msg:'输入字符超出限制'});
        var formData = new FormData();
        formData.append('brandName', $scope.basicInfo.brandMchtName);

        userInfo.post('merchant/info', formData, '',true).then(function(res){
            if(res.code == '0')
                ws.alert({msg:'修改成功'});
        })
    };
    $scope.editBasicInfo = function(){
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/settings/merchantInfoEdit.html',
            controller: function($scope, $rootScope){
                //console.log($scope)
                $scope.close = function(){
                    $mdDialog.hide();
                };
                $scope.pic = {};
                $scope.icon_file = ''
                //上传图片
                /*$scope.$on('aaa', function(eve){
                    console.log($scope.pic)
                })*/

                //保存修改
                /*$scope.$watch('pic',function(newValue,oldValue){
                    console.log("newValue"+newValue);
                    $rootScope.$broadcast('uploadPic',"1111");
                })*/

            }
        }).then(function(data){
        });

    };
    /*$scope.$on('uploadPic',function(event,data){
        console.log("pic:"+data);
    });*/

    //额度信息

    //筛选类型
    /*$scope.selecteTypeList = [{name:"指定门店",id:"1"},{name:"指定分组",id:"2"},{name:"所有门店",id:"3"}];*/
    $scope.selecteTypeList = [{name:"指定门店",id:"1"}];

    $scope.isSearched = false;
    $scope.showSearching = false;
    $scope.isFirst = true;

    $scope.queryParams = {};
    $scope.queryParams.visibleRange = '1';
    $scope.queryParams.groupId = "";
    $scope.queryParams.mchtName = "";
    $scope.queryParams.mchtNo = "";


    //切换选择指定门店or分组or所有门店
    $scope.changeSelectedType = function(type){
        //复位请求参数
        $scope.queryParams.mchtNo = "";
        $scope.queryParams.mchtName = "";
        $scope.queryParams.groupId = "";

        //指定分组
        if(type == "2"){
            $scope.showGroup();
        }
    };

    //查询分组
    $scope.showGroup = function(){
        userInfo.get('/mchtGroup/listAll').then(function(res){
            $scope.groupList = res.object;
            if($scope.groupList.length > 0)
                $scope.groupList.unshift({"groupId": "", "groupName": "所有分组"});
            else
                $scope.groupList.unshift({"groupId": "", "groupName": "暂无分组"});
         })
    };

    $scope.querySearch   = querySearch;
    $scope.selectedItemChange = selectedItemChange;
    $scope.searchTextChange   = searchTextChange;

    //带输入框的下拉列表 搜索函数
    function querySearch (query) {
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
        $scope.queryParams.mchtName = text;
        $scope.queryParams.mchtNo = "";

    }
    //带输入框的下拉列表点击函数
    function selectedItemChange(item) {
        if(item){
           // $log.info("你选择的门店id是：" + item.mchtId + "你选择的门店名称是：" + item.mchtName);
            $scope.queryParams.mchtNo = item.mchtNo;
            $scope.queryParams.mchtName = item.mchtName;
        }
    }


    //查询额度信息
    var flag = false;
    $scope.search = function(){
        if(!$scope.queryParams.mchtNo){
            ws.alert({msg:"请选择指定门店！"});
            return;
        }
        console.log($scope.queryParams);
        $scope.showSearching = true;
        //第一次查询
        if(!flag){
            flag = true;
        }
        else{
            $scope.isSearched = false;
            $scope.isFirst = false;
        }
        getAmountInfo()
    };

    function getAmountInfo(){
        //var amountInfo;
        $scope.showSearching = true;
        $scope.isSearched = false;
        if($scope.ngTable){
            $scope.ngTable.page(1);
            $scope.ngTable.reload();
        }else{
            $scope.ngTable = new ngTableParams(
                {page: 1, count: 10, name: 'table1'},
                {
                    getData: function($defer, params) {
                        $scope.queryParams.page = params.page();
                        $scope.queryParams.rows = params.count();
                        userInfo.get('/sys/quotaPage', $scope.queryParams, true).then(function(res){
                            $scope.isSearched = true;
                            $scope.showSearching = false;
                            if(res.object &&　res.object.list.length > 0){
                                $scope.noData = false;
                                //amountInfo = ws.unique(res.object.list);
                                //params.total(res.object.totalRows);
                                params.total(1);
                                $defer.resolve(res.object.list);
                            }else{
                                params.total(0);
                                $scope.noData = true;
                                $scope.noDataInfo = '暂无数据';
                                $defer.resolve([]);
                            }
                        })
                    }
                }
            )
        }

    }

    //门店登录--立即获取额度信息
    $scope.showAmountInfo = function(){

        if(!($rootScope.powers && $rootScope.powers.length)){
            userInfo.getWigets().then(function(res){
                $rootScope.powers = res;
                if($rootScope.powers.indexOf('settings.merchantInfo_store.list') <　0){
                    $scope.queryParams.mchtNo = $rootScope.userInfo.mchtNo;
                    getAmountInfo();
                }
            })
        }else if($rootScope.powers.indexOf('settings.merchantInfo_store.list') < 0){
            $scope.queryParams.mchtNo = $rootScope.userInfo.mchtNo;
            getAmountInfo();
        }
    }

});



















