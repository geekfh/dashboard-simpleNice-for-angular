app.controller('coupons.create_f.controller', ['coupons.create.service', '$rootScope', '$alert', '$state', '$date', 'NgTableParams', '$scope', 'userInfo',function (Service, $rootScope, $alert, $state, $date, NgTableParams, $scope, userInfo) {
    
    var vm = this, User = $rootScope.User;    

    vm.today = new Date();
    vm.minDate = vm.today;
    vm.maxDate = new Date(+vm.today + 90*1000*24*3600);

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
    
    var data = userInfo.data || {};
    if(data.create){
        vm.create = data.create;
        vm.create.begin = new Date(vm.create.begin);
        vm.create.end = new Date(vm.create.end);
        vm.create.title = '';
        $scope.pic = data.pic;
    }else{
        vm.create = {};
        vm.create.color = {};
        vm.create.poiList = [];
        vm.create.adv1 = true;
        vm.create.adv2 = true;
        vm.create.adv3 = true;
        vm.create.title = '';

    }
    // 无门槛代金券 初始值
    vm.create.adv1 = true;
    vm.create.adv2 = true;
    vm.create.adv3 = true;

    //可用时段初始值
    vm.create.time = "all";

    if(data.coupon) vm.coupon = data.coupon;
    else {
        vm.coupon = {
            cardType: '',

            reduceCost: '', //代金券专用，表示减免金额

            giftName :'', //兑换兑换商品名字 ,限6个汉字   ,必填
            giftNum: '' ,//兑换券兑换商品数目 ,限三位数字 ,非必填
            giftUnit : '' ,//兑换券兑换商品的数量单位,限两个汉字 , 非必填
            gift : '', //兑换券类型时显示的礼品详情  (由前三个字段拼接而成)

            baseInfo: {
                codeType : 'CODE_TYPE_QRCODE' ,
                color: '' ,
                notice: '' , //操作提示
                description : '' , //卡券使用须
                dateInfoType : 'DATE_TYPE_FIX_TIME_RANGE' ,
                beginTimestamp : '' ,
                endTimestamp : '' ,
                locationIdList : '' ,
                getLimit : ''
            },

            advancedInfo:{
                useConditionTmp: {  //使用门槛(条件)字段
                    accept_category : '', //指定可用的商品类目，仅用于代金券类型，填入后将在券面拼写适用于xxx，标题自动拼为xxx减50元（若仅填入5个字），50元代金券（填入5个字以上）
                    reject_category: '' , //指定不可用的商品类目，仅用于代金券类型，填入后将在券面拼写不适用于xxx
                    least_cost : '', //满减门槛字段，可用于兑换券和代金券，填入后将在全面拼写消费满xx元可用，标题自动拼为满xx减xx/满xx送xx(giftName)
                    object_use_for : '' , //兑换券特有字段, 购买xx可用类型门槛，仅用于兑换，填入后自动拼写购买xxx可用，标题自动拼为买xx送xx(giftName)
                    can_use_with_other_discount : true //不可以与其他类型共享门槛，填写false时系统将在使用须知里拼写不可与其他优惠共享，默认为true
                },
                abstractJsonTmp: {
                    abstract : '',
                    icon_url_list : []
                },

                textImageListTmp: [],

                timeLimitTmp: [],
                // business_service : [] ,
                consumeShareSelfNum : '', // 核销后送券的数量, 仅支持数量1
                consumeShareCardListTmp:[]//核销后赠送其他卡券的列表，与consume_share_self_num字段互斥

            }
        };

    }


    // 卡券类型
    if($state.params.type){
        // 朋友券类型
        vm.create.type = $state.params.type;
        vm.coupon.cardType = getType($state.params.type);
        if(vm.create.type == 'CASH_F1'){
            vm.title = '新增无门槛代金券'
        }
        if(vm.create.type == 'CASH_F2'){
            vm.title = '新增有门槛代金券'
        }
        if(vm.coupon.cardType == 'GIFT'){
            vm.title = '新增兑换券'
        }
    }



    var times = [{ type: 'MONDAY'}, { type: 'TUESDAY'}, { type: 'WEDNESDAY'}, { type: 'THURSDAY'}, { type: 'FRIDAY'}, { type: 'SATURDAY'}, { type: 'SUNDAY'}];

    vm.create.time_limit = [{n: '一'}, {n: '二'}, {n: '三'}, {n: '四'}, {n: '五'}, {n: '六'}, {n: '日'} ];
    vm.dayArray = [];
    for(var i = 0; i<90; i++){
        vm.dayArray[i] = i+1;
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
    //监听卡券名称 --兑换券
    if(vm.coupon.cardType == 'GIFT'){
        $scope.$watch('vm.coupon.giftName',function(current){
            if(current)
                vm.create.title = '送' + current;
        });
        $scope.$watch('vm.create.need_money_goods',function(current){
            if(!current)
                vm.create.title = '送' + vm.coupon.giftName;
        });
        $scope.$watch('vm.create.least_cost',function(current){
            if(current){
                vm.create.title = '满' + current +'送' + vm.coupon.giftName;
            }
        });
        $scope.$watch('vm.coupon.advancedInfo.useConditionTmp.object_use_for',function(current){
            if(current){
                vm.create.title = '买' + current +'送' + vm.coupon.giftName;
            }
        });
    }
    //监听卡券名称 --无门槛代金券
    if(vm.create.type == 'CASH_F1'){
        $scope.$watch('vm.create.reduce_cost',function(current){
            if(current){
                vm.create.title =  current +'元代金券';
            }
        });
    }
    //监听卡券名称 --有门槛代金券
    if(vm.create.type == 'CASH_F2'){
        $scope.$watch('vm.create.reduce_cost',function(current){
            if(current){
                vm.create.title =  current +'元代金券';
            }
        });
        $scope.$watch('vm.create.need_money',function(current){
            if(current == false){
                if(vm.create.can_use){
                    vm.create.title =  vm.coupon.advancedInfo.useConditionTmp.accept_category +'减' + vm.create.reduce_cost + '元';
                }else{
                    vm.create.title =  vm.create.reduce_cost +'元代金券';
                }
            }else if(typeof current != 'undefined'){
                if(vm.create.least_cost){
                    if(vm.create.can_use){
                        vm.create.title =  vm.coupon.advancedInfo.useConditionTmp.accept_category +'满'+ vm.create.least_cost +'减' + vm.create.reduce_cost + '元';
                    }else{
                        vm.create.title =  '全场满'+ vm.create.least_cost +'减' + vm.create.reduce_cost + '元';
                    }
                }else{
                    if(vm.create.can_use){
                        vm.create.title =  vm.coupon.advancedInfo.useConditionTmp.accept_category +'减' + vm.create.reduce_cost + '元';
                    }else{
                        vm.create.title =  vm.create.reduce_cost +'元代金券';
                    }
                }
            }
        });
        $scope.$watch('vm.create.least_cost',function(current){
            if(current){
                if(vm.create.can_use){
                    vm.create.title = vm.coupon.advancedInfo.useConditionTmp.accept_category +'满'+ current +'减' + vm.create.reduce_cost + '元';
                }else{
                    vm.create.title = '全场满'+ current +'减' + vm.create.reduce_cost + '元';
                }

            }
        });
        $scope.$watch('vm.create.can_use',function(current){
            if(current == false){
                if(vm.create.need_money){
                    vm.create.title =  '全场满'+ vm.create.least_cost +'减' + vm.create.reduce_cost + '元';
                }else{
                    vm.create.title =  vm.create.reduce_cost +'元代金券';
                }
            }else if(typeof current != 'undefined'){
                if(vm.coupon.advancedInfo.useConditionTmp.accept_category){
                    if(vm.create.need_money && vm.create.least_cost){
                        vm.create.title = vm.coupon.advancedInfo.useConditionTmp.accept_category + '满'+ vm.create.least_cost +'减' + vm.create.reduce_cost + '元';
                    }else{
                        vm.create.title =  vm.coupon.advancedInfo.useConditionTmp.accept_category + '减' + vm.create.reduce_cost + '元';
                    }
                }else{
                    if(vm.create.need_money && vm.create.least_cost){
                        vm.create.title =  vm.coupon.advancedInfo.useConditionTmp.accept_category + '满'+ vm.create.least_cost +'减' + vm.create.reduce_cost + '元';
                    }else{
                        vm.create.title =  vm.coupon.advancedInfo.useConditionTmp.accept_category +'减' + vm.create.reduce_cost + '元';
                    }
                }
            }
        });
        $scope.$watch('vm.coupon.advancedInfo.useConditionTmp.accept_category',function(current){
            if(current){
                if(vm.create.need_money){
                    vm.create.title =  current + '满'+ vm.create.least_cost +'减' + vm.create.reduce_cost + '元';
                }else{
                    vm.create.title =  current + '减' + vm.create.reduce_cost + '元';
                }

            }
        });
    }

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


    //监听有效期
    vm.validity = {};
    $scope.$watch('vm.create.begin',function(begin){
        vm.validity.begin = begin ?  $date.format(begin).str : '';
        vm.coupon.baseInfo.beginTimestamp = vm.validity.begin;

    })
    $scope.$watch('vm.create.end',function(end){
        vm.validity.end = end ? $date.format(end).str : '';
        vm.coupon.baseInfo.endTimestamp = vm.validity.end;
    })

    // 上传图片
    vm.photos = data.photos || [];
    vm.addPhotos = function(){
        var index = vm.photos.length;
        if(index){
            if(!vm.photos[index-1].pic.qiniu_file_url || !vm.photos[index-1].text){
                $alert({msg: '请完善图文信息'});
                return;
            }
        }
        vm.photos.push({file: null, text: '', index: 'item'+index});
        vm.maxImg = vm.photos.length >= 10 ? true : false;

    };
    // 取消图片
    vm.delImg = function(item, index){
        vm.photos[index] = {file: null, text: item.text, index: item.index}
    };

    // 取消一组图文
    vm.delImgText = function(item, index){
        vm.photos.splice(index, 1);
        vm.maxImg = vm.photos.length >= 10 ? true : false;
    };


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
        if(!data.coupon){
            vm.create.need_money_goods = true;
            vm.create.money_goods = 'm';
        }
    }


    // 更改 兑换券条件
    vm.changeMoneyGoods = function(){
        if(vm.create.money_goods == 'm'){
            vm.coupon.advancedInfo.useConditionTmp.object_use_for = '';
        }else{
            vm.create.least_cost = '';
        }
    };


    // 提交数据
    vm.addCoupon = function(err, int){
        var flag = false;
        if(err){
            //vm.formError = 'form-error';
            vm.formError = true;
            //有效时段
            if(vm.create.time == "some"){
                for(var i=0,length = vm.create.time_limit.length; i<length; i++){
                    if(vm.create.time_limit[i].check){
                        flag = true;
                        if(flag) {
                            vm.create.time_limit_noday = !flag;
                            break;
                        }
                    }
                }
                if(!flag) return vm.create.time_limit_noday = !flag;

                if((vm.create.time_limit_begin && !vm.create.time_limit_end) || (!vm.create.time_limit_begin && vm.create.time_limit_end))
                    return vm.create.time_limit_notall = true;
            }
            return;

        }else{
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

        // 兑换券 使用条件判断
        if(vm.coupon.cardType == 'GIFT'){
            vm.create.gift_err = false;
            // 使用条件必须指定至少满减，指定商品，与其他优惠券共享之中的一项
            if(!vm.create.need_money_goods && !vm.coupon.advancedInfo.useConditionTmp.can_use_with_other_discount){
                return false;
            }

            if(vm.create.need_money_goods){
                if(!vm.create.least_cost && !vm.coupon.advancedInfo.useConditionTmp.object_use_for){
                    vm.create.gift_err = true;
                    return false;
                }

                if(vm.create.money_goods == 'm'){
                    vm.coupon.advancedInfo.useConditionTmp.least_cost = yuan2fen(vm.create.least_cost)
                }else {
                    vm.coupon.advancedInfo.useConditionTmp.least_cost = '';
                }
            }else{
                vm.create.least_cost = '';
                vm.coupon.advancedInfo.useConditionTmp.object_use_for = '';
            }
        }


        // 有门槛代金券  使用条件判断
        if(vm.create.type == 'CASH_F2'){
            vm.create.cash_canuse_err = false;

            if(!vm.create.need_money && !vm.coupon.advancedInfo.useConditionTmp.can_use_with_other_discount && !vm.create.can_use){
                return false;
            }
            if(!vm.create.need_money){
                vm.create.least_cost = '';
            }

            // 适用范围 (至少填写一项)
            if(vm.create.can_use){
                if(!vm.coupon.advancedInfo.useConditionTmp.accept_category && !vm.coupon.advancedInfo.useConditionTmp.reject_category){
                    vm.create.cash_canuse_err = true;
                    return false;
                }
            }else{
                vm.coupon.advancedInfo.useConditionTmp.accept_category = '';
                vm.coupon.advancedInfo.useConditionTmp.reject_category = '';
            }
        }


        // 无门槛代金券 使用条件判断 三个条件
        if(vm.create.type == 'CASH_F1'){
            if(!vm.create.adv1 || !vm.create.adv2 || !vm.create.adv3){
                return ;
            }else {
                vm.coupon.advancedInfo.useConditionTmp = { accept_category: '', reject_category: '', least_cost: '', object_use_for: '', can_use_with_other_discount: true }
            }
        }


        
        // 检查有效期
        if(!checkTime()) return;


        //拼接 gift 字段
        if(vm.coupon.giftName){
            vm.coupon.gift = vm.coupon.giftName + vm.coupon.giftNum + vm.coupon.giftUnit;
        }

        vm.coupon.advancedInfo.useConditionTmp.least_cost = yuan2fen(vm.create.least_cost) || '';
        vm.coupon.reduceCost = yuan2fen(vm.create.reduce_cost);

        // 判断 至少有一组图文
        var index = vm.photos.length;
        vm.create.text_image_isnone = false;
        if(index){
            vm.photos.forEach(function(it){
                if(!it.pic) return vm.create.text_image_isnone = true;
                if(!it.pic.qiniu_file_url || !it.text){
                    vm.create.text_image_isnone = true;
                    return;
                }
            });
            if(vm.create.text_image_isnone) return
        }else{
            vm.create.text_image_isnone = true;
            return;
        }

        // 时间段
        if(vm.create.time == 'all'){
            vm.coupon.advancedInfo.timeLimitTmp = times;
        }else if(vm.create.time == 'some'){
            vm.coupon.advancedInfo.timeLimitTmp = [];
            vm.create.time_limit.forEach(function(it,index){
               if(it.check){
                   if (vm.create.time_limit_begin && vm.create.time_limit_end) {
                       times[index].begin_hour = vm.create.time_limit_begin.split(':')[0];
                       times[index].begin_minute = vm.create.time_limit_begin.split(':')[1];
                       times[index].end_hour = vm.create.time_limit_end.split(':')[0];
                       times[index].end_minute = vm.create.time_limit_end.split(':')[1];
                   }
                   vm.coupon.advancedInfo.timeLimitTmp.push(times[index]);
               }
            });
        }




        vm.coupon.baseInfo.locationIdList = vm.create.poiRadio;

        vm.coupon.baseInfo.color = vm.create.color.cname;
        vm.coupon.baseInfo.brandName = User.brandName;

        vm.coupon.baseInfo.beginTimestamp = $date.format(vm.create.begin).str;
        vm.coupon.baseInfo.endTimestamp = $date.format(vm.create.end).str;
        //图片资源
        
        vm.coupon.advancedInfo.abstractJsonTmp.icon_url_list = [$scope.pic];

        //图文介绍
        if(vm.photos.length){
            vm.coupon.advancedInfo.textImageListTmp = [];
            vm.photos.forEach(function(it){
                vm.coupon.advancedInfo.textImageListTmp.push({
                    text: it.text,
                    image_url: it.pic.image_url,
                    qiniu_file_name: it.pic.qiniu_file_name,
                    qiniu_url: it.pic.qiniu_file_url
                })
            });
        }

        //下一步
        if(int == 1) {    
            var data = {coupon: vm.coupon, create: vm.create, photos: vm.photos, pic: $scope.pic, user:vm.user};
            userInfo.data = data;
            $state.go('coupons.create_f2', {type: $state.params.type});
            return;
        }
       

    };


    // 时间间隔 判断
    vm.checkTime = checkTime;

    function checkTime () {
        var today = new Date();
        if(vm.create.end && vm.create.begin){
            if(( $date.format(vm.create.end).time - $date.format(vm.create.begin).time) < 0){
                $alert({msg: '开始日期不能大于结束日期'});

                vm.begin = $date.format(today, -vm.day).time;
                vm.end = $date.format(today, -1).time;
                return false;
            }

            if(( $date.format(vm.create.end).time - $date.format(vm.create.begin).time)/1000/60/60/24 > 89){
                $alert({msg: '共享优惠券有效期不能超过90天'});

                vm.create.end = '';

                return false;
            }
        }
        return true;
    }


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
                            if(res.object.list){
                                vm.noData = false;
                                $defer.resolve(res.object.list);
                                params.total(res.object.totalRows);
                            }else{
                                vm.noData = res.msg || '暂无数据';
                                $defer.resolve([]);
                            }
                        }else{
                            vm.noData = res.msg || '暂无数据';
                            $defer.resolve([]);
                        }
                    });
                }
            }
        );

    };

    function yuan2fen(amt) {
        var num = isNaN(amt) ? 0 : Math.round(parseFloat(amt).toFixed(3) * 100);
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

}]);