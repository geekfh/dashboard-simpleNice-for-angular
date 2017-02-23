/**
 * Created by xuye on 2016/11/28.
 */
app.controller('autoCoupon.rule.controller',['$scope', 'coupons.list.service', '$state', 'userInfo', '$mdDialog','tplUrl',
    function($scope, Service, $state, userInfo, $mdDialog, tplUrl){
    var vm = this;
    vm.pageTab = $state.params.type;
    vm.queryParams = {}; //type: 3-新会员营销，4-濒临流失会员营销，5-消费次数奖励营销

    //首先判断是否授权微信公众账号，若授权则页面不显示新会员营销,默认显示濒临流失会员营销
    userInfo.get('mcht/info.json').then(function(res){
        vm.user = res.object;
        if(vm.user.authStatus && vm.user.authStatus == '1'){

            if(vm.pageTab == 'lost' || !vm.pageTab){
                vm.queryParams.type = '4';
                vm.pageTab = 'lost';
            }
            if(vm.pageTab == 'count') vm.queryParams.type = '5';

        }else{
            if(vm.pageTab == 'new' || !vm.pageTab){
                vm.queryParams.type = '3';
                vm.pageTab = 'new';
            }
            if(vm.pageTab == 'lost') vm.queryParams.type = '4';
            if(vm.pageTab == 'count') vm.queryParams.type = '5';
        }
        vm.initTabPage();

    });
    //新会员营销
    /*
    * 保存、取消、设置新会员营销规则
    * */

    //调接口判断是否有新会员营销规则 有则显示 无则编辑
    vm.initTabPage = function(){
        userInfo.get('cards/sendCenter/couponRuleList',{type:vm.queryParams.type}, true).then(function(res){
            if(res.object.couponRule && res.object.couponRule.length){
                if(vm.queryParams.type == '3'){
                    vm.showEditNew = false;
                    vm.showNewRule = true;
                    vm.newRules = res.object.couponRule;
                    //判断是否开启规则 0-停用，1-启用
                    vm.openNewRule = res.object.couponRule[0].status;
                }
                if(vm.queryParams.type == '4'){
                    vm.showEditLost = false;
                    vm.showLostRule = true;
                    vm.lostRules = res.object.couponRule;
                    //判断是否开启规则 0-停用，1-启用
                    vm.openLostRule = res.object.couponRule[0].status;
                }
                if(vm.queryParams.type == '5'){
                    vm.showEditCount = false;
                    vm.showCountRule = true;
                    vm.countRules = res.object.couponRule;
                    vm.openCountRule = [];
                    //判断是否开启规则 0-停用，1-启用
                    //vm.openCountRule = res.object.couponRule[0].status;
                }

            }else{
                if(vm.queryParams.type == '3'){
                    vm.showEditNew = true;
                    vm.showNewRule = false;
                    vm.createNewRule = {};
                    //默认值
                    vm.createNewRule.giftCondition = '激活会员';
                    vm.createNewRule.giftCount = 1;
                    vm.newRules = [{}];
                }
                if(vm.queryParams.type == '4'){
                    vm.showEditLost = true;
                    vm.showLostRule = false;
                    vm.createLostRule = {};
                    //默认值
                    vm.createLostRule.consumeTimes = 1;
                    vm.createLostRule.lastConsumeDays = 30;
                    vm.createLostRule.giftCount = 1;
                    vm.lostRules = [{}];
                }
                if(vm.queryParams.type == '5'){
                    vm.showEditCount = true;
                    vm.showCountRule = false;
                    vm.createCountRule = {};
                    //默认值
                    vm.createCountRule.consumeTimes = 3;
                    vm.createCountRule.giftCount = 1;
                    vm.countRules = [{}];
                }

            }
            /*if(vm.user && vm.user.authStatus == '1' && vm.queryParams.type == '4'){
                document.getElementById('lost').style.display = 'block';
            }*/
        })
    };


    //保存
    vm.saveNew = function(){
        if(!(vm.createNewRule && vm.createNewRule.cardId))
            return  ws.alert({msg:'请选择优惠券！'});

        //if(vm.createNewRule.title) delete vm.createNewRule.title;
        var ruleId = vm.newRules[0].ruleId || null;
        updateRules(vm.createNewRule, ruleId);
    };
    //取消
    vm.cancelNew = function(){
        vm.showEditNew = false;
        vm.showNewRule = true;
    };

    //设置新会员营销规则
    vm.setNewRule = function(){
        vm.showEditNew = true;
        vm.showNewRule = false;
        vm.createNewRule = {};
        vm.createNewRule.giftCondition = vm.newRules[0].giftCondition;
        vm.createNewRule.giftCount = vm.newRules[0].giftCount;
        vm.createNewRule.title = vm.newRules[0].title;
        vm.createNewRule.cardId = vm.newRules[0].cardId;
    }

    //濒临流失会员营销
    //取消
    vm.cancelLost = function(){
        vm.showEditLost = false;
        vm.showLostRule = true;
    }
    //保存
    vm.saveLost = function(error){
        if(error) return vm.formError = true;
        if(!(vm.createLostRule && vm.createLostRule.cardId))
            return  ws.alert({msg:'请选择优惠券！'});

        //if(vm.createLostRule.title) delete vm.createLostRule.title;
        var ruleId = vm.lostRules[0].ruleId || null;
        updateRules(vm.createLostRule, ruleId);

    }
    //设置
    vm.setLostRule = function(){
        vm.showEditLost = true;
        vm.showLostRule = false;
        vm.createLostRule = {};
        vm.createLostRule.consumeTimes = vm.lostRules[0].consumeTimes;
        vm.createLostRule.lastConsumeDays = vm.lostRules[0].lastConsumeDays;
        vm.createLostRule.title = vm.lostRules[0].title;
        vm.createLostRule.cardId = vm.lostRules[0].cardId;
        vm.createLostRule.giftCount = vm.lostRules[0].giftCount;
    }

    //消费次数奖励营销
    //取消
    vm.cancelCount = function(){
        vm.showEditCount = false;
        vm.showCountRule = true;
    }
    //保存
    vm.saveCount = function(error){
        if(error) return vm.formError = true;
        if(!(vm.createCountRule && vm.createCountRule.cardId))
            return  ws.alert({msg:'请选择优惠券！'});

        //if(vm.createCountRule.title) delete vm.createCountRule.title;
        var ruleId =  null;
        updateRules(vm.createCountRule, ruleId);

    }
    //设置
    /*vm.setCountRule = function(){
        vm.showEditCount = true;
        vm.showCountRule = false;
        vm.createCountRule = {};
        vm.createCountRule.consumeTimes = vm.countRules[0].consumeTimes;
        vm.createCountRule.title = vm.countRules[0].title;
        vm.createCountRule.cardId = vm.countRules[0].cardId;
        vm.createCountRule.giftCount = vm.countRules[0].giftCount;
    }*/

    //添加
    vm.addCountRule = function(){
        if(vm.countRules && vm.countRules.length < 5){
            vm.showEditCount = true;
            vm.showCountRule = false;
            vm.createCountRule = {};
            //设置默认值
            vm.createCountRule.consumeTimes = 3;
            vm.createCountRule.giftCount = 1;
        }
        else{
           return ws.alert({msg:'本营销规则最多添加5条'})
        }

    }

    //删除
    vm.delCountRule = function(ruleId){
        userInfo.get('cards/sendCenter/del/' + ruleId).then(function(res){
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
                controller : function(scope){
                    scope.onlyTip = true;
                    scope.tip = '删除成功';
                    setTimeout(
                        function(){
                            $mdDialog.hide();
                            //更新规则列表
                            vm.queryParams.type = '5';
                            vm.initTabPage();
                        },1000);
                }
            })
        })
    }

    /*
    * 公共
    *
    * */
    vm.tabChange = function(type){
        if(type == 'new'){
            vm.queryParams.type = '3';
        }
        if(type == 'lost'){
            vm.queryParams.type = '4';
        }
        if(type == 'count'){
            vm.queryParams.type = '5';
        }
        vm.initTabPage()
    }

    //派发记录
    vm.showRecord = function(type, ruleId){
        $state.go('marketing.autoCoupon.record', {type:type,ruleId:ruleId});
    }
    //选择优惠券
    vm.selectCoupon = function(coupon){
        $scope.$emit('select.coupon.start',coupon, vm.queryParams.type)
    };
    //选择优惠券结束
    $scope.$on('select.coupon.end',function(eve,coupon){
        if(vm.queryParams.type == '3'){
            if(!vm.createNewRule) vm.createNewRules = {};
            vm.createNewRule.cardId = coupon.cardId;
            vm.createNewRule.title = coupon.title;
        }
        if(vm.queryParams.type == '4'){
            if(!vm.createLostRule) vm.createLostRule = {};
            vm.createLostRule.cardId = coupon.cardId;
            vm.createLostRule.title = coupon.title;
        }
        if(vm.queryParams.type == '5'){
            if(!vm.createCountRule) vm.createCountRule = {};
            vm.createCountRule.cardId = coupon.cardId;
            vm.createCountRule.title = coupon.title;
        }
    });

    //修改库存
    vm.editInventory = function(item){
        Service.editInventory(item);
    };

    function updateRules(rules, ruleId){
        var couponRules = angular.copy(rules);
        if(couponRules.title) delete couponRules.title;
        userInfo.post('cards/sendCenter/updateRule',{couponRule:JSON.stringify(couponRules), type:vm.queryParams.type, ruleId:ruleId}).then(function(res){
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
                controller : function(scope){
                    scope.onlyTip = true;
                    scope.tip = ruleId ? '更换成功':'操作成功';
                    setTimeout(
                        function(){
                            $mdDialog.hide();
                            //显示会员激活送券规则
                            vm.initTabPage();
                        },1000);
                }
            })
        });
    }
    //停用or启用
    vm.switchIsOpening = function(type, ruleId, $index){
        var status, tipText;
        if(type == 'new'){
            vm.queryParams.type = '3';
            status = vm.openNewRule == '1' ? '0' : vm.openNewRule == '0' ? '1' : '';
        }
        if(type == 'lost'){
            vm.queryParams.type = '4';
            status = vm.openLostRule == '1' ? '0' : vm.openLostRule == '0' ? '1' : '';
        }
        if(type == 'count'){
            vm.queryParams.type = '5';
            status = vm.openCountRule[$index] == '1' ? '0' : vm.openCountRule[$index] == '0' ? '1' : '';
        }

        userInfo.get('cards/sendCenter/switch', {type:vm.queryParams.type, status:status, ruleId:ruleId}, true).then(function(res){
            //开启
            if(status == '1'){
                if(res.code == '-311') return ws.alert({msg:'当前优惠券库存为0，当前规则已停用，请及时补充优惠券库存', time:3000});
                if(res.code == '-310') return ws.alert({msg:'当前优惠券已过期，当前规则已停用，请及时更换优惠券', time:3000});
                if(res.code == '-309') return ws.alert({msg:'当前优惠券已删除，当前规则已停用，请及时更换优惠券', time:3000});
                if(res.code == '0'){
                    if(type == 'new'){
                        vm.openNewRule = '1';
                        tipText = '新会员营销-已启用';
                    }
                    if(type == 'lost'){
                        vm.openLostRule = '1';
                        tipText = '濒临流失会员营销-已启用';
                    }
                    if(type == 'count'){
                        vm.openCountRule[$index] = '1';
                        tipText = '消费次数奖励营销-已启用';
                    }
                }
            }
            //关闭
            if(status == '0'){
                if(res.code == '0'){
                    if(type == 'new'){
                        vm.openNewRule = '0';
                        tipText = '新会员营销-已停用';
                    }
                    if(type == 'lost'){
                        vm.openLostRule = '0';
                        tipText = '濒临流失会员营销-已停用';
                    }
                    if(type == 'count'){
                        vm.openCountRule[$index] = '0';
                        tipText = '消费次数奖励营销-已停用';
                    }
                }
            }
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
                controller : function(scope){
                    scope.onlyTip = true;
                    scope.tip = tipText;
                    setTimeout(function(){$mdDialog.hide();},1500);
                }
            })
        })
    }

}]);





























