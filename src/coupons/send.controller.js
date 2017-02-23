app.controller('coupons.send.controller', ['coupons.list.service','NgTableParams','$date','userInfo','$scope','$filter','$rootScope','tplUrl','$mdDialog','$state',
    function (Service, NgTableParams, $date, userInfo, $scope, $filter, $rootScope, tplUrl, $mdDialog,$state) {

    var vm = this;

    vm.queryParams = {};
    vm.queryParams.type = '1';  //默认显示关注微信公众号派券页面 1-微信派券；2-小票派券
    vm.showWechatRule = true;  //未避免页面闪动默认显示规则页面
    //首先判断是否授权微信公众账号，若授权则页面显示关注微信派券，若未授权则页面显示小票派券
    userInfo.get('mcht/info.json').then(function(res){
        vm.user = res.object;
        if(vm.user.authStatus && vm.user.authStatus == '1'){
            vm.queryParams.type = '1';
            vm.pageTab = 'wechat';
        }else{
            vm.queryParams.type = '2';
            vm.pageTab = 'receipts';
        }
        initPage();

    });
    //调接口判断是否开启微信和小票派券功能控制页面显示
    function initPage(){
        userInfo.get('cards/grant/check.json',{ type:vm.queryParams.type }, true).then(function(res){
            //微信
            if(vm.queryParams.type == '1'){
                vm.isOpeningWechat = res.object;
            }
            //小票
            else if(vm.queryParams.type == '2'){
                vm.isOpeningReceipts = res.object
            }
            //清空派券规则
            /*vm.weChatRules = [];*/
            //若功能已开启，查看派券详情or显示优惠券列表/选择小票派券规则页面
            if(res.object == '1'){
                userInfo.get('cards/grant/detail',{type:vm.queryParams.type}, true).then(function(res){
                    //显示派券规则
                    if(res.object.couponRule && res.object.couponRule.length){
                        if(vm.queryParams.type == '1'){
                            vm.weChatRules = res.object.couponRule;
                            vm.showWechatRule = true
                        }
                        if(vm.queryParams.type == '2'){
                            vm.receiptsRules = res.object.couponRule;
                            vm.showReceiptsRule = true;
                        }
                    }

                    //显示优惠券列表/选择小票派券规则页面
                    else{
                        if(vm.queryParams.type == '1'){
                            initCouponList();
                            vm.showWechatRule = false
                        }

                        if(vm.queryParams.type == '2'){
                            vm.receiptsRules = [];
                            vm.createReceiptsRules = [{}];  //默认显示一条编辑规则
                            vm.showReceiptsRule = false;
                        }
                    }
                })
            }

        })
    }

    //切换页面显示关注微信公众号派券/小票派券
    vm.tabChange = function(type,$event){
        vm.queryParams.type = type;
        initPage();
    };

    //切换关注微信公众号/小票是否派券开关
    vm.switchIsOpening = function(isOpening, type){
        //开启
        if(isOpening == '0'){
            userInfo.get('cards/grant/open.json', {type:type}, true).then(function(res){
                if(type == '1'){
                    if(res.code == '-109'){
                    //if(res.code == '0'){
                        $mdDialog.show({
                            clickOutsideToClose: true,
                            templateUrl: tplUrl + 'tpl/common/mdDialogTip.html',
                            controller: function(scope,$sce){
                                scope.onlyTip = false;
                                scope.hideCancel = true;
                                scope.title = '未开通消息与菜单权限';
                                scope.content = $sce.trustAsHtml('您的微信公众号未开通消息与菜单权限，请登录<a href="https://mp.weixin.qq.com/" target="_blank">微信公众平台</a>左侧菜单栏中“添加功能插件”按钮，开通消息与菜单功能。</br>开通后，需要在商户平台重新授权微信公众号才可使用。</br></br><a target="_blank" class="underline" href="https://huipos.kf5.com/hc/kb/article/1001010/?from=draft">查看开通指引</a>');
                                scope.cancel = function(){
                                    $mdDialog.cancel();
                                };
                                scope.submit = function(){
                                    $mdDialog.cancel();
                                }
                            }
                        })
                        return;
                    }
                    vm.isOpeningWechat =  '1';
                    vm.showWechatRule = false;
                    initCouponList();
                }
                if(type == '2'){
                    vm.isOpeningReceipts = '1';
                    vm.createReceiptsRules = [{}];
                    vm.showReceiptsRule = false;

                }
            })
        }
        //关闭
        if(isOpening == '1'){
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: tplUrl + 'tpl/common/mdDialogTip.html',
                controller: function(scope,$sce){
                    scope.onlyTip = false;
                    scope.title = '确认关闭？';
                    if(type == '1')
                        scope.content = $sce.trustAsHtml('关闭“关注微信派券”后，消费者第一次关注公众号后，系统将不再自动推送优惠券。');
                    if(type == '2')
                        scope.content = $sce.trustAsHtml('关闭“小票派券”后，消费者使用POS支付后，POS将不再自动打印优惠券二维码。');
                    scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    scope.submit = function(){
                        userInfo.get('cards/grant/close.json', {type:type}, true).then(function(res){
                            if(type == '1'){
                                vm.lastSelectedId = '';
                                vm.selectedId = '';
                                vm.weChatRules = [];
                                vm.isOpeningWechat = '0';
                                vm.updateWeChartRule = false;
                            }
                            if(type == '2'){
                                vm.isOpeningReceipts =  '0';
                                vm.createReceiptsRules = [];
                                vm.receiptsRules = [];
                                vm.updateReceiptsRule = false;
                            }
                            $mdDialog.cancel();
                        })
                    }
                }
            })
        }

    };

    //初始化微信送券优惠券列表
    function initCouponList(){
        if(vm.weChatRules && vm.weChatRules.length){
            vm.lastSelectedId = vm.weChatRules[0].cardId;
        }else{
            vm.lastSelectedId = ''
        }
        vm.ngTable1 = new NgTableParams({page: 1, count: 10},{
            getData: function(params) {
                vm.queryParams.page = params.page();
                vm.queryParams.rows = params.count();
                vm.queryParams.type = '1';

                return userInfo.get('cards/couponList.json', vm.queryParams, true).then(function(res){
                    params.total(res.object.totalRows);
                    if(res.code == 0){
                        if(res.object.list && res.object.list.length){
                            vm.noData1 = false;
                            var int = ws.indexOf(vm.lastSelectedId, res.object.list, 'cardId');
                            if(int === false) vm.lastSelectedId = '';
                        }else{
                            vm.noData1 = true;
                        }
                    }else{
                        vm.noData1 = true;
                    }
                    return res.object.list||[]
                })
            }
        });
    }

    //保存派券规则
    vm.save = function(rule, type, error){
        //微信派券
        if(type == 1){
            if(!rule) return ws.alert({msg:'请选择优惠券！'});
            userInfo.post('cards/grant/updateRule',{type:type,couponRule:rule}).then(function(res){
                $mdDialog.show({
                    clickOutsideToClose: true,
                    templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
                    controller : function(scope){
                        scope.onlyTip = true;
                        scope.tip = vm.updateWeChartRule ? '更换成功':'操作成功';
                        setTimeout(
                            function(){
                                $mdDialog.hide();
                                //显示派券规则
                                userInfo.get('cards/grant/detail',{type:type}, true).then(function(res){
                                    if(res.object.couponRule && res.object.couponRule.length){
                                        vm.weChatRules = res.object.couponRule;
                                        vm.showWechatRule = true;
                                    }
                                })
                            },1000);
                    }
                })
            });
        }
        //小票派券
        if(type == 2){
            if(error) return vm.formError = true;
            //判断是否都选择了优惠券、是否有重复输入金额
            var length = rule.length;
            for(var i = 0; i < length; i++){
                for(var j = 0; j < length; j++){
                    if(i != j && rule[i].amount == rule[j].amount && rule[i].amount && rule[j].amount)
                        return ws.alert({msg:'规则金额不能重复'});
                }
            }
            for(var k = 0; k < length; k++){
                if(!rule[k].cardId)
                    return ws.alert({msg:'请选择优惠券'});
            }
            var createRule = [];
            for(var l = 0; l < length; l++){
                createRule[l] = {};
                createRule[l].cardId = rule[l].cardId;
                createRule[l].amount = rule[l].amount || 0;
            }


            createRule = JSON.stringify(createRule);
            userInfo.post('cards/grant/updateRule',{type:type,couponRule:createRule}).then(function(res){
                $mdDialog.show({
                    clickOutsideToClose: true,
                    templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
                    controller : function(scope){
                        scope.onlyTip = true;
                        scope.tip = vm.updateReceiptsRule ? '更换成功':'操作成功';
                        //scope.tip ='新会员营销—已停用';
                        setTimeout(
                            function(){
                                $mdDialog.hide();
                                //显示派券规则
                                userInfo.get('cards/grant/detail',{type:type}, true).then(function(res){
                                    if(res.object.couponRule && res.object.couponRule.length){
                                        vm.receiptsRules = res.object.couponRule;
                                        vm.showReceiptsRule = true;
                                    }
                                })
                            },1000);
                    }
                })
            });
        }
    };

    //取消选择优惠券
    vm.cancel = function(){
        vm.showWechatRule = true;
    }
    vm.cancelweChat = function(){
        vm.showWechatRule = true;
    };

    //取消选择派券规则
    vm.cancelReceipts = function(){
        vm.showReceiptsRule = true;
    };

    //更新派券规则
    vm.update = function(type){
        //微信
        if(type == 1){
            vm.updateWeChartRule = true;
            vm.showWechatRule = false;
            initCouponList();
        }
        //小票
        if(type == 2){
            vm.updateReceiptsRule = true;
            vm.showReceiptsRule = false;
            initRuleList();
        }
    };
    //初始化小票送券规则
    function initRuleList(){
        userInfo.get('cards/grant/detail',{type:'2'}, true).then(function(res){
            //显示派券规则
            var rules = res.object.couponRule;
            if(rules && rules.length){
                vm.createReceiptsRules = [];
                for(var i = 0, length = rules.length; i < length; i++){
                    vm.createReceiptsRules[i] = {};
                    vm.createReceiptsRules[i].cardId = rules[i].cardId;
                    vm.createReceiptsRules[i].amount = rules[i].amount || 0;
                    vm.createReceiptsRules[i].title = rules[i].title;
                }
            }
            else{
                vm.createReceiptsRules = [{}];  //显示一条空规则
            }
        })
    }

    //修改库存
    vm.editInventory = function(item){
        Service.editInventory(item);
    };

    var ruleIndex, maxRuleLength = 10;
    //选择优惠券
    vm.selectCoupon = function(index, coupon){
        ruleIndex = index;
        $scope.$emit('select.coupon.start',coupon, vm.queryParams.type)
    };
    //选择优惠券结束
    $scope.$on('select.coupon.end',function(eve,coupon){
        if(!vm.createReceiptsRules) vm.createReceiptsRules = [{}];
        vm.createReceiptsRules[ruleIndex].cardId = coupon.cardId;
        vm.createReceiptsRules[ruleIndex].title = coupon.title;

    });
    //添加规则
    vm.addRule = function(){
        if(vm.createReceiptsRules.length >= maxRuleLength) return ws.alert({msg: '最多添加十条规则!'});
        else vm.createReceiptsRules.push({});
    };

    //删除规则
    vm.deleteRule = function(index){
        vm.createReceiptsRules.splice(index, 1);
    };

    //创建优惠券
    vm.createCoupons = function(){
        $state.go('coupons.list');
    }
    
}]);
