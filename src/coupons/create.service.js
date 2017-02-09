app.service('coupons.create.service', ['$http', '$timeout', 'baseUrl', 'coupons.list.service', function($http, $timeout, baseUrl, listService){

    this.addCoupon = function(params){
        return $http.post(baseUrl + 'cards', params).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };

    this.modifyCoupon = function(params){
        return $http.put(baseUrl + 'cards', params).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };

    this.add_friend_coupon = function(params){
        return $http.post(baseUrl + 'cards/friend', params).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };

    this.modify_friend_coupon = function(params){
        return $http.put(baseUrl + 'cards/friend', params).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };

    // 充值 券点
    this.payCoin = function(num){
        return $http.post(baseUrl + 'coin/pay', {coin_count: num}).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    };

    // 券点详情
    this.coinDetail = function(coin_id){
        return $http.get(baseUrl + 'coin/' + coin_id).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    };

    // 券点列表
    this.coinList = function(params){
        return $http.get(baseUrl + 'coin/infoList',{params: params}).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    };

    // 券点余额
    this.getCoin = function(){
        return $http.get(baseUrl + 'coin').then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    };

    this.getFriendsCard = function(params){
        return listService.getCards(params);
    };

    this.upload = function (file) {
        return $http.post(baseUrl + 'cards/uploadImage', file, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    };

    this.coinStatus = function(){
        return {'':'所有', ORDER_STATUS_WAITING: '等待支付', ORDER_STATUS_SUCC: '支付成功', ORDER_STATUS_FINANCE_SUCC: '加代币成功', ORDER_STATUS_QUANTITY_SUCC: '加库存成功', ORDER_STATUS_HAS_REFUND: '已退币', ORDER_STATUS_REFUND_WAITING: '等待退币确认', ORDER_STATUS_ROLLBACK: '失败回退', ORDER_STATUS_HAS_RECEIPT: '已开发票' };
    }

    //格式化小时和分钟数据
    this.formatHm = function(hm){
        hm = hm +　'';
        return hm = hm.length == 1 ? '0' + hm : hm;
    }
    
}]);
