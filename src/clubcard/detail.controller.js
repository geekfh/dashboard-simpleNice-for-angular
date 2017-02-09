app.controller('clubcard.detail.controller', ['NgTableParams', 'clubcard.member.service', '$state', '$date', '$timeout', function (ngTableParams, Service, $state, $date, $timeout) {

    var vm = this;
    entry($state.params.tel)
    function entry(membershipNumber){
        Service.getMember(membershipNumber).then(function (res) {
            ws.successback(res, function(){
                vm.member = res.object;

                //vm.member.userInfo = vm.member.userInfo ? JSON.parse(vm.member.userInfo) : {};
                vm.member.userInfo = vm.member.customUserInfo;
                //判断姓名和手机
                
                vm.member.userInfo['USER_FORM_INFO_FLAG_NAME'] = vm.member.userInfo['USER_FORM_INFO_FLAG_NAME'] || vm.member.name;
                vm.member.userInfo['USER_FORM_INFO_FLAG_MOBILE'] = vm.member.userInfo['USER_FORM_INFO_FLAG_MOBILE'] || vm.member.mobile;
                vm.userInfo = [];
                vm.userInfo[0] = {name: 'USER_FORM_INFO_FLAG_NAME', value: vm.member.userInfo['USER_FORM_INFO_FLAG_NAME']};
                vm.userInfo[1] = {name: 'USER_FORM_INFO_FLAG_MOBILE', value: vm.member.userInfo['USER_FORM_INFO_FLAG_MOBILE']};
                delete vm.member.userInfo['USER_FORM_INFO_FLAG_NAME'];
                delete vm.member.userInfo['USER_FORM_INFO_FLAG_MOBILE'];

                if(vm.member.userInfo['USER_FORM_INFO_FLAG_BIRTHDAY']){
                    var val = vm.member.userInfo['USER_FORM_INFO_FLAG_BIRTHDAY'];
                    val = val.replace(/-(\d{1,2})/, function(){if(RegExp.$1.length == 1) return '-0' + RegExp.$1; else return '-' + RegExp.$1;});
                    val = val.replace(/-(\d{1,2})$/, function(){if(RegExp.$1.length == 1) return '-0' + RegExp.$1; else return '-' + RegExp.$1;});
                    vm.member.userInfo['USER_FORM_INFO_FLAG_BIRTHDAY'] = val;
                }
            }, function(){
                $timeout(function(){
                    $state.go('clubcard.member.list');
                }, 1700)
            })
            
        });

        var queryParams = {};

        //Service.getMemberRecord(membershipNumber, {page:1, rows: 10}).then(function(res){
            vm.ngTableHistory = new ngTableParams(
                { page: 1, count: 10 },
                { getData: function ($defer, params) {
                    queryParams.page = params.page();
                    queryParams.rows = params.count();

                    Service.getMemberRecord(membershipNumber, queryParams).then(function (res) {
                        vm.useCount = res.object.rows;
                        if(res.code == 0){
                            if(res.object.list && res.object.list.length){
                                vm.noData = false;
                                $defer.resolve(res.object.list);
                                params.total(res.object.totalRows);
                            }else{
                                vm.noData = res.msg || '暂无数据';
                                $defer.resolve([]);
                            }
                        }else{
                            vm.noData = res.msg || '暂无数据';
                            $defer.resolve([]);
                        }
                    });
                } }
            );
        //});
    }



    vm.changeMember = function (Bonus, invalid) {
        var params = {}, bonus = 0;

        if(invalid){
            vm.formError = 'formError';
            return;
        }else {
            vm.formError = null;
        }

        if(Bonus.add || Bonus.cut){
            bonus = Bonus.add ? Bonus.add : -Bonus.cut;
        }

        if(bonus == 0 ){
            ws.alert({msg: '输入的修改积分有误'});
            return;
        }
        params.add_bonus = bonus || 0;
        if((Math.abs(bonus) > vm.member.bonus) && Bonus.cut){
            ws.alert({msg: '输入的修改积分有误'});
            return;
        }

        vm.submiting1 = true;

        params.num = vm.member.membershipNumber;

        params.status = vm.member.status || 'NORMAL';

        params.record_bonus = vm.record_bonus;
        Service.changeMember(params).then(function(res) {
            $state.reload();
            ws.alert({msg: res.message});
            vm.submiting1 = false;
        });
    };

    vm.changeMemberStatus = function(){
        vm.submiting2 = false;
        Service.changeMember({num: vm.member.membershipNumber,add_bonus: 0,status: vm.member.status }).then(function(res) {
            $state.reload();
            ws.alert({msg: res.message});
            vm.submiting2 = false;
        });
    };

    // 取消修改会员信息
    vm.cancel = function(){
        $state.reload();
    };

    vm.getExcel = function(e){
        if(vm.noData) return ws.alert({msg: '暂无数据可供下载'});
        var kv = '';
        for(var key in vm.queryParams){
            if(vm.queryParams[key]){
                kv += key+'=' + vm.queryParams[key] + '&';
            }
        }
        return e.target.href = 'memberCardUsers/material?' + kv, setTimeout(function(){e.target.href = '';}, 1500);
    };

    vm.status = {
        '': '全部状态',
        'NORMAL': '正常' ,
        'EXPIRE': '已过期' ,
        'UNACTIVE': '未激活',
        'DELETE': '已删除',
        'UNAVAILABLE': '已失效'
    }
}])

