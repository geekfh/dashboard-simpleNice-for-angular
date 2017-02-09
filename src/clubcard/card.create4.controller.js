app.controller('card.create4.controller',  function ($state, $rootScope, $parse, $mdDialog, userInfo, $scope) {
    //设置导航条
    $rootScope.nav = {};
    $rootScope.nav.clubcard = {};
    $rootScope.nav.clubcard.isShow = true;
    $rootScope.nav.clubcard.step = 4;
    $rootScope.nav.clubcard.firstText = '1 填写会员卡信息';
    $rootScope.nav.clubcard.secondText = '2 会员权益';
    $rootScope.nav.clubcard.thirdText = '3 储值规则';
    $rootScope.nav.clubcard.forthText = '4 功能设置';
    var vm = this;
    vm.myCardName = '白金会员';

    
    var data = userInfo.data;
    vm.create = data.create || {};
    vm.create.usedFields = vm.create.usedFields || {};
    vm.create.usedFields.selectFields = vm.create.usedFields.selectFields || []; //微信选填
    vm.create.usedFields.customFields = vm.create.usedFields.customFields || []; //自定义选填  
    vm.create.poiLists = vm.create.poiLists || [];
    
    if(!$rootScope.isEdit){
        //添加
        if(ws.isEmptyObj(data)) return $state.go('clubcard.card.create1')
        vm.create.poiRadio = 'allPoi';
    }else{
        //编辑
        if(ws.isEmptyObj(data)) return $state.go('clubcard.card.edit1', {id: $state.params.id});
        
        if(!vm.create.usedFields.selectFields.length && !vm.create.usedFields.customFields.length){
            if(vm.create.optional_form){
                vm.create.usedFields.selectFields = ws.wipeNull(vm.create.optional_form.common_field_id_list || []);
                vm.create.usedFields.customFields = ws.wipeNull(vm.create.optional_form.custom_field_list || []);
            }
        }

        //门店
        if(!vm.create.poiLists.length){
            if(vm.create.location_id_list == 'allPoi'){
                vm.create.poiLists = [];
                vm.create.poiRadio = 'allPoi';
            } 
            if(/\[/.test(vm.create.location_id_list)){
                $scope.ids = ws.wipe(vm.create.location_id_list).split(',');
                vm.create.poiRadio = 'myPoi';
                var url= 'poi/store/ids?ids=';
                angular.forEach($scope.ids, function(it, i){
                    it = it.replace(/^ /, '');
                    url += it + ',';
                })
                url = url.replace(/\,$/, '');
                userInfo.get(url).then(function(res){
                    vm.create.poiLists = res.object;
                    //setPoi();
                })
            }
        }
        
    }
    function setPoi(){
        angular.forEach(vm.create.poiLists, function(item){
            item.poiId = item.poiId || item.merchantNo;
        })
    }
    
    $scope.selectPoi = function(){
        $scope.$emit('select.poi.start', vm.create.poiLists);
    }

    $scope.$on('select.poi.end', function(eve, arr){
        vm.create.poiLists = arr;
        //setPoi();
    })

    $scope.remove = function(index){
        ws.noAjaxDialog('确认删除该门店吗？', function(){
            vm.create.poiLists.splice(index, 1);
        })
    }
    
    vm.back = function(){
        userInfo.data.create = vm.create;
        if(/create/.test(window.location.href)) $state.go('clubcard.card.create3');
        else $state.go('clubcard.card.edit3', {id: $state.params.id});
    }
    //修改并保存
    vm.preview = function(err){
        var obj = data.obj || {};
        if(err){
            return vm.formError = 'form-error';
        }else{
            vm.formError = '';
        }
        if(!vm.create.poiRadio) return ws.alert({msg: '请选择门店'})

        if(vm.create.poiRadio == 'myPoi'){
            if(!vm.create.poiLists.length) return ws.alert({msg: '请选择门店'});
            var arr = [];
            for(var i in vm.create.poiLists){
                arr.push(vm.create.poiLists[i].merchantNo);
            }
            obj.location_id_list = arr.join(',');
        }else{
            obj.location_id_list = vm.create.poiRadio;
        }

        obj.notice = vm.create.notice;
        //obj.sync_wechat = vm.create.sync_wechat == '1' ? '1' : '0';
        obj.required_form = {};
        obj.required_form.common_field_id_list = ['USER_FORM_INFO_FLAG_MOBILE', 'USER_FORM_INFO_FLAG_NAME'];

        obj.optional_form = {};
        if(vm.create.usedFields.selectFields.length){
            obj.optional_form.common_field_id_list = [];
            angular.forEach(vm.create.usedFields.selectFields, function(it){
                obj.optional_form.common_field_id_list.push(it.v);
            })
        }
        if(vm.create.usedFields.customFields.length){
            obj.optional_form.custom_field_list = [];
            angular.forEach(vm.create.usedFields.customFields, function(it){
                obj.optional_form.custom_field_list.push(it);
            })
        }

        vm.submiting = false;

        if(!$rootScope.isEdit){
            //添加
            console.log(obj);
            userInfo.post('memberCards', obj).then(function(res){
                vm.submiting = true;
                ws.alert({msg: '创建成功', cb: function(){$state.go('clubcard.card.preview')}})
            })
        }else{
            //编辑
            console.log(obj);
            userInfo.put('memberCards/' + $state.params.id, obj).then(function(res){
                vm.submiting = true;
                ws.alert({msg: '修改成功', cb: function(){$state.go('clubcard.card.preview')}})
            })
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
                if(sTop <= mobileTop - 65) mobileView.style.top = '-20px';
                else mobileView.style.top = sTop - mobileTop - 20 + 65+20 + 'px';
            }
        }, 100)
    }

});