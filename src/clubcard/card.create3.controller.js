app.controller('card.create3.controller', function ($state, $rootScope, $scope, userInfo, $filter) {
    //设置导航条
    $rootScope.nav = {};
    $rootScope.nav.clubcard = {};
    $rootScope.nav.clubcard.isShow = true;
    $rootScope.nav.clubcard.step = 3;
    $rootScope.nav.clubcard.firstText = '1 填写会员卡信息';
    $rootScope.nav.clubcard.secondText = '2 会员权益';
    $rootScope.nav.clubcard.thirdText = '3 储值规则';
    $rootScope.nav.clubcard.forthText = '4 功能设置';
    var vm = this, data = userInfo.data;
    vm.create = data.create || {};
    vm.tempt = data.tempt || {};
    vm.myCardName = '白金会员';
    vm.supply_balance = vm.tempt.supply_balance == '1' ? vm.tempt.supply_balance : vm.create.supply_balance == '1' ?  vm.create.supply_balance : '0';
    vm.create.balance_rules_list = vm.create.balance_rules_list || [];
    if(!$rootScope.isEdit){
        //添加
        if(ws.isEmptyObj(data)) return $state.go('clubcard.card.create1');
        //vm.create.balance_rules_list = [];
    }else{
        //编辑
        if(ws.isEmptyObj(data)) return $state.go('clubcard.card.edit1', {id: $state.params.id});
        if(!vm.create.balance_rules_list.length){
            if(vm.create.balance_rules)
                vm.create.balance_rules_list = JSON.parse(vm.create.balance_rules);
            else
                vm.create.balance_rules_list = [];
        }
    }

    var maxRuleLength = 10;
    $scope.addRule = function(){
        if(vm.create.balance_rules_list.length >= maxRuleLength) return ws.alert({msg: '最多添加十条规则!'});
        else vm.create.balance_rules_list.push({});
    }
    $scope.deleteRule = function(index){
        ws.noAjaxDialog('确定要删除该规则吗?', function(){
            vm.create.balance_rules_list.splice(index, 1);
        })
    };
    /*$scope.$watch('vm.supply_balance',function(current){
        if(current == '1'){}
        else{
            vm.create.free_pwd = 2;
            $rootScope.free_pwd = 0;
        }
    })*/
    //上一步
    $scope.back = function(){
        userInfo.data.create = vm.create;
        if(/create/.test(window.location.href)) $state.go('clubcard.card.create2');
        else $state.go('clubcard.card.edit2', {id: $state.params.id});
    }
    //下一步
    $scope.next = function(err){
        var flag = false;
        if(err) {
            vm.formError = true;
            flag = true;
        }
        else vm.formError = false;
        /*if(vm.supply_balance == '1' && !(vm.create.free_pwd == 0 || vm.create.free_pwd == 1)){
            vm.settingPwd = true;
            flag = true;
        }*/
        if(flag) return;

        vm.submiting = true;

        var obj = data.obj;
        //储值规则
        obj.supply_balance = vm.supply_balance || '0';
        vm.tempt.supply_balance = obj.supply_balance;

        /*if(!vm.create.free_pwd)
            obj.free_pwd =  '2';  //2表示未开通储值功能时，未选择输入密码or免密
        else
            obj.free_pwd =  vm.create.free_pwd;*/

        //交易标志位：1表示产生交易
        obj.tradeFlag = vm.create.tradeFlag ? vm.create.tradeFlag : '0';

        var balance_rules_list = [];
        if(vm.supply_balance == '1'){
            for(var j = 0, length = vm.create.balance_rules_list.length; j < length; j++){
                var item = vm.create.balance_rules_list[j];
                //var itemNext = vm.create.balance_rules_list[j + 1] || {full_money : 10000000, presenter_money:10000000};
                var itemNext = vm.create.balance_rules_list[j + 1] || {full_money : 100000000, presenter_money:100000000};
                var tip;
                if(item.full_money == itemNext.full_money){
                    tip =  '已存在充值'+ item.full_money/100 +'满送规则';
                    return ws.alert({msg:tip})
                }
                if(item.$$hashKey) delete item.$$hashKey;
               /* balance_rules_list[j] ={};
                balance_rules_list[j].full_money = vm.create.balance_rules_list[j].full_money * 100;
                balance_rules_list[j].presenter_money = vm.create.balance_rules_list[j].presenter_money * 100;*/

            }
            obj.balance_rules = JSON.stringify(vm.create.balance_rules_list);

        }else
            obj.balance_rules = '';

        userInfo.data.create = vm.create;
        userInfo.data.obj = obj;
        userInfo.data.tempt = vm.tempt;
        if(/create/.test(window.location.href)) $state.go('clubcard.card.create4');
        else $state.go('clubcard.card.edit4', {id: $state.params.id});
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
                else mobileView.style.top = sTop - mobileTop - 20 +65+20+ 'px';
            }
        }, 100)
    }
    vm.balance_rules_tip = [];
    vm.showTip = function(index){
        vm.balance_rules_tip[index] = true;
    }
});