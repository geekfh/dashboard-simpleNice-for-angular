app.controller('card.preview.controller', function ($state, $rootScope, tplUrl, $scope, userInfo, ws, $sce ,$mdDialog) {
    var vm = this;
    
    userInfo.get('merchant/info').then(function(res){
        vm.User = res.object;
        var primaryCategoryId, secondaryCategoryId;  
        primaryCategoryId = vm.User.primaryCategoryId;
        secondaryCategoryId = vm.User.secondaryCategoryId; 
        userInfo.checkCategory(primaryCategoryId, secondaryCategoryId).then(function(obj){
            vm.obj = obj;
        }) 
    })
    $scope.$watch('vm.User', function(val){
      if(val){
        vm.create = vm.create || {};
        vm.create.brandName = val.brandName;
        vm.create.wxchatLogo = {'background-image': 'url('+val.s300LogoUrl+')'};
      }
    })
    
    vm.count = 1;
    vm.getMemberCards = function(){
        userInfo.get('memberCards', {}, '', true).then(function (res) {
        res = ws.changeRes(res);
        vm.start = true;
        if(res.object.list && res.object.list.length){
            vm.count = res.object.list.length;
            vm.prevCard = res.object.list[0].card;
            vm.poiList = res.object.list[0].poi;

            //处理换行
            vm.prevCard.prerogative = ws.newLine(vm.prevCard.prerogative);
            vm.prevCard.prerogative = $sce.trustAsHtml(vm.prevCard.prerogative);
            vm.prevCard.description = ws.newLine(vm.prevCard.description);
            vm.prevCard.description = $sce.trustAsHtml(vm.prevCard.description);

            vm.myCardName = '白金会员';
            //var style = document.createElement('style');
            //style.id = "mobile_view";
            //style.innerHTML = '.app-content{width: 700px; margin-left: 380px;}';
            //document.getElementsByTagName('head').item(0).appendChild(style);
            vm.create = vm.create || {};
            vm.create.dateType = vm.prevCard.date_info.type;
            vm.create.color = {};
            vm.create.color.cvalue = vm.prevCard.color;
            vm.create.title = vm.prevCard.title;
            vm.create.notice = vm.prevCard.notice;
            vm.create.service_phone = vm.prevCard.service_phone;
            if(vm.create.dateType == 'DATE_TYPE_FIX_TIME_RANGE'){
              vm.create.date = vm.date || {};
              vm.create.date.begin = vm.prevCard.date_info.begin_timestamp.replace(/ .+$/, '').replace(/-/g, '.');
              vm.create.date.end = vm.prevCard.date_info.end_timestamp.replace(/ .+$/, '').replace(/-/g, '.');
            }
            /*if(vm.prevCard.location_id_list == 'allPoi' || vm.prevCard.location_id_list !== '[]'){
              vm.poiLists = [{}];
            }*/
            vm.custom = [];
            if(vm.prevCard.custom_url_name){
               vm.custom.push({
                   name: vm.prevCard.custom_url_name,
                   sub_title: vm.prevCard.custom_url_sub_title,
                   url: vm.prevCard.custom_url
               })
            }
            if(vm.prevCard.promotion_url_name){
               vm.custom.push({
                   name: vm.prevCard.promotion_url_name,
                   sub_title: vm.prevCard.promotion_url_sub_title,
                   url: vm.prevCard.promotion_url
               })
            }
            if(vm.prevCard.custom_cell1){
               var custom_cell1 = JSON.parse(vm.prevCard.custom_cell1);
               if(custom_cell1.url){
                   vm.custom.push({
                       name: custom_cell1.name,
                       sub_title: custom_cell1.tips,
                       url: custom_cell1.url
                   })
               }
            }
            vm.create.custom = vm.create.custom || vm.custom;
            vm.create.evelLists = JSON.parse(vm.prevCard.member_level_rule) || [];

            //储值规则
            if(vm.prevCard.balance_rules)
                vm.create.balance_rules_list = JSON.parse(vm.prevCard.balance_rules);
            else
                vm.create.balance_rules_list = [];

        }else{
            vm.count = res.object.count;
        }
    })
    }
    vm.getMemberCards();
    vm.edit = function (id) {
        $state.go('clubcard.card.edit1', {id: id})
    }
    //查看二维码
    vm.getQrcode = function(cardId){
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/common/qrCodeMemberShip.html',
            controller: function(scope, $http){
                scope.isMemberShip = true;
                scope.logo = vm.User.s300LogoUrl;
                scope.name = vm.User.brandName;

                scope.title = vm.prevCard.title;
                scope.color = vm.prevCard.color;

                userInfo.get('memberCards/qrCode/' + cardId).then(function(res){
                    scope.src = res.object;
                    console.log(scope.src);
                    //scope.$apply();
                })
            }
        }).then(function(data){

        });
    }
    vm.changeSync = function(val){
        if(val == '0'){
            vm.prevCard.sync_weixin = '1';
            return ;
        }
        if(vm.obj && vm.obj.card){
          var title = val == '1' ? '确定要同步至微信吗？' : '确定要取消同步至微信吗？';
          vm.syncIng = true;
          ws.ajaxDialog(title, 'memberCards/sync', {sync_wechat: val}, 'get', true, function(){
              var str = val == '1' ? '同步至微信成功' : '取消同步至微信成功';
              vm.getMemberCards();
              ws.alert({msg: str});
              vm.syncIng = false;
          }, function(){
              vm.syncIng = false;
              vm.prevCard.sync_weixin = val == '1' ? '0' : '1';
          })
        }else{
          return vm.prevCard.sync_weixin = val == '1' ? '0' : '1', ws.alert({msg: '请选择类目'});
        }

    }
    vm.createCard = function(){
      userInfo.get('mcht/countAllChildMcht').then(function(res){
          if(res.object.mchtCount > 0) $state.go('clubcard.card.create1')
          else return ws.alert({msg: '请先创建门店'});
      })
    }
    //授权
    vm.authorize = function(){
        $state.go('settings.wxchat');
        /*window.location.reload();*/
        $scope.$emit('ngRepeatFinish');
        /*userInfo.get('merchant/accredit', {}).then(function(res){
            $scope.href = res.object;
            window.location.href = $scope.href;
            //window.open($scope.href);
        });*/
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
                else mobileView.style.top = sTop - mobileTop - 20 + 65 + 20 + 'px';
            }
        }, 100)
    }


});