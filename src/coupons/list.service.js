app.service('coupons.list.service', ['$http', '$timeout', 'baseUrl', 'User','$mdDialog','tplUrl','$interval' ,
    function($http, $timeout, baseUrl, User, $mdDialog, tplUrl, $interval){


    this.getCards = function(params){

        return $http.get(baseUrl + 'cards/searchList.json').then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };

    this.delCard = function(id, appid, payoutStatus){
        return $http.get(baseUrl + 'cards/delete/' + id + '?merchantAppid=' + appid + '&payoutStatus=' + payoutStatus).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };

    this.getCard = function(ID){
        return $http.get(baseUrl + 'cards/' + ID).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    };

    this.delivery = function(ID){
        return $http.put(baseUrl + 'cards/delivery/' + ID).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    };

    // 券点余额
    function getCoin(){
        return $http.get(baseUrl + 'coin').then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    }

    // 开通券点账户
    this.coinSign = function(){
        return $http.get(baseUrl +'coin/regist').then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    };

    //普通券修改库存
    function setQuantity(queryParams){
        return $http.put(baseUrl + 'cards/quantity',queryParams).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    }

    // 批价--朋友券
    function getPrice(id, count){
        return $http.post(baseUrl + 'coin/price', {card_id: id, quantity: count}).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    }

    // 确认兑换
    function setQuantityFriend(orderId, id, count){
        return $http.post(baseUrl + 'coin/quantity', {order_id: orderId, card_id: id, quantity: count}).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    }
    //修改库存通用方法
    // 批价
    this.editInventory = function(item){
        var id = item.baseInfo ? item.baseInfo.cardId : item.cardId;
        var couponType = item.baseInfo ? item.baseInfo.type : item.cardType;
        var couponTitle = item.baseInfo ? item.baseInfo.title : item.title;
        var couponQuantity = item.baseInfo ? item.baseInfo.quantity : item.quantity;
        //朋友券
        if(couponType == 2){
            getPrice(id, 1).then(function(coin){
                $mdDialog.show({
                    clickOutsideToClose: true,
                    templateUrl: tplUrl + 'tpl/coupons/get_price.html',
                    controllerAs: 'vm',
                    controller: function getPriceController (){
                        var _vm  = this, timmer;
                        _vm.step = 1;
                        _vm.success = false;
                        _vm.coin = coin;
                        _vm.cardTitle = couponTitle;
                        _vm.cancel = function(){
                            $mdDialog.cancel();
                        };

                        _vm.next = function(){
                            if(!_vm.count){
                                return _vm.err = true;
                            }
                            if(_vm.count < 0 || _vm.count > 100000){
                                return _vm.err = true;
                            }
                            _vm.err = false;

                            getCoin().then(function(res){
                                _vm.total = res.total_coin;
                            });

                            _vm.step = 2;
                        };

                        _vm.next2 = function(){
                            if(_vm.notEnough) return;

                            getPrice(id, _vm.count).then(function(res){                     var time = 30;
                                _vm.timeout = false;
                                _vm.coin = res;

                                // 删除定时器，重置倒计时
                                $interval.cancel(timmer);
                                _vm.time = time;

                                if(_vm.total -  res.free_coin - res.pay_coin >= 0){
                                    _vm.step = 3;
                                    _vm.notEnough = false;

                                    timmer = $interval(function(index){
                                        console.log(time- index);
                                        _vm.time = time - index;
                                        if(index == time){
                                            _vm.timeout = true;
                                            _vm.step = 4;
                                        }
                                    }, 1000, time);

                                }else{
                                    _vm.notEnough = true;
                                }
                            });
                        };



                        _vm.submit = function(){
                            // 确认设置库存
                            setQuantityFriend(_vm.coin.order_id, id, _vm.count ).then(function(res){
                                console.log(res);
                                $interval.cancel(timmer);
                                if(res.code == 0){
                                    if((item.baseInfo && item.baseInfo.quantity) || (item.baseInfo && item.baseInfo.quantity == 0)) item.baseInfo.quantity += _vm.count;
                                    if(item.quantity || item.quantity == 0) item.quantity += _vm.count;
                                    _vm.success = true;
                                    setTimeout($mdDialog.hide, 2000)
                                }else if(res.code == 71008){
                                    _vm.timeout = true;
                                    _vm.step = 4;
                                }

                            });

                        };

                    }
                });
            });
        }
        //普通券
        else{
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: tplUrl + 'tpl/coupons/set_quantity.html',
                controllerAs: 'vm',
                controller: function setQuantityController (){
                    var _vm  = this;
                    _vm.success = false;
                    _vm.cardTitle = couponTitle;
                    _vm.setQuantity = 'add';
                    _vm.cancel = function(){
                        $mdDialog.cancel();
                    };



                    _vm.submit = function(){
                        // 确认设置库存
                        var queryParams = {};
                        if(!_vm.count){
                            return _vm.err1 = true;
                        }
                        if(_vm.count < 0 || _vm.count > 100000){
                            return _vm.err1 = true;
                        }
                        if(_vm.setQuantity == "reduce"){
                            if(couponQuantity - (+_vm.count) < 1 ){
                                return _vm.err2 = true;
                            }
                            queryParams.quantity = parseInt(-_vm.count);
                        }else if(_vm.setQuantity == "add"){
                            queryParams.quantity = parseInt(_vm.count);
                        }
                        _vm.err1 = false;
                        _vm.err2 = false;
                        queryParams.card_id = item.cardId;
                        setQuantity(queryParams).then(function(res){
                            console.log(res);
                            if(res.code == 0){
                                if((item.baseInfo && item.baseInfo.quantity) || (item.baseInfo && item.baseInfo.quantity == 0))  _vm.setQuantity == 'add' ? item.baseInfo.quantity += _vm.count : item.baseInfo.quantity -= _vm.count;
                                if(item.quantity || item.quantity == 0)  _vm.setQuantity == 'add' ? item.quantity += _vm.count : item.quantity -= _vm.count;
                                _vm.success = true;
                                setTimeout($mdDialog.hide, 1000)
                            }
                        });

                    };

                }
            });
        }

    };
}]);
