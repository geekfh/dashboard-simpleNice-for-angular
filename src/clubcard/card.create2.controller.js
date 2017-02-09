app.controller('card.create2.controller', function ($state, $rootScope, $scope, userInfo, $filter) {
    //设置导航条
    $rootScope.nav = {};
    $rootScope.nav.clubcard = {};
    $rootScope.nav.clubcard.isShow = true;
    $rootScope.nav.clubcard.step = 2;
    $rootScope.nav.clubcard.firstText = '1 填写会员卡信息';
    $rootScope.nav.clubcard.secondText = '2 会员权益';
    $rootScope.nav.clubcard.thirdText = '3 储值规则';
    $rootScope.nav.clubcard.forthText = '4 功能设置';
    var vm = this, data = userInfo.data;
    vm.create = data.create || {};
    vm.myCardName = '白金会员';
    vm.create.evelLists = vm.create.evelLists || [];
    if(!$rootScope.isEdit){
        //添加
        if(ws.isEmptyObj(data)) return $state.go('clubcard.card.create1');

        if(vm.create.evelLists.length == 0){
            vm.create.evelLists =  [{}];
            vm.create.evelLists[0].lower_bonus_limit = 0;
        }
    }else{
        //编辑
        if(ws.isEmptyObj(data)) return $state.go('clubcard.card.edit1', {id: $state.params.id});
        if(!vm.create.evelLists.length) vm.create.evelLists = JSON.parse(vm.create.member_level_rule) || [{lower_bonus_limit : 0}];

    }
    //等级
    
    var maxEvelLength = 10;
    $scope.addEvel = function(){
        if(vm.create.evelLists.length >= maxEvelLength) return ws.alert({msg: '最多添加十种等级!'});
        else{
            vm.create.evelLists.push({});
            if(vm.create.evelLists.length == 1){
                vm.create.evelLists[0].lower_bonus_limit = 0;
            }
        }

    }
    $scope.deleteEvel = function(index){
        ws.noAjaxDialog('确定要删除该等级吗?', function(){
            vm.create.evelLists.splice(index, 1);
        })
    }
    //上一步
    $scope.back = function(){
        userInfo.data.create = vm.create;
        if(/create/.test(window.location.href)) $state.go('clubcard.card.create1');
        else $state.go('clubcard.card.edit1', {id: $state.params.id});
    }
    //下一步
    $scope.next = function(err){
        if(err) return vm.formError = true;
        else vm.formError = false;

        //消费送积分规则--若只是其中一个为0则返回
        if((vm.create.bonus_rule.cost_money_unit == 0 || vm.create.bonus_rule.increase_bonus == 0) && !(vm.create.bonus_rule.cost_money_unit == 0 && vm.create.bonus_rule.increase_bonus == 0))
            return;
        //积分抵扣规则--若只是其中一个为0则返回
        if((vm.create.bonus_deduction_rule.cost_bonus_unit == 0 || vm.create.bonus_deduction_rule.reduce_money == 0) && !(vm.create.bonus_deduction_rule.cost_bonus_unit == 0 && vm.create.bonus_deduction_rule.reduce_money == 0))
            return;

        var obj = data.obj;
        //积分规则
        obj.supply_bonus = '1';
        obj.supply_level = vm.create.supply_level == '1' ? '1' : '0';
        var error;
        if(vm.create.supply_level == '1'){
            for(var i = 0, length = vm.create.evelLists.length; i < length; i++){
                var item = vm.create.evelLists[i];
                var itemNext = vm.create.evelLists[i + 1] || {lower_bonus_limit: 100000000, upper_bonus_limit: 100000000, level_name: '', discount: 0}
                if(item.lower_bonus_limit >= item.upper_bonus_limit){
                    error = true;
                    ws.alert({msg: '等级' + (i+1) + '的开始积分大于结束积分!',time:4000});
                    break;
                }
                if(item.upper_bonus_limit >= itemNext.lower_bonus_limit){
                    error = true;
                    ws.alert({msg: '等级' + (i+1) + '的结束积分应小于等级' +(i+2)+ '开始积分!',time:4000});
                }
                if(item.discount < itemNext.discount){
                    error = true;
                    ws.alert({msg: '等级' + (i+1) + '的折扣应大于等级' +(i+2)+ '折扣!',time:4000});
                }
                if(item.$$hashKey) delete item.$$hashKey;
            }
            obj.member_level_rule = JSON.stringify(vm.create.evelLists);
        }else{
            obj.member_level_rule = '';
        }
        
        if(error) return;
        obj.bonus_rule = {};
        if(!vm.create.bonus_rule.cost_money_unit && vm.create.bonus_rule.cost_money_unit != 0)
            obj.bonus_rule.cost_money_unit = '';
        else
            obj.bonus_rule.cost_money_unit = vm.create.bonus_rule.cost_money_unit;

        if(!vm.create.bonus_rule.increase_bonus && vm.create.bonus_rule.increase_bonus != 0)
            obj.bonus_rule.increase_bonus = '';
        else
            obj.bonus_rule.increase_bonus = vm.create.bonus_rule.increase_bonus;

        if(!vm.create.bonus_rule.max_increase_bonus && vm.create.bonus_rule.max_increase_bonus != 0)
            obj.bonus_rule.max_increase_bonus = '';
        else
            obj.bonus_rule.max_increase_bonus = vm.create.bonus_rule.max_increase_bonus;

        if(!vm.create.bonus_rule.init_increase_bonus && vm.create.bonus_rule.init_increase_bonus != 0)
            obj.bonus_rule.init_increase_bonus ='';
        else
            obj.bonus_rule.init_increase_bonus = vm.create.bonus_rule.init_increase_bonus;
        //积分抵扣规则
        obj.bonus_deduction_rule = {};
        if(!vm.create.bonus_deduction_rule.cost_bonus_unit && vm.create.bonus_deduction_rule.cost_bonus_unit != 0)
            obj.bonus_deduction_rule.cost_bonus_unit = '';
        else
            obj.bonus_deduction_rule.cost_bonus_unit = vm.create.bonus_deduction_rule.cost_bonus_unit;

        if(!vm.create.bonus_deduction_rule.reduce_money && vm.create.bonus_deduction_rule.reduce_money != 0)
            obj.bonus_deduction_rule.reduce_money = '';
        else
            obj.bonus_deduction_rule.reduce_money = vm.create.bonus_deduction_rule.reduce_money;

        if(!vm.create.bonus_deduction_rule.least_money_to_use_bonus && vm.create.bonus_deduction_rule.least_money_to_use_bonus != 0)
            obj.bonus_deduction_rule.least_money_to_use_bonus = '';
        else
            obj.bonus_deduction_rule.least_money_to_use_bonus = vm.create.bonus_deduction_rule.least_money_to_use_bonus;

        if(!vm.create.bonus_deduction_rule.max_reduce_bonus && vm.create.bonus_deduction_rule.max_reduce_bonus != 0)
            obj.bonus_deduction_rule.max_reduce_bonus = '';
        else
            obj.bonus_deduction_rule.max_reduce_bonus = vm.create.bonus_deduction_rule.max_reduce_bonus;

        userInfo.data.create = vm.create;
        userInfo.data.obj = obj;
        if(/create/.test(window.location.href)) $state.go('clubcard.card.create3');
        else $state.go('clubcard.card.edit3', {id: $state.params.id});
    }
    $scope.loaded = function(){
        setTimeout(function(){
            var content = document.getElementsByClassName('scrollContent')[0];
            var mobileView = document.getElementsByClassName('small-view')[0];
            mobileView.style.top = '-20px';
            var mobileTop = mobileView.getBoundingClientRect().top;
            content.onscroll = function(){
                var sTop = content.scrollTop;
                if(sTop <= mobileTop - 65) mobileView.style.top = '-20px';
                else mobileView.style.top = sTop - mobileTop - 20 + 65+20+ 'px';
            }
        }, 100)
    }

    vm.integral = [] ;
    vm.grade = [] ;
    vm.discount = [] ;
    vm.showTip = function(name){
        var type = name.split(' ')[0];
        var index = name.split(' ')[1];
        if(type == 'integral')
            vm.integral[index] = true;
        if(type == 'grade')
            vm.grade[index] = true;
        if(type == 'discount')
            vm.discount[index] = true;
    }
});