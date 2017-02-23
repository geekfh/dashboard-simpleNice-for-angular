app.controller('card.create1.controller', function ($state, $rootScope, $scope, userInfo, $filter, cardDetail, $date) {
    //设置导航条
    $rootScope.nav = {};
    $rootScope.nav.clubcard = {};
    $rootScope.nav.clubcard.isShow = true;
    $rootScope.nav.clubcard.step = 1;
    $rootScope.nav.clubcard.firstText = '1 填写会员卡信息';
    $rootScope.nav.clubcard.secondText = '2 会员权益';
    $rootScope.nav.clubcard.thirdText = '3 储值规则';
    $rootScope.nav.clubcard.forthText = '4 功能设置';
    var vm = this, data = userInfo.data;
    vm.user = {};
    vm.create = data.create || {};  //上一步返回的数据or第一次创建
    vm.create.color = vm.create.color || {};
    vm.create.date = vm.create.date || {};
    vm.create.custom = vm.create.custom || [];
    vm.create.pic = vm.create.pic || {};
    vm.create.date_info = vm.create.date_info || {};
    vm.create.date_info.fixed_begin_term = vm.create.date_info.fixed_begin_term || 0;
    vm.create.date_info.fixed_term = vm.create.date_info.fixed_term || 30;
    //有效期
    vm.dayArray = [];
    for(var i = 0; i<90; i++){
        vm.dayArray[i] = i+1;
    }

    vm.create.dateType = vm.create.date_info.type || 'DATE_TYPE_FIX_TIME_RANGE';//若第一次创建则默认设置该值
    userInfo.get('mcht/info.json').then(function(res){
        vm.user = res.object;
        //处理info接口获取不到商户name,logo及类目的情况
        if(vm.user.weixinType == 1 && vm.user.authStatus == 1 && vm.user.authorizerAppid){
            if(!vm.user.s300LogoUrl || !vm.user.brandName || !vm.user.primaryCategoryId || !vm.user.secondaryCategoryId){
                userInfo.get('merchant/applyInfo').then(function(res_){
                    vm.user.s300LogoUrl = res_.object.s300LogoUrl;
                    vm.user.brandName = res_.object.brandName;
                })
            }
        }
        if(!vm.user.s300LogoUrl){
            //vm.create.pic = data.pic;
        } 
    })

    
    vm.time_limit = [{n: '一'}, {n: '二'}, {n: '三'}, {n: '四'}, {n: '五'}, {n: '六'}, {n: '日'} ];
    vm.myCardName = '白金会员';
    
    $scope.$watchGroup(['vm.user.s300LogoUrl', 'vm.create.pic.qiniu_file_url'], function(val){
        if(val[0] || val[1]){
            var src = val[0] || val[1];
            src = src.replace(/\\/, '/');
            vm.create = vm.create || {};
            vm.create.wxchatLogo = {'background-image': 'url('+src+')'}
        }
    })
    
    if(!$rootScope.isEdit){
        //添加
        //判断是否已经创建会员卡
        userInfo.get('memberCards').then(function(res){
            if(res.object && res.object.list && res.object.list[0].card){
                $state.go('clubcard.card.preview');
            }
        })
        
    }else{
        //从上一步返回
        if(data.create){
            vm.create.date_info.fixed_begin_term = vm.create.date_info.fixed_begin_term || 0;
            vm.create.date_info.fixed_term = vm.create.date_info.fixed_term || 30;
            vm.create.date_info.begin_timestamp = vm.create.date_info.begin_timestamp || new Date();
            vm.create.date_info.end_timestamp = vm.create.date_info.end_timestamp || new Date();
            if(vm.create.date_info.type == 'DATE_TYPE_FIX_TIME_RANGE'){
                if(new Date(vm.create.date_info.begin_timestamp) == 'Invalid Date'){
                    vm.create.date_info.begin_timestamp = vm.create.date_info.begin_timestamp.replace(/ /, 'T');
                    vm.create.date_info.end_timestamp = vm.create.date_info.end_timestamp.replace(/ /, 'T');
                }
            }
            vm.create.date = {begin: new Date(vm.create.date_info.begin_timestamp), end: new Date(vm.create.date_info.end_timestamp)}

        }
        //编辑
        else{
            console.log(vm.user)
            vm.create = cardDetail;
            //是否已开通储值功能
            //$rootScope.free_pwd = cardDetail.supply_balance;
            vm.old_color = vm.create.color;
            vm.create.color = {};
            vm.create.color.cvalue = vm.old_color;
            vm.create.dateType = vm.create.date_info.type;
            vm.create.date_info.fixed_begin_term = vm.create.date_info.fixed_begin_term || 0;
            vm.create.date_info.fixed_term = vm.create.date_info.fixed_term || 30;
            vm.create.date_info.begin_timestamp = vm.create.date_info.begin_timestamp || new Date();
            vm.create.date_info.end_timestamp = vm.create.date_info.end_timestamp || new Date();
            if(vm.create.date_info.type == 'DATE_TYPE_FIX_TIME_RANGE'){
                if(new Date(vm.create.date_info.begin_timestamp) == 'Invalid Date'){
                    vm.create.date_info.begin_timestamp = vm.create.date_info.begin_timestamp.replace(/ /, 'T');
                    vm.create.date_info.end_timestamp = vm.create.date_info.end_timestamp.replace(/ /, 'T');
                }
            }
            vm.create.date = {begin: new Date(vm.create.date_info.begin_timestamp), end: new Date(vm.create.date_info.end_timestamp)};

            vm.create.custom = [];

            if(vm.create.discount != '10'){
                vm.create.hasDiscount = true;
            }else{
                vm.create.discount = '';
            }

            if(vm.create.custom_url_name){
               vm.create.custom.push({
                   name: vm.create.custom_url_name,
                   sub_title: vm.create.custom_url_sub_title,
                   url: vm.create.custom_url
               })
            }
            if(vm.create.promotion_url_name){
               vm.create.custom.push({
                   name: vm.create.promotion_url_name,
                   sub_title: vm.create.promotion_url_sub_title,
                   url: vm.create.promotion_url
               })
            }
            if(vm.create.custom_cell1){
               var custom_cell1 = JSON.parse(vm.create.custom_cell1);
               if(custom_cell1.url){
                   vm.create.custom.push({
                       name: custom_cell1.name,
                       sub_title: custom_cell1.tips,
                       url: custom_cell1.url
                   })
               }
            }
            
        }

    }
    console.log('vm.create:'+vm.create)

 

     /**
     * 添加自定义入口
     */
    
    vm.addCustom = function(){
        if(vm.create.custom.length >=2) return;
        var obj = {
            name: '',
            sub_title: '',
            url: ''
        };
        vm.create.custom.push(obj);
    };
    //删除自定义入口
    vm.delCuston = function(index){
        ws.noAjaxDialog('确定要删除该入口吗?', function(){
             vm.create.custom.splice(index, 1);  
        })
    };
    
    vm.step2 = function(err){
        if(err){
             //vm.formError = 'form-error';
             vm.formError = true;
            //有效期
            if(vm.create.dateType == 'DATE_TYPE_FIX_TIME_RANGE'){
                if(!vm.create.date.begin || !vm.create.date.end) return vm.create.show_date_tip = true;

                if(( $date.format(vm.create.date.end).time - $date.format(vm.create.date.begin).time) > 10 * 365 *24 * 60* 60 * 1000){
                    return vm.create.show_date_tip_period = true;
                }
            }
            return
        }else{
            //vm.formError = '';
            vm.formError = false;
        }

        if(!vm.create.dateType) return ws.alert({msg: '请选择一种有效期'});
        //有效期
        if(vm.create.dateType == 'DATE_TYPE_FIX_TIME_RANGE'){
            if(!vm.create.date.begin || !vm.create.date.end) return vm.create.show_date_tip = true;

            if(( $date.format(vm.create.date.end).time - $date.format(vm.create.date.begin).time) > 10 * 365 *24 * 60* 60 * 1000){
                return vm.create.show_date_tip_period = true;
            }
        }
        var obj = {};
        
        obj.brand_name = vm.user.brandName || vm.create.brandName;
        if(!vm.create.brandName){
            vm.create.brandName = vm.user.brandName
        }
        obj.logo_url = vm.user.s300LogoUrl || vm.create.pic.qiniu_file_url;
        obj.color = vm.create.color.cname;
        obj.title = vm.create.title;

        obj.date_info = {};
        obj.date_info.type = vm.create.dateType;
        vm.create.date_info.type = vm.create.dateType;
        //有效期
        if (obj.date_info.type == 'DATE_TYPE_FIX_TIME_RANGE') {
            obj.date_info.begin_timestamp = vm.create.date_info.begin_timestamp =  $filter('date')(vm.create.date.begin, 'yyyy-MM-dd');
            obj.date_info.end_timestamp = vm.create.date_info.end_timestamp = $filter('date')(vm.create.date.end, 'yyyy-MM-dd');
        } else if(obj.date_info.type == 'DATE_TYPE_FIX_TERM') {
            obj.date_info.fixed_term = parseInt(vm.create.date_info.fixed_term);
            obj.date_info.fixed_begin_term = parseInt(vm.create.date_info.fixed_begin_term);
        }

        obj.service_phone = vm.create.service_phone;
        obj.prerogative = vm.create.prerogative;
        obj.description = vm.create.description;

        //转换自定义路口
        switch(vm.create.custom.length){
            case 0:
                obj.custom_url_name = '';
                obj.custom_url = '';
                obj.custom_url_sub_title = '';
                obj.promotion_url_name = '';
                obj.promotion_url = '';
                obj.promotion_url_sub_title = '';
                obj.custom_cell1 = '';
            break;
            case 1:
                obj.custom_url_name = vm.create.custom[0].name;
                obj.custom_url = vm.create.custom[0].url;
                obj.custom_url_sub_title = vm.create.custom[0].sub_title;
            break;
            case 2:
                obj.custom_url_name = vm.create.custom[0].name;
                obj.custom_url = vm.create.custom[0].url;
                obj.custom_url_sub_title = vm.create.custom[0].sub_title;
                obj.promotion_url_name = vm.create.custom[1].name;
                obj.promotion_url = vm.create.custom[1].url;
                obj.promotion_url_sub_title = vm.create.custom[1].sub_title;
            break;
            case 3:
                obj.custom_url_name = vm.create.custom[0].name;
                obj.custom_url = vm.create.custom[0].url;
                obj.custom_url_sub_title = vm.create.custom[0].sub_title;
                obj.promotion_url_name = vm.create.custom[1].name;
                obj.promotion_url = vm.create.custom[1].url;
                obj.promotion_url_sub_title = vm.create.custom[1].sub_title;
                obj.custom_cell1 = {name: vm.create.custom[2].name, tips: vm.create.custom[2].sub_title, url: vm.create.custom[2].url};
                obj.custom_cell1 = JSON.stringify(obj.custom_cell1);
            break;
        }

        userInfo.data = {create: vm.create, obj: obj};
        //if(vm.pic) userInfo.data.pic = vm.pic;
        if(!$rootScope.isEdit){
            $state.go('clubcard.card.create2');
        }else{
            $state.go('clubcard.card.edit2', {id: $state.params.id});
        }

    };
    
    $scope.loaded = function(){
        setTimeout(function(){
            var content = document.getElementsByClassName('scrollContent')[0];
            var mobileView = document.getElementsByClassName('small-view')[0];
            mobileView.style.top = '-20px';
            var mobileTop = mobileView.getBoundingClientRect().top;
            content.onscroll = function(){
                var sTop = content.scrollTop;
                /*if(sTop <= mobileTop) mobileView.style.top = '-20px';
                else mobileView.style.top = sTop - mobileTop - 20 + 'px';*/
                if(sTop <= mobileTop - 65) mobileView.style.top = '-20px';
                else mobileView.style.top = sTop - mobileTop - 20 +65+20+ 'px';
            }
        }, 100)
    }
});