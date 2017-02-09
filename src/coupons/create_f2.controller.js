app.controller('coupons.create_f2.controller', ['coupons.create.service', '$rootScope', '$alert', '$state', '$date', 'NgTableParams', '$scope', 'userInfo', function (Service, $rootScope, $alert, $state, $date, NgTableParams, $scope, userInfo) {
    var vm = this,
        User = $rootScope.User;

    var data = userInfo.data; 
    if(ws.isEmptyObj(data)) return $state.go('coupons.create_f', {type: $state.params.type});
     
    vm.create = data.create || {};
    // 默认门店 无门店限制
    vm.create.poiRadio = 'allPoi';


    vm.coupon = data.coupon || {};

    vm.user = data.user || {};
    vm.validity = {};
    vm.validity.begin = vm.coupon.baseInfo.beginTimestamp;
    vm.validity.end = vm.coupon.baseInfo.endTimestamp;

    $scope.poiLists = [];
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
        if(item.baseInfo.quantity<1){
            $alert({msg: '库存为0，不能设置'});
            return;
        }
        if(item.baseInfo.status !=='CARD_STATUS_VERIFY_OK'){
            $alert({msg: '优惠券已过期，不能设置'});
            return;
        }
        vm.create.checkedCard = index;

        vm.coupon.advancedInfo.consumeShareCardListTmp =  [{ card_id : item.cardId, num: '1' }];
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
        if(vm.create.poiRadio == 'myPoi'){
            if(!$scope.poiLists.length) return ws.alert({msg: '请选择门店'});
            var arr = []
            for(var i in $scope.poiLists){
                arr.push($scope.poiLists[i].merchantNo);
            }
            vm.coupon.baseInfo.locationIdList = arr.join(',');
        }else if(vm.create.poiRadio == 'allPoi'){
            vm.coupon.baseInfo.locationIdList = vm.create.poiRadio;
        }else{
            return ws.alert({msg: '请选择门店'});
        }
        //vm.coupon.baseInfo.locationIdList = vm.create.poiRadio;
        
        // 返券设置
        if(vm.create.consume){
            vm.create.consume_err = false;
            if(!vm.create.consume_share ){
                vm.create.consume_err = true;
                return;
            }
            if(vm.create.consume_share == 'self'){
                vm.coupon.advancedInfo.consumeShareSelfNum = 1;
                vm.coupon.advancedInfo.consumeShareCardListTmp = [];
            }else{
                if(!vm.coupon.advancedInfo.consumeShareCardListTmp.length) {
                    vm.create.consume_err = true;
                    return;
                }
                vm.coupon.advancedInfo.consumeShareSelfNum = '';
            }
        }else{
            vm.coupon.advancedInfo.consumeShareSelfNum = '';
            vm.coupon.advancedInfo.consumeShareCardListTmp = [];
        }
       

        if(vm.coupon.cardId && vm.coupon.id){
            console.log(vm.coupon);
            Service.modify_friend_coupon(vm.coupon).then(function(res){

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
        }
        
        vm.submiting = true;


        Service.add_friend_coupon(vm.coupon).then(function(res){
            console.log(vm.coupon);
            if(res.code == 0){
                $alert({msg: '创建成功'});
                $state.go('coupons.list')
            }else if(res.code == '40140'){
                $alert({msg: '商户授权状态无效'});
            }else if(res.code == '45040'){
                $alert({msg: '当月创建卡券数量已达到上限'});
            }else if(res.code == '45160'){
                $alert({msg: '您当前经营类目无法创建朋友的券'});
            }else {
                $alert({msg: res.msg || '创建失败，请重试'});
            }
            vm.submiting = false;
        });

        // Service.upload(userInfo.data.formData).then(function(res){
        //     return res.object;
        // }).then(function(urls){
        //     setImages(urls);

            
        // });

    };

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
                            }else{
                                //vm.noData = res.msg || '暂无数据';
                                vm.noData = true;
                                $defer.resolve([]);
                            }
                        }else{
                            vm.noData = true;
                            //vm.noData = res.msg || '暂无数据';
                            $defer.resolve([]);
                        }
                    });
                }
            }
        );

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