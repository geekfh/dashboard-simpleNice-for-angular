app.controller('clubcard.member.controller', function (NgTableParams, $state, $date, $scope, userInfo, $mdDialog, tplUrl, $sce, baseUrl, $rootScope, $http) {

    var vm = this, today = new Date(), numTime = 24 * 3600 * 1000;
    vm.queryParams = {};
    vm.start = true;
    //会员卡数据
    vm.memberCard = {};
    userInfo.get('mcht/info.json').then(function(res){
        vm.user = res.object;
        if(res.code == 0 && !ws.isEmptyObj(res.object)){
            userInfo.get('memberCards').then(function (res) {

                if(res.object.list && res.object.list.length){
                    vm.count = res.object.list.length;
                    vm.memberCard = res.object.list[0].card;
                    init()
                }else{
                    vm.count = res.object.count;
                    init();          //没有会员卡时也调获取会员接口
                }
            })
            function init(){
                vm.ngTable = new NgTableParams(
                    { page: 1, count: 10 },
                    {
                        getData: function ($defer, params) {
                            vm.queryParams.page = params.page();
                            vm.queryParams.rows = params.count();
                            vm.queryParams.lastUseDate = $date.format(vm.querylastUseDate).str;
                            userInfo.get('memberCardUsers', vm.queryParams, true).then(function (res) {
                                /*vm.totalBalance = res.object.totalBalance;
                                vm.totalBonous = res.object.totalBonus;*/
                                if(res.object.list.length){
                                    vm.noData = false;
                                    $defer.resolve(res.object.list);
                                    params.total(res.object.totalRows);
                                }else{
                                    vm.noData = res.msg || '暂无数据';
                                    $defer.resolve([]);
                                }

                            });
                        }
                    }
                );
                getTotalCount();
                isUploading();
            }
        }else{
            vm.noData = '暂无数据';
        }
    });

    //获取统计数据
    function getTotalCount(){
        userInfo.get('memberCardUsers/bbCount', vm.queryParams, true).then(function(res){
            vm.totalBalance = res.object.totalBalance;
            vm.totalBonous = res.object.totalBonus;
        })
    }
    //判断后台是否在处理上传数据
    function isUploading(){
        //会员
        $http.get(baseUrl + '/memberCardUsers/async/getUserImportResult',{}).then(function(res){
            //超时 -1006   正在导入 -1005
            if(res.data.code == '-1005' || res.data.code == '-1006'){
                vm.uploadMemOut = true;
                vm.memOutTxt = res.data.message;
            }else{
                vm.uploadMemOut = false;
                //vm.memOutTxt = res.data.message;
            }
        })
        //储值
        $http.get(baseUrl + '/memberCardStored/async/getImportResult',{}).then(function(res){
            //超时 -1006   正在导入 -1005
            if(res.data.code == '-1005' || res.data.code == '-1006'){
                vm.uploadRegOut = true;
               vm.regOutTxt = res.data.message;
            }else{
                vm.uploadRegOut = false;
                //vm.regOutTxt = res.data.message;
            }
        })
    }

    vm.today = new Date();
    vm.minDate = new Date('2015-01-01');

    vm.search = function () {
        if(vm.querylastUseDate) {
            vm.queryParams.lastUseDate = $date.format(vm.querylastUseDate).str
        }
        vm.ngTable.page(1);
        vm.ngTable.reload();
        getTotalCount();
    };

    // 重置查找条件
    vm.reload = function(){
        vm.queryParams = {};
        vm.querylastUseDate = '';
        vm.ngTable.page(1);
        vm.ngTable.reload();
        getTotalCount();
    };


    //进入详情页面
    vm.detail = function (item) {
        $state.go('clubcard.member.detail', { tel: item.membershipNumber });
    };
    //导入
    /*vm.importMember = function(){
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/common/importingMember.html',
            controller: function(scope, $http, baseUrl, $rootScope){
                scope.importMember = true;
                scope.close = function(){
                    $mdDialog.hide();
                };
                scope.confirm = function(){
                    if(!scope.pic.file) return ws.alert({msg: '请上传文件'});
                    var formData = new FormData();
                    formData.append('file', scope.pic.file);
                    formData.append('type', '1');
                    var url = 'memberCardUsers/import';
                    $http.post(baseUrl + url, formData, {
                        transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined
                        }
                    }).then(function(res){
                        ws.successback(res.data, function(){
                            if(ws.isEmptyObj(res.data.object)){ 
                                ws.alert({msg: '导入文件成功'})
                            }else{
                                var msg = '';
                                angular.forEach(res.data.object, function(v, k){
                                    msg += v + '</br>';
                                })
                                ws.alert({msg: msg, time: 5000})
                            }
                            $rootScope.$broadcast('uploadSuccess');
                            $mdDialog.hide();
                        })
                    })
                }
            }
        })
    }*/

    //批量充值-导入
    vm.import = function(type){
        if(type == 'recharge' && vm.uploadRegOut) return;
        if(type == 'member' && vm.uploadMemOut) return;
        importExcel(type);
    };
    function importExcel(type){
        if(!vm.count) return ws.alert({msg:'暂未创建会员卡'});
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/common/importingMember.html',
            controller: function(scope){
                if(type == 'recharge') scope.importRecharge = true;
                if(type == 'member') scope.importMember = true;
                scope.close = function(){
                    $mdDialog.hide();
                };
                scope.confirm = function(){
                    if(!scope.pic.file) return ws.alert({msg: '请上传文件'});
                    var formData = new FormData();
                    formData.append('file', scope.pic.file);
                    formData.append('type', '1');
                    var url = type == 'recharge' ? 'memberCardStored/importBalance' : type == 'member' ? 'memberCardUsers/import' : '';
                    $http.post(baseUrl + url, formData, {
                        transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined
                        }
                    }).then(function(res){
                        ws.successback(res.data, function(){
                            //if(!res.data.object || ws.isEmptyObj(res.data.object)){
                            if(res.data.code == '0'){
                                //ws.alert({msg: '导入文件成功'});
                                $rootScope.$broadcast('uploadSuccess', type);
                            }/*else{
                                /!*var msg = '';
                                 angular.forEach(res.data.object, function(v, k){
                                 msg += v + '</br>';
                                 })
                                 ws.alert({msg: msg, time: 5000})*!/
                                res.data.type = type;
                                $rootScope.$broadcast('uploadFaild',res.data)
                            }*/
                            $mdDialog.hide();
                        })
                    })
                }
            }
        })
    }
    //导入成功
    $scope.$on('uploadSuccess', function(event,data){
        //调接口查询后台上传过程
        var url = data == 'recharge' ? '/memberCardStored/async/getImportResult' : data == 'member' ? '/memberCardUsers/async/getUserImportResult' : '';
        var passCode = [-1002, -1005, -1006, 0, -1008];
        $http.get(baseUrl + url , {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            },
            timeout : 120000
        }).then(function (res) {
            if(passCode.indexOf(res.data.code) == -1)
                return ws.alert({msg:res.data.message});
            else
                dialogTip(data, res.data);
        });
    });
    function beforeUnload(e){
        var confirmationMessage = '确定离开此页吗？本页不需要刷新或后退';

        (e || window.event).returnValue = confirmationMessage;     // Gecko and Trident

        return confirmationMessage;                                // Gecko and WebKit
    }
    //弹出提示框实时提示上传结果
    function dialogTip(type, data){
        $mdDialog.show({
            clickOutsideToClose: false,
            templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
            controller : function(scope){
                var importUrl = type == 'recharge' ? '/memberCardStored/async/getImportResult' : type == 'member' ? '/memberCardUsers/async/getUserImportResult' : '';
                judgeCode(type, data);
                function judgeCode(type, data){
                    //正在进行
                    if(data.code == '-1005'){
                        $mdDialog.clickOutsideToClose = false;
                        scope.onlyTip = true;
                        scope.showLoading = true;
                        scope.tip = data.message;
                        //递归调用
                        $http.get(baseUrl + importUrl , {
                            transformRequest: angular.identity,
                            headers: {
                                'Content-Type': undefined
                            },
                            timeout : 120000
                        }).then(function (res) {
                            judgeCode(type, res.data);
                        });

                        //window.addEventListener('beforeunload',beforeUnload,false)
                    }else{
                        //window.removeEventListener('beforeunload',beforeUnload,false);
                        //导入成功
                        if(data.code == '0'){
                            $mdDialog.clickOutsideToClose = true;
                            scope.onlyTip = true;
                            scope.tip = type == 'recharge' ? '充值成功' : type == 'member' ? '导入成功' : '';
                            scope.showLoading = false;
                            setTimeout(
                                function(){
                                    $mdDialog.hide();
                                    vm.ngTable.reload();
                                    getTotalCount();
                                },1000);
                        }
                        //超时
                        else if(data.code == '-1006'){
                            $mdDialog.clickOutsideToClose = true;
                            scope.onlyTip = false;
                            scope.title = '充值超时';
                            scope.hideBtn = true;
                            scope.content = $sce.trustAsHtml(data.message);
                            scope.cancel = function(){
                                $mdDialog.cancel();
                            };
                            $rootScope.$broadcast('uploadOutTime',type, data)
                        }
                        //格式校验失败
                        else if(data.code == '-1002'){
                            $mdDialog.clickOutsideToClose = true;
                            scope.onlyTip = false;
                            scope.title = type == 'recharge' ? '充值失败' : type == 'member' ? '导入失败' : '';
                            scope.hideBtn = true;
                            var url = '/server/s300/downloadFile/errorExcel/' + data.object.errorFileName;
                            scope.content = $sce.trustAsHtml('导入的数据中有 <span class="colorRed">'+ data.object.errorCount + '</span> 条数据错误。<br>请下载 Excel 查看充值失败原因，错误数据已标红。<br>请将错误数据删除后再重新导入！<br><br> <a class="underline" href="' + url + '" target="_blank">点击下载Excel</a>');
                            scope.cancel = function(){
                                $mdDialog.cancel();
                            };
                        }
                        //无上传进程
                        else if(data.code == '-1008'){}
                        else{
                            $mdDialog.cancel();
                            ws.alert({msg:data.code})
                        }
                    }
                }
            }
        });
    }

    //导入超时
    $scope.$on('uploadOutTime',function(event, type, data){
        if(type == 'recharge'){
            vm.uploadRegOut = true;
            vm.regOutTxt = data.message;
        }
        if(type == 'member'){
            vm.uploadMemOut = true;
            vm.memOutTxt = data.message;
        }
    });

    //导入失败
    /*$scope.$on('uploadFaild',function(event, data){
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
            controller : function(scope){
                scope.onlyTip = false;
                scope.title = data.type == 'recharge' ? '充值失败' : data.type == 'member' ? '导入失败' : '';
                scope.hideBtn = true;
                var url = '/server/s300/downloadFile/errorExcel/' + data.object.errorFileName;

                //导入的数据中有 24 条数据错误。请下载 Excel 查看充值失败原因，错误数据已标红。请将错误数据删除后再重新导入！
                scope.content = $sce.trustAsHtml('导入的数据中有 <span class="colorRed">'+ data.object.errorCount + '</span> 条数据错误。<br>请下载 Excel 查看充值失败原因，错误数据已标红。<br>请将错误数据删除后再重新导入！<br><br> <a class="underline" href="' + url + '" target="_blank">点击下载Excel</a>');
                scope.cancel = function(){
                    $mdDialog.cancel();
                };
            }
        })
    });*/

    vm.getExcel = function(e){
        if(vm.noData) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';
        for(var key in vm.queryParams){
            if(vm.queryParams[key]){
                kv += key+'=' + vm.queryParams[key] + '&';
            }
        }
        return e.target.href = '/server/s300/memberCardUsers/material?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };
    vm.createCard = function(){
      userInfo.get('mcht/countAllChildMcht').then(function(res){
          if(res.object.mchtCount > 0) $state.go('clubcard.card.create1')
          else return ws.alert({msg: '请先创建门店'});  
      })
    }

    vm.status = {
        /*'': '全部状态',*/
        'NORMAL': '正常' ,
        'EXPIRE': '已过期' ,
        'UNACTIVE': '未激活'
        /*'DELETE': '已删除',*/
        /*'UNAVAILABLE': '已失效'*/
    }
});