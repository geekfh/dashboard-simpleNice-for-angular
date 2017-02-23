app.controller('overviewController', function($scope, userInfo, $stateParams, $q, $rootScope, $date, $rootScope, $timeout){
    $scope.trade = {};//交易
    $scope.member = {};//会员
    $scope.coupon = {};//优惠券
    $scope.tradeType = '0';
    $scope.memberType = '0';
    $scope.couponType = '0';
    $scope.tradeDateType = '0';
    $scope.memberDateType = '0';
    $scope.couponDateType = '0';
    $scope.queryParams = {};//交易参数
    $scope.memberParams = {};//会员卡参数
    $scope.couponParams = {};//优惠券参数

    var numTime = 3600 * 24 * 1000;
    var yesterday = $date.format(new Date() - 1 * numTime, 0).string;
    var sevenDay = $date.format(new Date() - 7 * numTime, 0).string;
    var thirtyDay = $date.format(new Date() - 31 * numTime, 0).string;

    //交易门店选择类型
    $scope.storeTypeList = [{storeType : "所有门店", value : "0"}, {storeType : "指定门店", value : "2"}, {storeType : "指定分组", value : "3"}];
    $scope.payTypeList = [{payType : "所有收款方式", value : "0"}, {payType : "刷卡", value : "1"}, {payType : "微信", value : "2"}, /*{payType : "微信（特约）", value : "3"},*/ {payType : "支付宝", value : "4"}, /*{payType : "支付宝（特约）", value : "5"}, */{payType : "钱盒钱包", value : "6"}, {payType : "现金", value : "9"}];

    //查询交易数据
    $scope.getTradeData = function(){
        $scope.queryParams.endDate = yesterday;
        if(!$scope.queryParams.startDate){
            $scope.queryParams.startDate = sevenDay;
        }
        if(!$scope.queryParams.visibleRange){
            $scope.queryParams.visibleRange = '0';
        }
        userInfo.get('analysis/trade/getHisData.json', $scope.queryParams, true).then(function(res){
           /* var res = {
                "code": "0",
                "message": "",
                "object": {
                    "date": ["20161115","20161116","20161117","20161118","20161119","20161120","20161121"],
                    "cardReceiveCount": ["100","580","650","960","70","200","450"],
                    "cardConsumeCount": ["600","250","300","100","790","980","90"]
                }
            }*/
            $scope.tradeObj = res.object;
            $scope.tradeObj.dateItem = initDateItem(res.object.date);
            $timeout(changeTradeType, 10);
        })
    }
    var changeTradeType = function(){
        if($scope.tradeType == '0'){
            $scope.trade.params = {
                item: $scope.tradeObj.dateItem,
                legend:['交易总额'],
                data:[$scope.tradeObj.totalAmt]
            }
        }else{
            $scope.trade.params = {
                item: $scope.tradeObj.dateItem,
                legend:['交易笔数'],
                data:[$scope.tradeObj.totalCount]
            }
        }
    }
    $scope.getTradeData();

    //查询会员卡数据
    var getMemberData = function(){
        $scope.memberParams.endDate = yesterday;
        if(!$scope.memberParams.startDate){
            $scope.memberParams.startDate = sevenDay;
        }
        userInfo.get('analysis/cards/getMembersData.json', $scope.memberParams, true).then(function(res){
            $scope.memberObj = res.object;
            $scope.memberObj.dateItem = initDateItem(res.object.date);
            $timeout(changeMemberType, 10);
        })
    }
    var changeMemberType = function(){
        if($scope.memberType == '0'){
            $scope.member.params = {
                item: $scope.memberObj.dateItem,
                legend:['新增会员'],
                data:[$scope.memberObj.newMemberCount]
            }
        }else{
            $scope.member.params = {
                item: $scope.memberObj.dateItem,
                legend:['会员使用次数'],
                data:[$scope.memberObj.memberUsedCount]
            }
        }
    }
    getMemberData();

    //查询优惠券数据
    var getCouponData = function(){
        $scope.couponParams.endDate = yesterday;
        if(!$scope.couponParams.startDate){
            $scope.couponParams.startDate = sevenDay;
        }
        userInfo.get('analysis/cards/getCardsData.json', $scope.couponParams, true).then(function(res){
            /*var res = {
                "code": "0",
                "message": "",
                "object": {
                    "date": ["20161115","20161116","20161117","20161118","20161119","20161120","20161121"],
                    "cardReceiveCount": ["100","580","650","960","70","200","450"],
                    "cardConsumeCount": ["600","250","300","100","790","980","90"]
                }
            }*/
            $scope.couponObj = res.object;
            $scope.couponObj.dateItem = initDateItem(res.object.date);
            $timeout(changeCouponType, 10);
        })
    }
    var changeCouponType = function(){
        if($scope.couponType == '0'){
            $scope.coupon.params = {
                item: $scope.couponObj.dateItem,
                legend:['领取量'],
                data:[$scope.couponObj.cardReceiveCount]
            }
        }else{
            $scope.coupon.params = {
                item: $scope.couponObj.dateItem,
                legend:['核销量'],
                data:[$scope.couponObj.cardConsumeCount]
            }
        }
    }
    getCouponData();

    var initDateItem = function(param){
        var itemArr = new Array();
        for(var i=0; i<param.length; i++){
            itemArr[i] = param[i].substr(4, 2) + '-' + param[i].substr(6, 2);
        }
        return itemArr;
    }

    $scope.changeType = function(type, category){
        switch(category){
            case 'trade':
                $scope.tradeType = type;
                changeTradeType();
                break;
            case 'member':
                $scope.memberType = type;
                changeMemberType();
                break;
            case 'coupon':
                $scope.couponType = type;
                changeCouponType();
                break;
        }
    }

    $scope.changeDate = function(type, category){
        switch(category){
            case 'trade':
                $scope.tradeDateType = type;
                if(type == '0'){
                    $scope.queryParams.startDate = sevenDay;
                }else if(type == '1'){
                    $scope.queryParams.startDate = thirtyDay;
                }
                $scope.getTradeData();
                break;
            case 'member':
                $scope.memberDateType = type;
                if(type == '0'){
                    $scope.memberParams.startDate = sevenDay;
                }else if(type == '1'){
                    $scope.memberParams.startDate = thirtyDay;
                }
                getMemberData();
                break;
            case 'coupon':
                $scope.couponDateType = type;
                if(type == '0'){
                    $scope.couponParams.startDate = sevenDay;
                }else if(type == '1'){
                    $scope.couponParams.startDate = thirtyDay;
                }
                getCouponData();
                break;
        }
    }

    //查询实时（当天）交易数据
    userInfo.get('analysis/trade/getRtData.json').then(function(res){
        /*res = {
            "code": "0",
            "message": "",
            "object": {
                "date": "20161121",
                "totalAmt": "25",
                "totalCount": "133"
            }
        }*/
        $scope.todayTotalAmt = res.object.totalAmt;
        $scope.todayTotalCount = res.object.totalCount;

    })

    //查询实时（昨日）交易数据
    userInfo.get('analysis/trade/getYesterdayData.json').then(function(res){
        $scope.yesTotalAmt = res.object.totalAmt;
        $scope.yesTotalCount = res.object.totalCount;

    })

    //优惠券核销率排行榜
    userInfo.get('analysis/cards/consume/getRateByCardType.json').then(function (res) {
        $scope.couponVerification = res.object.list;
    })

    //优惠券渠道核销率排行榜
    userInfo.get('analysis/cards/consume/getRateByChannel.json').then(function (res) {
        $scope.channelRate = res.object.list;
    })


    //查询卡券实时数据
    userInfo.get('analysis/cards/getRtData.json').then(function(res){
        $scope.RTData = res.object;

    })

    //切换选择指定门店or分组
    $scope.changeStoreType = function(type){
        if(type == '3'){
            //请求接口获取门店所有分组
            userInfo.get('/mchtGroup/listAll.json').then(function(res){
                $scope.groupList = res.object;
                if($scope.groupList.length < 1)
                    $scope.groupList.unshift({"groupId": "", "groupName": "暂无分组"});
            });
        }
        if(type != '2'){
            $scope.queryParams.mchtNo = '';
            $scope.queryParams.userId = '';
            $scope.queryParams.snNo = '';
        }
        if(type == '0'){
            $scope.getTradeData();
        }
    };
    $scope.changeStoreGroup = function(type){
        $scope.getTradeData();
    }

    //点击搜索sn号

    //带输入框的下拉列表 搜索函数-门店
    $scope.querySearch = function (text) {
        console.log(text, '值改变时')
        var deferred = $q.defer();
        if(text == null){
            deferred.resolve([]);
        }else{
            userInfo.get('mcht/listByName.json', {mchtName: text,mchtStatus:3}, true).then(function(res){
                if(res.object.length == '1'){//用户没点击选择框时，从这里赋值用户输入的mchtNo
                    $scope.queryParams.mchtNo = res.object[0].mchtNo;
                }else if(!res.object.length){//搜索不到门店时，清空mchtNo
                    $scope.queryParams.mchtNo = '';
                }
                deferred.resolve(res.object);
            })
        }
        return deferred.promise;
    }
    //带输入框的文字改变时的搜索函数-门店
    $scope.searchTextChange = function(text) {
        console.log(text, '删除时的值')
        if(!text){//清空输入框时，清空mchtNo
            $scope.queryParams.mchtNo = '';
        }
    }
    //带输入框的下拉列表点击函数-门店
    $scope.selectedItemChange = function(item) {
        console.log(item, '选择时的值')
        if(item){
            $scope.queryParams.mchtNo = item.mchtNo;
            $scope.getTradeData();
        }
    }

    //带输入框的下拉列表 搜索函数-收银员
    $scope.queryCashier = function (query) {
        console.log(query, '值改变时')
        if(query){
            var list = $scope.cashierList.filter( createFilterFor(query) );
            list.length == 1 ? $scope.queryParams.userId = list[0].userId : 0;
            return list;
        }else
            return $scope.cashierList;
    }
    //带输入框的文字改变时的搜索函数-收银员
    $scope.cashierTextChange = function (text) {
        console.log(text, '删除时的值')
        $scope.queryParams.userId = "";
    }
    //带输入框的下拉列表点击函数-收银员
    $scope.cashierItemChange = function (item) {
        console.log(item, '选择时的值')
        if(item){
            $scope.queryParams.userId = item.userId;
            $scope.getTradeData();
        }
    }
    //带输入框的下拉列表 过滤器
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }
    //品牌登录-帧听商户ID发生变化时，搜索收银员列表
    $scope.$watch('queryParams.mchtNo', function(current){
        if(current){
            userInfo.get('mchtUser/listByMchtNo.json', {mchtNo: current},true).then(function (res) {
                console.log('listByMchtNo.json');
                $scope.cashierList = res.object.list;
                if($scope.cashierList.length > 0){
                    $scope.cashierList.unshift({userId:0, userName:"所有收银员"});
                }
                $scope.cashierList.map( function (cashier) {
                    cashier.value = cashier.userName.toLowerCase();
                    return cashier;
                });

            })
        }else{
            $scope.cashierList = [];
            $scope.queryParams.userId = '';
        }
    });

    //门店登录执行
    getCashierList();
    //门店登录-本门店所有收银员
    function getCashierList(){
        var mchtNo;
        if(!($rootScope.powers && $rootScope.powers.length)){
            userInfo.getWigets().then(function(res){
                $rootScope.powers = res;
                ajaxCashier();
            })
        }else {
            ajaxCashier();
        }
    }
    function ajaxCashier(){
        if($rootScope.powers.indexOf('analysis.his_trade.list_store') < 0){
            if($rootScope.userInfo){
                mchtNo = $rootScope.userInfo.mchtNo;
                userInfo.get('mchtUser/listByMchtNo.json', {mchtNo: mchtNo},true).then(function (res) {
                    console.log('listByMchtNo.json');
                    $scope.cashierList = res.object.list;
                    if($scope.cashierList.length > 0){
                        $scope.cashierList.unshift({userId:0, userName:"所有收银员"});
                    }
                    $scope.cashierList.map( function (cashier) {
                        cashier.value = cashier.userName.toLowerCase();
                        return cashier;
                    });
                })
            }else{
                userInfo.getUser().then(function(res){
                    mchtNo = res.object.mchtNo;
                    userInfo.get('mchtUser/listByMchtNo.json', {mchtNo: mchtNo},true).then(function (res) {
                        console.log('listByMchtNo.json');
                        $scope.cashierList = res.object.list;
                        if($scope.cashierList.length > 0){
                            $scope.cashierList.unshift({userId:0, userName:"所有收银员"});
                        }
                        $scope.cashierList.map( function (cashier) {
                            cashier.value = cashier.userName.toLowerCase();
                            return cashier;
                        });
                    })
                })
            }
        }
    }

   /* //带输入框的下拉列表 搜索函数-sn
    $scope.querySn = function (query) {
        console.log(query, '值改变时')
        if(query){
            var list = $scope.snList.filter( createFilterForSn(query) );
            list.length == 1 ? $scope.queryParams.userId = list[0].userId : 0;
            return list;
        }else
            return $scope.snList;
    }
    //带输入框的文字改变时的搜索函数-sn
    $scope.snTextChange = function (text) {
        console.log(text, '删除时的值')
        $scope.queryParams.userId = "";
    }
    //带输入框的下拉列表点击函数-sn
    $scope.snItemChange = function (item) {
        console.log(item, '选择时的值')
        if(item){
            $scope.queryParams.userId = item.userId;
        }
    }
    //带输入框的下拉列表 过滤器
    function createFilterForSn(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            return (state.indexOf(lowercaseQuery) === 0);
        };
    }
    $scope.snList = ["77440322","77440323","77440326"];*/
});
