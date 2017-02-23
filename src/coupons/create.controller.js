app.controller('coupons.create.controller', ['coupons.create.service', '$rootScope', '$mdDialog', '$alert', '$state', '$date', '$scope', 'userInfo', function (Service, $rootScope, $mdDialog, $alert, $state, $date, $scope, userInfo) {

    var vm = this, isEdit, data;

    //有效时段
    var times = [{ type: 'MONDAY'}, { type: 'TUESDAY'}, { type: 'WEDNESDAY'}, { type: 'THURSDAY'}, { type: 'FRIDAY'}, { type: 'SATURDAY'}, { type: 'SUNDAY'}];
    //有效期
    vm.validity = {};
    vm.dayArray = [];
    for(var i = 0; i<90; i++){
        vm.dayArray[i] = i+1;
    }

    //获取logo和商户名
    vm.user = {};
    vm.pic = {};
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
    });


    
    if($rootScope.isEdit){
        isEdit = true;
        userInfo.get('cards/searchList.json').then(function(res){
            data = res.object;
            init();
        });

        function init(){
            vm.coupon = data.card;
            vm.create = {};

            vm.create.leastCost = fen2yuan(vm.coupon.leastCost);
            vm.create.reduceCost = fen2yuan(vm.coupon.reduceCost) || 1;
            
            vm.create.color = {};
            vm.create.color.cvalue = vm.coupon.baseInfo.color;
            $scope.poiLists = [];
            if(vm.coupon.baseInfo.locationIdList == 'allPoi'){
                vm.create.poiRadio = 'allPoi';
            }
            if(/\[/.test(vm.coupon.baseInfo.locationIdList)){
                $scope.ids = ws.wipe(vm.coupon.baseInfo.locationIdList).split(',');
                vm.create.poiRadio = 'myPoi';
                var url= 'poi/store/ids?ids=';
                angular.forEach($scope.ids, function(it, i){
                    url += it.trim() + ',';
                })
                url = url.replace(/\,$/, '');
                userInfo.get(url).then(function(res){
                    $scope.poiLists = res.object;
                })
            }
            //有效期
            vm.validity.begin = vm.coupon.baseInfo.beginTimestamp;
            vm.validity.end = vm.coupon.baseInfo.endTimestamp;
            vm.coupon.baseInfo.fixedTerm = vm.coupon.baseInfo.fixedTerm || 30;
            vm.coupon.baseInfo.fixedBeginTerm = vm.coupon.baseInfo.fixedBeginTerm || 0;
            if(vm.coupon.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TIME_RANGE'){
                vm.create.begin = new Date(vm.coupon.baseInfo.beginTimestamp);
                vm.create.end = new Date(vm.coupon.baseInfo.endTimestamp);
                vm.today = new Date();
                //vm.today = new Date($date.format(new Date()).str);

                if(+vm.create.begin - +vm.today > 1000*24*3600){
                    //创建大于今天
                    vm.need_disabled = false;
                    vm.beginMinDate = vm.today;
                    vm.beginMaxDate = vm.create.begin;

                    vm.endMinDate = vm.today;
                    vm.endMaxDate = new Date(+new Date(vm.today) + 90*1000*24*3600);
                }else{
                    //创建小于今天
                    vm.need_disabled = true;
                    vm.endMinDate = vm.today;
                    vm.endMaxDate = new Date(+new Date(vm.create.begin) + 90*1000*24*3600);
                }
            }
            if(vm.coupon.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TERM'){
                vm.today = $date.format(new Date(), 0).time;
                if(vm.coupon.baseInfo.fixedBeginTerm == 0){
                    vm.beginMinDate = vm.endMinDate = vm.today;
                    vm.beginMaxDate = vm.endMaxDate = new Date(+vm.today + 90*1000*24*3600);
                }else{
                    vm.beginMinDate = vm.today;
                    vm.beginMaxDate = new Date(+vm.today + vm.coupon.baseInfo.fixedBeginTerm*1000*24*3600);

                    vm.endMinDate = vm.today;
                    vm.endMaxDate = new Date(+new Date(vm.today) + 90*1000*24*3600);
                }

            }

            //可用时段
            vm.create.time_limit = [{n: '一'}, {n: '二'}, {n: '三'}, {n: '四'}, {n: '五'}, {n: '六'}, {n: '日'} ];
            if(vm.coupon.advancedInfo.timeLimitTmp){
                if(vm.coupon.advancedInfo.timeLimitTmp.length == 7 && !(vm.coupon.advancedInfo.timeLimitTmp[0].begin_hour)){
                    vm.create.time = 'all';
                }else{
                    vm.create.time = 'some';
                    angular.forEach(vm.coupon.advancedInfo.timeLimitTmp, function(it){
                        var int = ws.indexOf(it.type, times, 'type')
                        if(int !== false){
                            vm.create.time_limit[int].check = true;
                            if(!vm.create.time_limit_begin && !vm.create.time_limit_end){
                                if(it.begin_hour || it.begin_minute || it.end_hour || it.end_minute){
                                    vm.create.time_limit_begin = Service.formatHm(it.begin_hour) + ':' + Service.formatHm(it.begin_minute);
                                    vm.create.time_limit_end = Service.formatHm(it.end_hour) + ':' + Service.formatHm(it.end_minute);
                                    vm.create.show_time_limit_stamp = true;
                                }
                            }

                        }

                    })
                }
            }
        }
        
    }else{
        vm.today = $date.format(new Date(), 0).time;
        vm.beginMinDate = vm.endMinDate = vm.today;
        vm.beginMaxDate = vm.endMaxDate = new Date(+vm.today + 90*1000*24*3600);
        //vm.minDate = $date.format(new Date(), 1).time;

        vm.coupon = {
            defaultDetail: '', //(优惠券字段) 优惠说明
            cardType: '',
            baseInfo: {
                title: '', //卡券标题
                subTitle: '', //(可选) //卡券副标题
                logoUrl: '', //卡券logo在微信服务器的访问地址
                codeType: 'CODE_TYPE_QRCODE',
                color: '', //卡券颜色名称, 如: "Color010"
                brandName: '', //卡券商户名称
                notice: '', //卡券操作用提示
                description: '', //卡券使用须知
                quantity: '', //卡券库存量
                dateInfoType: 'DATE_TYPE_FIX_TIME_RANGE',
                fixedTerm : 30,    //默认30天内有效
                fixedBeginTerm : 0,  //默认当天生效
                //beginTimestamp: '', // 日期格式 "yyyy/MM/dd" ,卡券启用时间
                //endTimestamp: '', //日期格式 "yyyy/MM/dd" ,卡券使用截止时间
                getLimit: '' //每人可领券的数量限制,默认一张
                //location_id_list: '',
                //canGiveFriend: '1',
                //canShare: '1'
            },
            advancedInfo:{
                timeLimitTmp: []   //可用时段
            }
        };

        //创建微信优惠券时添加canGiveFriend、canShare两个字段
        if(vm.user){
            if(vm.user.weixinType == 1 && vm.user.authStatus == 1){
                vm.coupon.baseInfo.canGiveFriend = '1';
                vm.coupon.baseInfo.canShare = '1';
            }
        }else{
            userInfo.get('mcht/info.json').then(function(res){
                vm.user = res.object;
                if(vm.user.weixinType == 1 && vm.user.authStatus == 1){
                    vm.coupon.baseInfo.canGiveFriend = '1';
                    vm.coupon.baseInfo.canShare = '1';
                }
            });
        }
        vm.create = {};
        vm.create.time_limit = [{n: '一'}, {n: '二'}, {n: '三'}, {n: '四'}, {n: '五'}, {n: '六'}, {n: '日'} ];
        vm.create.time = "all";
        vm.create.color = {};
        vm.create.poiList = [];
        // 默认门店 无门店限制
        $scope.poiLists = [];
        //默认选择所有门店通用
        vm.create.poiRadio = 'allPoi';
    }

    // 时间间隔 判断
    vm.checkTime = function checkTime() {
        if(vm.create.end && vm.create.begin){
            if(( $date.format(vm.create.end).time - $date.format(vm.create.begin).time) < 0){
                $alert({msg: '开始日期不能大于结束日期'});
                return false;
            }
        }
        return true;
    }


    //删除可用时间段
    $scope.delTimeLimit = function(){
        vm.create.time_limit_begin = '';
        vm.create.time_limit_end = '';
        vm.create.show_time_limit_stamp = false;
    };
    //监听可用时段
    $scope.$watch('vm.create.time_limit_begin',function(current){
        selectTimeLimit(current);
    });
    $scope.$watch('vm.create.time_limit_end',function(current){
       selectTimeLimit(current);
    });

    //监听有效期
    $scope.$watch('vm.coupon.baseInfo.dateInfoType',function(current){

        if(current == 'DATE_TYPE_FIX_TIME_RANGE'){
            vm.validity = {};
            $scope.$watch('vm.create.begin',function(begin){
                vm.validity.begin = begin ?  $date.format(begin).str : '';
            })
            $scope.$watch('vm.create.end',function(end){
                vm.validity.end = end ? $date.format(end).str : '';
            })
        }
        if(current == 'DATE_TYPE_FIX_TERM'){
            vm.validity = {};
            $scope.$watch('vm.coupon.baseInfo.fixedBeginTerm',function(beginTerm){
                vm.validity.begin = $date.format(new Date(),parseInt(beginTerm) ).str;
            });
            $scope.$watch('vm.coupon.baseInfo.fixedTerm',function(Term){
                vm.validity.end = $date.format(new Date(), (parseInt(vm.coupon.baseInfo.fixedBeginTerm) + parseInt(Term))).str;
            })
        }
    });


    function selectTimeLimit(current){
        if(current){
            var flag = false;
            for(var i=0,length = vm.create.time_limit.length; i<length; i++){
                if(vm.create.time_limit[i].check){
                    flag = true;
                    break;
                }
            };
            if(!flag) return ws.alert({msg:'请先选择日期！'});
            /*if(type == 'begin')
                /^(0\d{1}|1\d{1}|2[0-3]):([0-5]\d{1})$/.test(current) ? vm.create.time_limit_error1 = false : vm.create.time_limit_error1 = true;
            if(type == 'end')
                /^(0\d{1}|1\d{1}|2[0-3]):([0-5]\d{1})$/.test(current) ? vm.create.time_limit_error2 = false : vm.create.time_limit_error2 = true;*/
            /^(0\d{0,}|1\d{1}|2[0-3]|[0-9]):([0-5]\d{1})$/.test(current) ? vm.create.time_limit_error1 = false : vm.create.time_limit_error1 = true;
            if(vm.create.time_limit_error1) return;

            if (vm.create.time_limit_begin && vm.create.time_limit_end) {
                var begin_hour = parseInt(vm.create.time_limit_begin.split(':')[0]);
                var begin_minute = parseInt(vm.create.time_limit_begin.split(':')[1]);
                var end_hour = parseInt(vm.create.time_limit_end.split(':')[0]);
                var end_minute = parseInt(vm.create.time_limit_end.split(':')[1]);
                vm.create.time_limit_error2 = begin_hour > end_hour;
                if(!vm.create.time_limit_error2){
                    vm.create.time_limit_error2 = (begin_hour == end_hour && begin_minute > end_minute) || (begin_hour == end_hour && begin_minute == end_minute);
                }
            }
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
        vm.coupon.cardType = $state.params.type;
    }

    vm.addCoupon = function(err) {
        var flag = false;
        if (err) {
            //vm.formError = 'form-error';
            vm.formError = true;
            //有效时段
            if(vm.create.time == "some"){
                for(var i=0,length = vm.create.time_limit.length; i<length; i++){
                    if(vm.create.time_limit[i].check){
                        flag = true;
                        if(flag){
                            vm.create.time_limit_noday = !flag;
                            break;
                        }
                    }
                }
                if(!flag) return vm.create.time_limit_noday = !flag;
                if((vm.create.time_limit_begin && !vm.create.time_limit_end) || (!vm.create.time_limit_begin && vm.create.time_limit_end))
                    return vm.create.time_limit_notall = true;
            }
            //有效期
            if(vm.coupon.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TIME_RANGE'){
                if(!vm.create.begin || !vm.create.end) return vm.create.show_date_tip = true;
                //if(!vm.create.end) return vm.create.show_date_tip_end = true;

                if(( $date.format(vm.create.end).time - $date.format(vm.create.begin).time) > 10 * 365 *24 * 60* 60 * 1000){
                    return vm.create.show_date_tip_period = true;
                }

            }
            return;
        } else {
            //vm.formError = '';
            vm.formError = false;
        }
        //有效时段
        if(vm.create.time == "some"){
            for(var j=0,length1 = vm.create.time_limit.length; j<length1; j++){
                if(vm.create.time_limit[j].check){
                    flag = true;
                    if(flag){
                        vm.create.time_limit_noday = !flag;
                        break;
                    }
                }
            }
            if(!flag) return vm.create.time_limit_noday = !flag;
            if((vm.create.time_limit_begin && !vm.create.time_limit_end) || (!vm.create.time_limit_begin && vm.create.time_limit_end))
                return vm.create.time_limit_notall = true;
            //时间格式输入错误
            if(vm.create.time_limit_error1 || vm.create.time_limit_error2) return;

        }
        //有效期
        if(vm.coupon.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TIME_RANGE'){
            if(!vm.create.begin || !vm.create.end) return vm.create.show_date_tip = true;
            //if(!vm.create.end) return vm.create.show_date_tip_end = true;

            if(( $date.format(vm.create.end).time - $date.format(vm.create.begin).time) > 10 * 365 *24 * 60* 60 * 1000){
                return vm.create.show_date_tip_period = true;
            }

        }
        if ( !vm.create.poiRadio || vm.create.poiRadio == 'myPoi' && !$scope.poiLists.length) {
            return ws.alert({msg: '请选择门店'});
        }
        //检查有效期
        if(!vm.checkTime()) return;

        vm.submiting = true;
        // 代金券
        if (vm.coupon.cardType == 'CASH') {
            vm.coupon.leastCost = yuan2fen(vm.create.leastCost);
            vm.coupon.reduceCost = yuan2fen(vm.create.reduceCost);
        }
        //编辑
        if (isEdit) {
            var obj = {};
            if(data) obj = data.card;
            //obj.baseInfo = {};
            //obj.advancedInfo = {};
            obj.defaultDetail = vm.coupon.defaultDetail;
            obj.cardId = vm.coupon.baseInfo.cardId;
            obj.cardType = vm.coupon.cardType;
            obj.advancedInfo.cardId = vm.coupon.baseInfo.cardId;
            obj.baseInfo.cardId = vm.coupon.baseInfo.cardId;
            obj.baseInfo.title = vm.coupon.baseInfo.title;
            //obj.baseInfo.subTitle = vm.coupon.baseInfo.subTitle;
            //obj.baseInfo.logoUrl = vm.coupon.baseInfo.logoUrl;
            //obj.baseInfo.codeType = vm.coupon.baseInfo.codeType;
            if(vm.create.color.cname) obj.baseInfo.color = vm.create.color.cname;
            //obj.baseInfo.brandName = vm.coupon.baseInfo.brandName;
            obj.baseInfo.notice = vm.coupon.baseInfo.notice;
            obj.baseInfo.description = vm.coupon.baseInfo.description;
            obj.baseInfo.quantity = vm.coupon.baseInfo.quantity;
            obj.baseInfo.dateInfoType = vm.coupon.baseInfo.dateInfoType;
            obj.baseInfo.getLimit = vm.coupon.baseInfo.getLimit || 1;
            obj.baseInfo.canGiveFriend = vm.coupon.baseInfo.canGiveFriend;
            obj.baseInfo.canShare = vm.coupon.baseInfo.canShare;
            //return;
            if (vm.create.poiRadio == 'myPoi') {
                $scope.ids = [];
                angular.forEach($scope.poiLists, function (it, i) {
                    $scope.ids.push(it.merchantNo)
                })
                obj.baseInfo.locationIdList = $scope.ids.join(',');
            } else {
                obj.baseInfo.locationIdList = vm.create.poiRadio;
            }
            //有效期
            if (vm.coupon.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TIME_RANGE') {
                obj.baseInfo.dateInfoType = 'DATE_TYPE_FIX_TIME_RANGE';
                obj.baseInfo.beginTimestamp = $date.format(vm.create.begin).str;
                obj.baseInfo.endTimestamp = $date.format(vm.create.end).str;
            } else if (vm.coupon.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TERM') {
                obj.baseInfo.dateInfoType = 'DATE_TYPE_FIX_TERM';
                obj.baseInfo.fixedTerm = parseInt(vm.coupon.baseInfo.fixedTerm);
                obj.baseInfo.fixedBeginTerm = parseInt(vm.coupon.baseInfo.fixedBeginTerm);
            }

            //可用时段
            if (vm.create.time) {
                if (vm.create.time == "all") {
                    obj.advancedInfo.timeLimitTmp = times;
                } else if (vm.create.time == "some") {
                    obj.advancedInfo.timeLimitTmp = [];
                    vm.create.time_limit.forEach(function (it, index) {
                        if(it.check) {
                            if (vm.create.time_limit_begin && vm.create.time_limit_end) {
                                times[index].begin_hour = parseInt(vm.create.time_limit_begin.split(':')[0]);
                                times[index].begin_minute = parseInt(vm.create.time_limit_begin.split(':')[1]);
                                times[index].end_hour = parseInt(vm.create.time_limit_end.split(':')[0]);
                                times[index].end_minute = parseInt(vm.create.time_limit_end.split(':')[1]);
                            }
                            obj.advancedInfo.timeLimitTmp.push(times[index]);
                        }
                    });
                }
            }

        } else {
            //适用门店
            if (vm.create.poiRadio == 'myPoi') {
                $scope.ids = [];
                angular.forEach($scope.poiLists, function (it, i) {
                    $scope.ids.push(it.merchantNo)
                })
                vm.coupon.baseInfo.locationIdList = $scope.ids.join(',');
            } else {
                vm.coupon.baseInfo.locationIdList = vm.create.poiRadio;
            }

            vm.coupon.baseInfo.color = vm.create.color.cname;
            //商户名称第一次创建优惠券时取input的值，非第一次创建从vm.user中取
            vm.coupon.baseInfo.brandName = vm.create.brandName;
            vm.coupon.baseInfo.logoUrl = vm.pic.qiniu_file_url;

            vm.coupon.baseInfo.getLimit = vm.coupon.baseInfo.getLimit || 1;


            //有效期
            if (vm.coupon.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TIME_RANGE') {
                vm.coupon.baseInfo.beginTimestamp = $date.format(vm.create.begin).str;
                vm.coupon.baseInfo.endTimestamp = $date.format(vm.create.end).str;
            } else if (vm.coupon.baseInfo.dateInfoType == 'DATE_TYPE_FIX_TERM') {
                vm.coupon.baseInfo.fixedTerm = parseInt(vm.coupon.baseInfo.fixedTerm);
                vm.coupon.baseInfo.fixedBeginTerm = parseInt(vm.coupon.baseInfo.fixedBeginTerm);
            }

            //可用时段
            if (vm.create.time) {
                if (vm.create.time == "all") {
                    vm.coupon.advancedInfo.timeLimitTmp = times;
                } else if (vm.create.time == "some") {
                    vm.coupon.advancedInfo.timeLimitTmp = [];
                    vm.create.time_limit.forEach(function (it, index) {
                        if (it.check) {
                            if (vm.create.time_limit_begin && vm.create.time_limit_end) {
                                times[index].begin_hour = parseInt(vm.create.time_limit_begin.split(':')[0]);
                                times[index].begin_minute = parseInt(vm.create.time_limit_begin.split(':')[1]);
                                times[index].end_hour = parseInt(vm.create.time_limit_end.split(':')[0]) ;
                                times[index].end_minute = parseInt(vm.create.time_limit_end.split(':')[1]);
                            }
                            vm.coupon.advancedInfo.timeLimitTmp.push(times[index]);
                        }
                    });
                }
            }
        }


        if(vm.coupon.baseInfo.cardId && vm.coupon.baseInfo.id){
            
            Service.modifyCoupon(obj).then(function(res){
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
        }

        Service.addCoupon(vm.coupon).then(function(res){
            console.log(vm.coupon);
            vm.submiting = false;
            if(res.code == 0){
                $alert({msg: '创建成功'});
                $state.go('coupons.list')
            }else if(res.code == '40140'){
                $alert({msg: '商户授权状态无效'});
            }else if(res.code == '45040'){
                $alert({msg: '当月创建卡券数量已达到上限'});
            }else {
                $alert({msg: res.msg || '创建失败，请重试'});
            }
        });
    };


    function yuan2fen(amt) {
        var num = Math.round(parseFloat(amt).toFixed(3) * 100);
        return parseInt(num,10);
    }
    function fen2yuan(num) {
        return Number(num)/100
    }

    vm.initPos = function(){
        setTimeout(function(){
            var content = document.getElementsByClassName('scrollContent')[0];
            var mobileView = document.getElementsByClassName('suspension-wrap')[0];
            mobileView.style.top = '104px';
            content.onscroll = function(){
                var sTop = content.scrollTop;
                if(sTop < 104 - 65) mobileView.style.top = (104 - sTop) + 'px';
                else mobileView.style.top = '85px';
            }
        }, 100)
    }


    vm.stateGoBack = function(){
        window.history.back();
    }


}]).filter('cardType', function(){
    return function(type){
        var typeArr = {
            GENERAL_COUPON: '优惠',
            general_coupon: '优惠',
            GROUPON: '团购',
            DISCOUNT: '折扣',
            CASH: '代金',
            GIFT: '兑换'
        };
        return typeArr[type];
    }
}).filter('cardTips', function(){
    return function(type){
        var tips = {
            GENERAL_COUPON: '建议填写商家名、卡券服务内容，描述卡券提供的具体优惠',
            GROUPON: '建议填写团购券提供的服务或商品名称，对应金额，描述卡券提供的具体优惠',
            DISCOUNT: '建议填写折扣券“折扣额度”及自定义内容，描述卡券提供的具体优惠',

            CASH: '建议填写代金券“减免金额”及自定义内容，描述卡券提供的具体优惠',
            GIFT: '建议填写兑换券提供的服务或礼品名称，描述卡券提供的具体优惠'
        };
        return tips[type]
    }
})
.filter("formatHm", function(){      //格式化小时和分钟数据
    return function(hm){
        hm = hm + '';
        return hm = hm.length == 1 ? '0' + hm : hm;
    }
});

function getType(type) {
    var types = {
        GENERAL_COUPON: 'GENERAL_COUPON',
        GROUPON: 'GROUPON',
        DISCOUNT: 'DISCOUNT',

        CASH: 'CASH',
        GIFT: 'GIFT',

        CASH_F1: 'CASH',
        CASH_F2: 'CASH',
        GIFT_F: 'GIFT'
    };

    return types[type];
}