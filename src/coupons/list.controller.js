app.controller('coupons.list.controller',
    ['coupons.list.service', 'NgTableParams', '$state', '$mdDialog', '$alert', 'tplUrl', 'app.common.service', 'User', '$interval', '$rootScope', '$scope', 'userInfo',
        function(Service, NgTableParams, $state, $mdDialog, $alert, tplUrl, commonService, User, $interval, $rootScope, $scope, userInfo){
    var vm = this;

    //判断是否授权，显示券点
    userInfo.get('mcht/info.json').then(function(res){

        if(res.code == 0 && !ws.isEmptyObj(res.object)){
            vm.user = res.object;
            if(vm.user.weixinType == '1' && vm.user.authStatus == '1') {
                if($rootScope.powers) isShowCoinBtn();
                else{
                    userInfo.getWigets().then(function(res){
                        $rootScope.powers = res;
                        isShowCoinBtn();
                    })
                }
                // 根据 类目判断是否 在允许类目内
                commonService.checkCategory();
            }
            //判断只有品牌或普通商户管理员会去调权限接口
            userInfo.getUser().then(function(res){
                if(res.object.role == 'BrandAdmin' || res.object.role == 'StoreAdmin'){
                    //用户的权限信息
                    userInfo.get('merchant/authority.json').then(function (res) {
                        User = res.object;
                    });
                }
            });

        }
    });

    function isShowCoinBtn(){
        if($rootScope.powers && $rootScope.powers.indexOf('coupons.list_my.coin') >= 0) {
            userInfo.get('coin/show.json').then(function (res) {
                vm.totalCoin = res.total_coin;
            })
        }
    }

    vm.ngTable = new NgTableParams(
        {page: 1, count: 10},
        {
            getData: function(params) {
                queryParams.page = params.page();
                queryParams.rows = params.count();

                return Service.getCards(queryParams).then(function(res){
                    res = ws.changeRes(res);
                    params.total(res.object.totalRows);
                    if(res.code == 0){
                        //vm.couponCount = res.object.couponCount;
                        if(res.object.list.length){
                            vm.noData = false;
                            return res.object.list;
                        }else{
                            vm.noData = res.msg || '您还未创建任何卡券，请新增卡券';
                            return [];
                        }
                    }else{
                        vm.noData = res.msg || '您还未创建任何卡券，请新增卡券';
                    }
                })
            }
        }
    );


    var queryParams = vm.queryParams = {};
    /*userInfo.getUser().then(function(res){
        vm.users = res.object;
    })*/

    vm.delCard = function(cardId){
        var payoutStatus;
        //检测优惠券是否在派券
        userInfo.get('cards/checkPayoutStatus/'+cardId).then(function(res) {
            payoutStatus = res.object;
            //没有用在“优惠券派发”中
            if(payoutStatus == '0'){
                var confirm = $mdDialog.confirm({
                    title: 'title',
                    templateUrl: tplUrl + 'tpl/coupons/coupon_del_dialog.html'
                });
                $mdDialog.show(confirm).then(function() {
                    deleteCard(cardId,payoutStatus);
                });

            }
            //有用在“优惠券派发”中
            else{
                $mdDialog.show({
                    clickOutsideToClose: true,
                    templateUrl: tplUrl + 'tpl/common/mdDialogTip.html',
                    controller: function(scope, $sce){
                        scope.onlyTip = false;
                        scope.title = '确认删除？';
                        if(payoutStatus == '2')
                            scope.content = $sce.trustAsHtml('当前卡券被使用在“小票派券”中，删除后将影响推送优惠券功能，是否删除？');
                        if(payoutStatus == '1')
                            scope.content = $sce.trustAsHtml('当前卡券被使用在“关注微信派券”中，删除后将影响推送优惠券功能，是否删除？');
                        if(payoutStatus == '3')
                            scope.content = $sce.trustAsHtml('当前卡券被使用在“营销中心”中，删除后将影响推送优惠券功能，是否删除？');
                        if(payoutStatus == '4')
                            scope.content = $sce.trustAsHtml('当前卡券被使用在“关注微信派券”、“小票派券”和“营销中心”中，删除后将影响推送优惠券功能，是否删除？');
                        if(payoutStatus == '5')
                            scope.content = $sce.trustAsHtml('当前卡券被使用在“关注微信派券”和“小票派券”中，删除后将影响推送优惠券功能，是否删除？');
                        if(payoutStatus == '6')
                            scope.content = $sce.trustAsHtml('当前卡券被使用在“关注微信派券”和“营销中心”中，删除后将影响推送优惠券功能，是否删除？');
                        if(payoutStatus == '7')
                            scope.content = $sce.trustAsHtml('当前卡券被使用在“小票派券”和“营销中心”中，删除后将影响推送优惠券功能，是否删除？');
                        scope.cancel = function(){
                            $mdDialog.cancel();
                        };
                        scope.submit = function(){
                            $mdDialog.cancel();
                            deleteCard(cardId, payoutStatus);
                        }
                    }
                })
            }
        });
    };

    function deleteCard(cardId, payoutStatus){
        Service.delCard(cardId, vm.user.authorizerAppid, payoutStatus).then(function(res){
            if(res.code == 0) {
                $alert({msg: '操作成功'});
                if(vm.ngTable.total() % 10 == 1){
                    vm.ngTable.page(vm.ngTable.page() - 1);
                }
                vm.ngTable.reload();
            }
        });
    }
    vm.getQrCode = function(item){
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/common/qrCode.html',
            controller: function(scope, $http){
                scope.isMemberShip = false;
                scope.logo = vm.user.s300LogoUrl;
                scope.name = vm.user.brandName;
                scope.title = item.baseInfo.title;
                scope.color = item.baseInfo.color;
                if(item.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TERM'){
                    scope.validity = "领取后";
                    scope.validity += item.baseInfo.fixedBeginTerm == 0 ? '当':item.baseInfo.fixedBeginTerm;
                    scope.validity += "天有效，有效期" + item.baseInfo.fixedTerm + "天";
                }
                if(item.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TIME_RANGE'){
                    //scope.begin = item.baseInfo.beginTimestamp.replace(/\-/g, '.');
                    scope.begin = item.baseInfo.beginTimestamp;
                    //scope.end = item.baseInfo.endTimestamp.replace(/\-/g, '.');
                    scope.end = item.baseInfo.endTimestamp;
                }


                /*var xml = new XMLHttpRequest();
                xml.open("GET",'/server/s300/cards/qrCode/' + item.cardId); 
                xml.send(null); 
                xml.onreadystatechange = function(){
                    if(xml.readyState==4 && xml.status==200){
                        scope.src = xml.responseText.match(/\"(.+)\"/)[1];
                        console.log(scope.src)
                        scope.$apply();
                    }
                }*/

                userInfo.get('cards/qrCode/' + item.cardId).then(function(res){
                    if(res.code == '45031') return ws.alert({msg:'库存不足！'});
                    scope.src = res.object;
                    console.log(scope.src);
                    //scope.$apply();
                })
            }
        }).then(function(data){
            
        });
    }

    vm.createCoupons = function(){
        if (vm.user && vm.user.weixinType == '1' && vm.user.authStatus == '1') {
            userInfo.get('merchant/authority.json').then(function (res) {
                if (res.object.openCard != 1)
                    ws.alert({msg: '您授权公众号未开通卡卷权限，请开通卡卷权限后进行重新授权',time:5000});
                else createCoupons();
            })
        }else {
            createCoupons();
        }
    };

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

    function createCoupons() {
        // 选择卡券类型
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/coupons/type.html',
            controllerAs: 'typeCtrl',
            controller: function(userInfo){
                this.User = User;
                this.User.poi_friend_disable = false;
                this.canFriendsCards = userInfo.canFriendsCards;
                if(User.normalStoreCount < 1 || User.coinType == 0){
                    this.User.poi_friend_disable = true;
                }

                this.hide = function(data){
                    if(!data.type) return;
                    $mdDialog.hide(data);
                };
                this.cancel = function(){
                    $mdDialog.cancel();
                };

                this.goCoin = function(){
                    $mdDialog.cancel();
                    $interval(function(){
                        vm.goCoin();
                    },300,1);
                }
            }
        }).then(function(data){
            if(data.friend){
                $state.go('coupons.create_f', {type: data.type});
            }else{
                $state.go('coupons.create', {type: data.type});
            }
        });
    }


    // 批价
    ///*vm.getPrice = function(item){
    //    var id = item.cardId;
    //    //朋友券
    //    if(item.baseInfo.type == 2){
    //        Service.getPrice(id, 1).then(function(coin){
    //            $mdDialog.show({
    //                clickOutsideToClose: true,
    //                templateUrl: tplUrl + 'tpl/coupons/get_price.html',
    //                controllerAs: 'vm',
    //                controller: function getPriceController (){
    //                    var _vm  = this, timmer;
    //                    _vm.step = 1;
    //                    _vm.success = false;
    //                    _vm.coin = coin;
    //                    _vm.cardTitle = item.baseInfo.title;
    //                    _vm.cancel = function(){
    //                        $mdDialog.cancel();
    //                    };
    //
    //                    _vm.next = function(){
    //                        if(!_vm.count){
    //                            return _vm.err = true;
    //                        }
    //                        if(_vm.count < 0 || _vm.count > 100000){
    //                            return _vm.err = true;
    //                        }
    //                        _vm.err = false;
    //
    //                        getCoins().then(function(total){
    //                            _vm.total = total;
    //                        });
    //
    //                        _vm.step = 2;
    //                    };
    //
    //                    _vm.next2 = function(){
    //                        if(_vm.notEnough) return;
    //
    //                        Service.getPrice(id, _vm.count).then(function(res){                     var time = 30;
    //                            _vm.timeout = false;
    //                            _vm.coin = res;
    //
    //                            // 删除定时器，重置倒计时
    //                            $interval.cancel(timmer);
    //                            _vm.time = time;
    //
    //                            if(_vm.total -  res.free_coin - res.pay_coin >= 0){
    //                                _vm.step = 3;
    //                                _vm.notEnough = false;
    //
    //                                timmer = $interval(function(index){
    //                                    console.log(time- index);
    //                                    _vm.time = time - index;
    //                                    if(index == time){
    //                                        _vm.timeout = true;
    //                                        _vm.step = 4;
    //                                    }
    //                                }, 1000, time);
    //
    //                            }else{
    //                                _vm.notEnough = true;
    //                            }
    //                        });
    //                    };
    //
    //
    //
    //                    _vm.submit = function(){
    //                        // 确认设置库存
    //                        Service.setQuantityFriend(_vm.coin.order_id, id, _vm.count ).then(function(res){
    //                            console.log(res);
    //                            $interval.cancel(timmer);
    //                            if(res.code == 0){
    //                                item.baseInfo.quantity += _vm.count;
    //                                _vm.success = true;
    //                                setTimeout($mdDialog.hide, 2000)
    //                            }else if(res.code == 71008){
    //                                _vm.timeout = true;
    //                                _vm.step = 4;
    //                            }
    //
    //                        });
    //
    //                    };
    //
    //                }
    //            });
    //        });
    //    }
    //    //普通券
    //    else{
    //        $mdDialog.show({
    //            clickOutsideToClose: true,
    //            templateUrl: tplUrl + 'tpl/coupons/set_quantity.html',
    //            controllerAs: 'vm',
    //            controller: function setQuantityController (){
    //                var _vm  = this;
    //                _vm.success = false;
    //                _vm.cardTitle = item.baseInfo.title;
    //                _vm.setQuantity = 'add';
    //                _vm.cancel = function(){
    //                    $mdDialog.cancel();
    //                };
    //
    //
    //
    //                _vm.submit = function(){
    //                    // 确认设置库存
    //                    var queryParams = {};
    //                    if(!_vm.count){
    //                        return _vm.err1 = true;
    //                    }
    //                    if(_vm.count < 0 || _vm.count > 100000){
    //                        return _vm.err1 = true;
    //                    }
    //                    if(_vm.setQuantity == "reduce"){
    //                        if(item.baseInfo.quantity - (+_vm.count) < 1 ){
    //                            return _vm.err2 = true;
    //                        }
    //                        queryParams.quantity = parseInt(-_vm.count);
    //                    }else if(_vm.setQuantity == "add"){
    //                        queryParams.quantity = parseInt(_vm.count);
    //                    }
    //                    _vm.err1 = false;
    //                    _vm.err2 = false;
    //                    queryParams.card_id = item.cardId;
    //                    Service.setQuantity(queryParams).then(function(res){
    //                        console.log(res);
    //                        if(res.code == 0){
    //                            _vm.setQuantity == 'add' ? item.baseInfo.quantity += _vm.count : item.baseInfo.quantity -= _vm.count;
    //                            _vm.success = true;
    //                            setTimeout($mdDialog.hide, 2000)
    //                        }
    //                    });
    //
    //                };
    //
    //            }
    //        });
    //    }
    //
    //};*/
    vm.getPrice = function(item){
        Service.editInventory(item);
    }

    // 券点账户
    vm.goCoin = function () {
        commonService.checkAuthority().then(function(res){
            if(res.code == 0){
                if(res.object.coinType == '1'){
                    $state.go('coupons.coin');
                    return Promise.reject();
                }

                if(res.object.openCard == '1'){
                    return Promise.resolve();
                }else{
                    $alert({msg: '您授权公众号未开通卡卷权限，请开通卡卷权限后进行重新授权',time:5000});
                    return Promise.reject()
                }
            }
        }).then(function(){
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: tplUrl + 'tpl/coupons/coin_confirm.html',
                controllerAs: '_vm',
                controller: function(){
                    var _vm = this;
                    this.hide = function(){
                        Service.coinSign().then(function(res){
                            // 开通券点账户成功
                            if(res.code == 0){
                                User.coinType = 1;
                                
                                $mdDialog.hide();
                                $state.go('coupons.coin');
                            }else{
                                // 开通券点功能失败
                                _vm.coin_err = true;
                            }
                        });
                    };
                    this.cancel = function(){ $mdDialog.cancel(); };
                }
            });

        }, function(reject){

        });

    };

    vm.delivery = function(item){
        Service.delivery(item.cardId).then(function(res){
            console.log(res);
            if(res.code == 0){
                item.deliveryTag = 1;
                $alert({msg: '操作成功'});
            }
        })
    };



    vm.detail = function(item){
        //保存进入详情页的卡券数据  以便在详情页中编辑
        //vm.detailItem = item;
        //getContent(item.cardId);
        $state.go('coupons.detail', {cid: item.cardId});
    };

    vm.edit = function(item){
        var str = item.baseInfo.type == '1' ? 'coupons.edit' : 'coupons.edit_f';
        $state.go(str, {cid: item.cardId});
    }

    /*// 获取券点余额
    function getCoins () {
        return Service.getCoin().then(function(res){
            return res.total_coin;
        })
    }*/


    function getContent(ID){
        Service.getCard(ID).then(function(res){
            vm.preview = res.object.card;
            vm.preview.poi = res.object.poi;
        });
    }



}])
.filter('timesLimit', function(){
    var days = {
        MONDAY: '一', TUESDAY: '二', WEDNESDAY: '三', THURSDAY: '四', FRIDAY: '五', SATURDAY: '六', SUNDAY: '日'
};
    return function(day){
        return days[day];
    }
})
.filter('baseInfoStatus',function(){
    return function(status){
        switch (status){
            case 'CARD_STATUS_NOT_VERIFY':
                return '待审核';
                break;
            case 'CARD_STATUS_VERIFY_FAIL':
                return '审核失败';
                break;
            case 'CARD_STATUS_VERIFY_OK':
                return '通过审核';
                break;
            case 'CARD_STATUS_DISPATCH':
                return '已投放';
                break;
            case 'CARD_STATUS_EXPIRED':
                return '已过期';
                break;
        }
    }
});

