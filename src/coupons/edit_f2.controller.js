app.controller('coupons.edit_f2.controller', ['coupons.create.service', '$rootScope', '$alert', '$state', '$date', 'NgTableParams', '$scope', 'userInfo', function (Service, $rootScope, $alert, $state, $date, NgTableParams, $scope, userInfo) {
    var vm = this,
        User = $rootScope.User,
        consumeShareCardList = [];

    var data = userInfo.data;   
    if(ws.isEmptyObj(data)) return $state.go('coupons.edit_f', {cid: $state.params.cid}); 

    vm.create = data.create || {};
    vm.user = data.user || {};
    // 默认门店 无门店限制


    vm.coupon = data.coupon || {};
    vm.validity = {};
    vm.validity.begin = vm.coupon.baseInfo.beginTimestamp;
    vm.validity.end = vm.coupon.baseInfo.endTimestamp;

    vm.getFriendsCard = function(){
        // 查询 朋友券
        var queryParams = {};
        vm.ngTable = new NgTableParams(
            { page: 1, count: 10 },
            {
                getData: function ($defer, params) {
                    queryParams.page = params.page();
                    queryParams.rows = params.count();
                    queryParams.friendType = 2;
                    queryParams.status = 'CARD_STATUS_VERIFY_OK';

                    Service.getFriendsCard(queryParams).then(function (res) {
                        vm.create.checkedCard = '-1';
                        if(res.code == 0){
                            if(res.object.list && res.object.list.length){
                                vm.noData = false;
                                $defer.resolve(res.object.list);
                                params.total(res.object.totalRows);
                                //编辑下设置数据
                                var int;
                                for(var i in res.object.list){
                                    if($state.params.cid == res.object.list[i].cardId){
                                        int = i;
                                        break;
                                    }
                                }
                                if(int >= 0){
                                    res.object.list.splice(int, 1);
                                    params.total(res.object.totalRows - 1);
                                    if(!res.object.list.length) vm.noData = res.msg || '暂无数据';
                                }
                                for(var j in res.object.list){
                                    if(vm.coupon.advancedInfo.consumeShareCardListTmp.length){
                                        if(vm.coupon.advancedInfo.consumeShareCardListTmp[0].card_id == res.object.list[j].cardId){
                                            vm.create.checkedCard = j;
                                            data.obj.advancedInfo.consumeShareCardListTmp =  [{ card_id : res.object.list[j].cardId, num: '1' }];
                                            break;
                                        }
                                    }
                                }

                                consumeShareCardList = res.object.list;
                            }else{
                                vm.noData = true;
                                $defer.resolve([]);
                            }
                        }else{
                            vm.noData = true;
                            $defer.resolve([]);
                        }
                    });
                }
            }
        );

    };
    if(vm.coupon.baseInfo.locationIdList == 'allPoi'){
        vm.create.poiRadio = 'allPoi';
    }
    if(/\[/.test(vm.coupon.baseInfo.locationIdList)){
        $scope.ids = ws.wipe(vm.coupon.baseInfo.locationIdList).split(',');
        vm.create.poiRadio = 'myPoi';
        var url= 'poi/store/ids?type=1&ids=';
        angular.forEach($scope.ids, function(it, i){
            it = it.replace(/^ /, '');
            url += it + ',';
        })
        url = url.replace(/\,$/, '');
        userInfo.get(url).then(function(res){
            $scope.poiLists = res.object;
        })
    }
    if(vm.coupon.advancedInfo.consumeShareSelfNum == 1 || (vm.coupon.advancedInfo.consumeShareCardListTmp.length && vm.coupon.advancedInfo.consumeShareCardListTmp[0].card_id)){
        vm.create.consume = true;
        if(vm.coupon.advancedInfo.consumeShareCardListTmp.length && vm.coupon.advancedInfo.consumeShareCardListTmp[0].card_id){
            vm.create.consume_share = 'list';
            vm.getFriendsCard();

        }else{
            vm.create.consume_share = 'self';
        }
    }
    
    $scope.selectPoi = function(){
        $scope.$emit('select.poi.start', $scope.poiLists);
    }

    $scope.$on('select.poi.end', function(eve, arr){
        $scope.poiLists = arr;
    })

    $scope.remove = function(index){
        ws.noAjaxDialog('确认删除该门店吗？', function(){
            $scope.poiLists.splice(index, 1);
        })
    }

    // 卡券类型
    if($state.params.type){
        // 朋友券类型
        vm.create.type = $state.params.type;
        vm.coupon.cardType = getType($state.params.type);
    }

    // 核销后 赠送朋友券
    vm.selectCard = function(item, index){
        if(item.baseInfo.quantity < 1){
            $alert({msg: '库存为0，不能设置'});
            return;
        }
        if(item.baseInfo.status !=='CARD_STATUS_VERIFY_OK'){
            $alert({msg: '优惠券已过期，不能设置'});
            return;
        }
        vm.create.checkedCard = index;

        data.obj.advancedInfo.consumeShareCardListTmp =  [{ card_id : item.cardId, num: '1' }];
    };

    // 兑换券 消费金额 或者 商品 m , g
    if(vm.coupon.cardType == 'GIFT'){
        //vm.create.need_money_goods = true;
        //vm.create.money_goods = 'm';
    }


    // 提交数据
    vm.addCoupon = function(err, int){
        if(err){
            //vm.formError = 'form-error';
            vm.formError = true;
            return;
        }else{
            //vm.formError = '';
            vm.formError = false;
        }

        
        var obj = data.obj;
        obj.baseInfo.getLimit = vm.coupon.baseInfo.getLimit;
        obj.baseInfo.notice = vm.coupon.baseInfo.notice;
        if(vm.create.poiRadio == 'myPoi'){
            if(!$scope.poiLists.length) return ws.alert({msg: '请选择门店'});
            $scope.ids = [];
            angular.forEach($scope.poiLists, function(it, i){
                $scope.ids.push(it.merchantNo)
            })
            obj.baseInfo.locationIdList = $scope.ids.join(',');
        }else if(vm.create.poiRadio == 'allPoi'){
            obj.baseInfo.locationIdList = vm.create.poiRadio;
        }else{
            return ws.alert({msg: '请选择门店'});
        }
        obj.baseInfo.promotionUrlName = vm.coupon.baseInfo.promotionUrlName;
        obj.baseInfo.promotionUrl = vm.coupon.baseInfo.promotionUrl;
        obj.baseInfo.promotionUrlSubTitle = vm.coupon.baseInfo.promotionUrlSubTitle;
        obj.baseInfo.type = '2';
        //返券设置
        if(vm.create.consume){
            if(vm.create.consume_share == 'self'){
                obj.advancedInfo.consumeShareSelfNum = 1;
                obj.advancedInfo.consumeShareCardListTmp = [];
            }else{
                obj.advancedInfo.consumeShareSelfNum = '';
                if(vm.create.checkedCard >= 0){
                    obj.advancedInfo.consumeShareCardListTmp =  [{ card_id : consumeShareCardList[vm.create.checkedCard].cardId, num: '1' }];
                }else{
                    if(vm.noData){   // 没有可用的其他朋友券
                        return;
                    }else{  //有其他可用的朋友券，但是没有勾选
                        //return ws.alert({msg: '请选择要赠送的优惠券'});
                        return vm.create.consume_list_no = true;
                    }
                }
            }
        }else{
            obj.advancedInfo.consumeShareSelfNum = '';
            obj.advancedInfo.consumeShareCardListTmp = [];
        }
        

        vm.submiting = true;
        Service.modify_friend_coupon(obj).then(function(res){
            console.log(obj);
            vm.submiting = false;
            if(res.code == 0){
                $alert({msg: '修改成功'});
                $state.go('coupons.list')
            }else if(res.code == '40140'){
                $alert({msg: '商户授权状态无效'});
            }else if(res.code == '45040'){
                $alert({msg: '当月创建卡券数量已达到上限'});
            }else {
                $alert({msg: res.msg || '修改失败，请重试'});
            }
        });
        return;
       
    };

    vm.initPos = function(){
        setTimeout(function(){
            var content = document.getElementsByClassName('scrollContent')[0];
            var mobileView = document.getElementsByClassName('suspension-wrap')[0];
            mobileView.style.top = '104px';
            var mobileTop = mobileView.getBoundingClientRect().top;
            content.onscroll = function(){
                var sTop = content.scrollTop;
                if(sTop < 104 - 65) mobileView.style.top = (104 - sTop) + 'px';
                else mobileView.style.top = '85px';
            }
        }, 100)
    }

}]);