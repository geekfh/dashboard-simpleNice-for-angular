app.controller('wxchatController', ['app.common.service','$scope','userInfo','$state','$rootScope','$mdDialog','tplUrl',
    function (Service,$scope, userInfo, $state, $rootScope,$mdDialog,tplUrl) {
    $scope.category = {};
    userInfo.get('mcht/info.json').then(function(res){
    	$scope.wxchatData = res.object;
        if($scope.wxchatData.authStatus == 1 && $scope.wxchatData.businessInfo && $scope.wxchatData.businessInfo.open_card == 0)
            return ws.alert({msg:'您授权公众号未开通卡卷权限，请开通卡卷权限后进行重新授权',time:5000});


        if($scope.wxchatData.weixinType == 1 && $scope.wxchatData.authStatus == 1 && $scope.wxchatData.authorizerAppid){
            if(!$scope.wxchatData.s300LogoUrl || !$scope.wxchatData.nickName || !$scope.wxchatData.primaryCategoryId || !$scope.wxchatData.secondaryCategoryId){
                userInfo.get('merchant/applyInfo').then(function(res_){
                    $scope.wxchatData.primaryCategoryId = res_.object.primaryCategoryId;
                    $scope.wxchatData.secondaryCategoryId = res_.object.secondaryCategoryId;
                    $scope.wxchatData.s300LogoUrl = res_.object.s300LogoUrl;
                    $scope.wxchatData.nickName = res_.object.brandName;
                    if(!$scope.wxchatData.serviceTypeInfo)
                        $scope.wxchatData.serviceTypeInfo = res_.object.serviceTypeInfo;
                    if(!$scope.wxchatData.weixinType)
                        $scope.wxchatData.weixinType = res_.object.weixinType;
                    getCategoryName();
                })
            }else{
                getCategoryName();
            }
            /*if($scope.wxchatData.primaryCategoryId && $scope.wxchatData.secondaryCategoryId){
                getCategoryName()
            }else{
                userInfo.get('merchant/applyInfo').then(function(res){
                    $scope.wxchatData.primaryCategoryId = res.object.primaryCategoryId;
                    $scope.wxchatData.secondaryCategoryId = res.object.secondaryCategoryId;
                    getCategoryName()
                })
            }*/
        }

    });
    function getCategoryName(){
        Service.getCategory().then(function(res){
            res.forEach(function(p){
                if(p.primary_category_id == $scope.wxchatData.primaryCategoryId){
                    $scope.category.primary = p.category_name;

                    p.secondary_category.forEach(function(s){
                        if(s.secondary_category_id == $scope.wxchatData.secondaryCategoryId){
                            $scope.category.secondary = s.category_name;
                        }
                    });

                }
            });
            userInfo.checkCategory($scope.wxchatData.primaryCategoryId, $scope.wxchatData.secondaryCategoryId, $scope.category.secondary).then(function(obj){
                $scope.obj = obj;
            })
        });
    }
    $scope.categories = [];
    $scope.editCate = false;
    $rootScope.needShow = true;
    $scope.finish = function(){
        if(!$scope.categories.length) return ws.alert({msg: '请选择类目'});

        userInfo.post('merchant/category.json', {primary_category_id: $rootScope.primary_category_id, secondary_category_id: $rootScope.secondary_category_id}).then(function(res){
            $scope.category = {primary: $rootScope.primary_category_id, secondary: $rootScope.secondary_category_id};
            $scope.editCate = false;
            ws.alert({msg: '修改成功'});
        })
    }
    $scope.$watch('$root.secondary_category_id', function(val){
        if(val){
            var name = $scope.categories[0].split(',')[1];
            userInfo.checkCategory('', '', name).then(function(obj){
                $scope.obj = obj;
            })
        }
    })
    $scope.edit = function(){
        $scope.editCate = true;
    }
    
    $scope.look = function(){
        $scope.$emit('show.detail', 'tpl/common/look_category.html', {})
    }
    $scope.confirm = function(str){
        var data = {};
        
        if(str == '取消'){
            data.title = '公众号取消授权';
            data.status = 1;
            data.href = 'https://mp.weixin.qq.com/';
        }else if(str == '重新'){
            data.title = '公众号重新授权';
            data.status = 2;
        }
        userInfo.get('merchant/accredit', {}).then(function(res){
            $scope.href = res.object;
            if(!str) window.location.href = $scope.href;
        });
        if(str == '重新'){
            $scope.$emit('show.detail', 'tpl/common/accredit_again.html', data, function(){
                window.location.href = $scope.href;
            })
        }
    }
    if(/code\=\d/.test(window.location.href)){
        var int = +window.location.href.match(/code\=(\d+)/)[1];
        var msg;
        switch(int){
            case 1:
                msg = '授权成功';
            break;
            case 2:
                msg = '授权的公众号已经授权给其他的商户，需要重新授权';
            break;
            case 3:
                //msg = '两次授权的公众号不一致，会将之前的微信相关数据清掉';
                var data = {title: '公众号重新授权', status: 2};
                $scope.$emit('show.detail', 'tpl/common/wxchatConfirm.html', data, function(){
                    userInfo.get('merchant/invalid')
                })
            break;
            case 4:
                msg = '授权的公众号为未认证的公众号，需要重新授权';
            break;
            case 5:
                msg = '授权失败，请重新授权';
            break;
        }
        if(msg) ws.alert({msg: msg});
        setTimeout(function(){
            location.href = location.href.replace(/\?code=\d$/, '');
        }, 3000);
    }

    //微应用查看更多方法
     $scope.applicatedMoreWays = function(){
         $mdDialog.show({
             clickOutsideToClose: true,
             templateUrl: tplUrl + 'tpl/common/mdDialogTip.html',
             controller: function(scope,$sce){
                 scope.onlyTip = false;
                 scope.hideCancel = true;
                 scope.title = '查看更多方法';
                 scope.hideBtn = true;
                 scope.IsWidth = true;
                 scope.content = $sce.trustAsHtml('<div class="moreWays-dialog"><p><span>使用方法一：</span>传播给顾客——下载二维码，在宣传物料（立牌、展架、海报）上展示，或QQ、微信传播。<br><span>使用方法二：</span>在微信公众平台配置菜单链接——“自定义菜单”栏目，粘贴至对应的微应用URL。</p><img src="http://7xogpz.com2.z0.glb.qiniucdn.com/mcht_print_set_015440395001877_1484795431041.png" width="826" height="547" class="moreWays-img"/></div>');
                 scope.cancel = function(){
                     $mdDialog.cancel();
                 };
             }
         })
     }

    //复制会员卡和优惠券URL
    userInfo.get('merchant/menuUrl').then(function(res) {
        $scope.memberCardUrl = res.object.memberCardUrl;
        $scope.myCardListUrl = res.object.myCardListUrl;
    })
    $scope.copyUrLBtn = function(onoff){
        var oURL;
        if(onoff==1){
            oURL=document.getElementById('cardInputURL');
            oURL.select();
            document.execCommand("Copy");
        }else {
            oURL=document.getElementById('couponInputURL');
            oURL.select();
            document.execCommand("Copy");
        }
      $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
            controller : function(scope){
                scope.onlyTip = true;
                scope.tip = '复制成功';
                setTimeout(function(){$mdDialog.hide();},1000);
            }
        })
    }
    //下载会员卡和优惠券URL二维码
     $scope.downloadErweima = function(e,onoff){
         if(onoff==0){
             e.target.href = '/server/s300/merchant/createMenuImg?url='+ $scope.memberCardUrl;
         }else{
             e.target.href = '/server/s300/merchant/createMenuImg?url='+ $scope.myCardListUrl;
         }
     }
}]);
