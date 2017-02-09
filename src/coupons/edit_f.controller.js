app.controller('coupons.edit_f.controller', ['coupons.create.service', '$rootScope', '$alert', '$state', '$date', 'NgTableParams', '$scope', 'userInfo',function (Service, $rootScope, $alert, $state, $date, NgTableParams, $scope, userInfo) {
    
    var vm = this, User = $rootScope.User;    
    
    var data = {};
    vm.validity = {};
    //获取logo和商户名
    vm.user = {};
    userInfo.get('merchant/info').then(function(res){
        vm.user = res.object;
    });
    if(ws.isEmptyObj(userInfo.data)){
        userInfo.get('cards/' + $state.params.cid, {}).then(function(res){
            
            data = res.object;
            vm.coupon = data.card;
            //vm.coupon.advancedInfo.useConditionTmp.can_use_with_other_discount = true;
            vm.create = {};

            //图片          
            $scope.pic = vm.coupon.advancedInfo.abstractJsonTmp.icon_url_list[0];
            vm.photos = vm.coupon.advancedInfo.textImageListTmp;
            angular.forEach(vm.photos, function(it){
                it.pic = {};
                it.pic.image_url = it.image_url;
                it.pic.qiniu_file_name = it.qiniu_file_name;
                it.pic.qiniu_file_url = it.qiniu_file_url;
            })
            init()
        })
    }else{
        data = userInfo.data;
        vm.coupon = data.coupon;
        vm.create = data.create;
        vm.photos = data.photos;
        $scope.pic = data.pic;

        init()
    }
    function init(){    
        vm.create.color = {};
        vm.create.color.cvalue = vm.coupon.baseInfo.color;

        vm.create.begin_old = vm.create.begin_old || new Date(vm.coupon.baseInfo.beginTimestamp);
        vm.create.begin = new Date(vm.coupon.baseInfo.beginTimestamp);
        vm.validity.begin = $date.format(vm.create.begin).str;
        vm.create.end = new Date(vm.coupon.baseInfo.endTimestamp);
        vm.validity.end = $date.format(vm.create.end).str;
        vm.today = new Date();
        //vm.today = new Date($date.format(new Date()).str);
        if(+vm.create.begin_old - +vm.today > 1000*24*3600){
            //创建大于今天
            vm.need_disabled = false;
            vm.beginMinDate = vm.today;
            vm.beginMaxDate = vm.create.begin_old;

            vm.endMinDate = vm.today;
            vm.endMaxDate = new Date(+new Date(vm.today) + 90*1000*24*3600);
        }else{
            //创建小于今天
            vm.need_disabled = true;
            vm.endMinDate = vm.today;
            vm.endMaxDate = new Date(+new Date(vm.create.begin_old) + 90*1000*24*3600);
        }

        //vm.minDate = new Date(vm.coupon.baseInfo.beginTimestamp);
        //vm.maxDate = new Date(+vm.minDate + 90*1000*24*3600);
        //判断朋友的券类型  
        if(vm.coupon.cardType == 'CASH'){
            if(!vm.coupon.advancedInfo.useConditionTmp.accept_category && !vm.coupon.advancedInfo.useConditionTmp.least_cost
                && !vm.coupon.advancedInfo.useConditionTmp.object_use_for && !vm.coupon.advancedInfo.useConditionTmp.reject_category){
                // 无门槛代金券
                vm.create.type = 'CASH_F1';
                vm.create.adv1 = true;
                vm.create.adv2 = true;
                vm.create.adv3 = true;
                vm.title = '编辑无门槛代金券';
                vm.create.reduceCost = fen2yuan(vm.coupon.reduceCost);
            }else{
                // 有门槛代金券
                vm.create.reduceCost = fen2yuan(vm.coupon.reduceCost);
                vm.create.type = 'CASH_F2';
                vm.title = '编辑有门槛代金券';
                //vm.coupon.advancedInfo.useConditionTmp = {};
                //共享
                //vm.coupon.advancedInfo.useConditionTmp.can_use_with_other_discount = vm.coupon.advancedInfo.useConditionTmp.can_use_with_other_discount;
                //最低消费
                if(vm.coupon.advancedInfo.useConditionTmp.least_cost){
                    vm.create.need_money = 'm';
                    vm.create.least_cost = fen2yuan(vm.coupon.advancedInfo.useConditionTmp.least_cost);
                    
                }
                //适用范围
                if(vm.coupon.advancedInfo.useConditionTmp.accept_category || vm.coupon.advancedInfo.useConditionTmp.reject_category){
                    vm.create.can_use = true;
                    //vm.coupon.advancedInfo.useConditionTmp.accept_category = vm.coupon.advancedInfo.useConditionTmp.accept_category;
                    //vm.coupon.advancedInfo.useConditionTmp.reject_category = vm.coupon.advancedInfo.useConditionTmp.reject_category;
                }
            }
        }else{
            vm.create.type = 'GIFT';
            vm.title = '编辑兑换券'
            // vm.coupon.giftName = vm.coupon.giftName;
            // vm.coupon.giftNum = vm.coupon.giftNum;
            // vm.coupon.giftUnit = vm.coupon.giftUnit;
            //vm.coupon.advancedInfo.useConditionTmp = {};

            //vm.create.need_money_goods = vm.coupon.advancedInfo.useConditionTmp.can_use_with_other_discount;

            /*vm.coupon.advancedInfo.useConditionTmp.can_use_with_other_discount = vm.coupon.advancedInfo.useConditionTmp.can_use_with_other_discount;
            vm.coupon.giftNum = +vm.coupon.giftNum;
            vm.create.need_money_goods = true;
            if(vm.coupon.advancedInfo.useConditionTmp.least_cost){
                vm.create.least_cost = fen2yuan(vm.coupon.advancedInfo.useConditionTmp.least_cost);
                vm.create.money_goods = 'm';
                
            }else{
                vm.create.money_goods = 'g';
                vm.coupon.advancedInfo.useConditionTmp.object_use_for = vm.coupon.advancedInfo.useConditionTmp.object_use_for;
            }*/

            vm.coupon.giftNum = +vm.coupon.giftNum;
            //vm.create.need_money_goods = true;
            if(vm.coupon.advancedInfo.useConditionTmp.least_cost || vm.coupon.advancedInfo.useConditionTmp.object_use_for){
                vm.create.need_money_goods = true;
                if(vm.coupon.advancedInfo.useConditionTmp.least_cost){
                    vm.create.least_cost = fen2yuan(vm.coupon.advancedInfo.useConditionTmp.least_cost);
                    vm.create.money_goods = 'm';
                }else {
                    vm.create.money_goods = 'g';
                }

            }

        }    
        
        
        var times = [{ type: 'MONDAY'}, { type: 'TUESDAY'}, { type: 'WEDNESDAY'}, { type: 'THURSDAY'}, { type: 'FRIDAY'}, { type: 'SATURDAY'}, { type: 'SUNDAY'}];
        vm.create.time_limit = [{n: '一'}, {n: '二'}, {n: '三'}, {n: '四'}, {n: '五'}, {n: '六'}, {n: '日'} ];
        if(vm.coupon.advancedInfo.timeLimitTmp.length == 7){
            vm.create.time = 'all';
        }else{
            vm.create.time = 'some';
            angular.forEach(vm.coupon.advancedInfo.timeLimitTmp, function(it){
                var int = ws.indexOf(it.type, times, 'type');
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

        vm.addPhotos = function(){
            var index = vm.photos.length;
            if(index){
                if(!vm.photos[index-1].pic.qiniu_file_url || !vm.photos[index-1].text){
                    $alert({msg: '请完善图文信息'});
                    return;
                }
            }
            vm.photos.push({qiniu_file_url: null, text: '', index: 'item'+index});
            vm.maxImg = vm.photos.length >= 10 ? true : false;

        };

        // 取消一组图文
        vm.delImgText = function(item, index){
            vm.photos.splice(index, 1);
            vm.maxImg = vm.photos.length >= 10 ? true : false;
        };
        
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
            // 检查有效期
            if(!checkTime()) return;
            if(!$scope.pic.qiniu_file_url) return ws.alert('请上传封面图片');
            //var obj = {};
            var obj = vm.coupon;
            obj.cardId = $state.params.cid;
            /*obj.baseInfo = {};
            obj.advancedInfo = {};*/
            // 兑换券 使用条件判断
            if(vm.coupon.cardType == 'GIFT'){
                //obj.advancedInfo.useConditionTmp = {};
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
                        obj.advancedInfo.useConditionTmp.least_cost = yuan2fen(vm.create.least_cost);
                        obj.advancedInfo.useConditionTmp.object_use_for = "";
                    }else {
                        obj.advancedInfo.useConditionTmp.object_use_for = vm.coupon.advancedInfo.useConditionTmp.object_use_for;
                        obj.advancedInfo.useConditionTmp.least_cost = '';
                    }
                }else{
                    //vm.create.least_cost = '';
                    obj.advancedInfo.useConditionTmp.least_cost = '';
                    obj.advancedInfo.useConditionTmp.object_use_for = '';
                }
                obj.gift = vm.coupon.gift;
                obj.giftName = vm.coupon.giftName;
                obj.giftNum = vm.coupon.giftNum;
                obj.giftUnit = vm.coupon.giftUnit;
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
                    //obj.advancedInfo.useConditionTmp = obj.advancedInfo.useConditionTmp || {};
                    obj.advancedInfo.useConditionTmp.accept_category = '';
                    obj.advancedInfo.useConditionTmp.reject_category = '';
                }
            }
            

            // 无门槛代金券 使用条件判断 三个条件
            if(vm.create.type == 'CASH_F1'){
                if(!vm.create.adv1 || !vm.create.adv2 || !vm.create.adv3){
                    return ;
                }else {
                    obj.advancedInfo.useConditionTmp = { accept_category: '', reject_category: '', least_cost: '', object_use_for: '', can_use_with_other_discount: true }
                }
            }
           
            //拼接 gift 字段
            
            // obj.gift = vm.coupon.gift;
            // obj.giftName = vm.coupon.giftName;
            // obj.giftNum = vm.coupon.giftNum;
            // obj.giftUnit = vm.coupon.giftUnit;

            

            if(obj.giftName){
                obj.gift = obj.giftName + obj.giftNum + obj.giftUnit;
            }

            // 判断 至少有一组图文
            var index = vm.photos.length;
            vm.create.text_image_isnone = false;
            if(index){
                vm.photos.forEach(function(it){
                    if(!it.pic.qiniu_file_url || !it.text){
                        return vm.create.text_image_isnone = true;

                    }
                });
                if(vm.create.text_image_isnone) return;
            }else{
                vm.create.text_image_isnone = true;
                return;
            }

            // 时间段
            if(vm.create.time == 'all'){
                obj.advancedInfo.timeLimitTmp = times;
            }else if(vm.create.time == 'some'){
                obj.advancedInfo.timeLimitTmp = [];
                vm.create.time_limit.forEach(function(it,index){
                   if(it.check){
                       //obj.advancedInfo.timeLimitTmp.push(times[index]);
                       if (vm.create.time_limit_begin && vm.create.time_limit_end) {
                           times[index].begin_hour = vm.create.time_limit_begin.split(':')[0];
                           times[index].begin_minute = vm.create.time_limit_begin.split(':')[1];
                           times[index].end_hour = vm.create.time_limit_end.split(':')[0];
                           times[index].end_minute = vm.create.time_limit_end.split(':')[1];
                       }
                       obj.advancedInfo.timeLimitTmp.push(times[index]);

                   }
                });
            }


            if(vm.create.color.cname) obj.baseInfo.color = vm.create.color.cname;
            obj.baseInfo.brandName = User.brandName;

            obj.baseInfo.beginTimestamp = $date.format(vm.create.begin).str;
            obj.baseInfo.endTimestamp = $date.format(vm.create.end).str;
            vm.coupon.baseInfo.beginTimestamp = $date.format(vm.create.begin).str;
            vm.coupon.baseInfo.endTimestamp = $date.format(vm.create.end).str;
            //封面图片和介绍
            //obj.advancedInfo.abstractJsonTmp = {};
            obj.advancedInfo.abstractJsonTmp.abstract = vm.coupon.advancedInfo.abstractJsonTmp.abstract;
            

            obj.advancedInfo.abstractJsonTmp.icon_url_list = [$scope.pic];
            //图文介绍
            if(vm.photos.length){
                obj.advancedInfo.textImageListTmp = [];
                angular.forEach(vm.photos, function(it, i){
                    obj.advancedInfo.textImageListTmp[i] = {};
                    obj.advancedInfo.textImageListTmp[i].image_url = it.pic.image_url;
                    obj.advancedInfo.textImageListTmp[i].qiniu_file_url = it.pic.qiniu_file_url;
                    obj.advancedInfo.textImageListTmp[i].qiniu_file_name = it.pic.qiniu_file_name;
                    obj.advancedInfo.textImageListTmp[i].text = it.text;
                });
            }

            //卡券类型
            obj.cardType = vm.coupon.cardType;
            //下一步
            if(int == 1) {
                userInfo.data = {coupon: vm.coupon, create: vm.create, photos: vm.photos, obj: obj, pic: $scope.pic, user:vm.user};
                $state.go('coupons.edit_f2', {cid: vm.coupon.advancedInfo.cardId});
            }
        };


        // 时间间隔 判断
        vm.checkTime = checkTime;

        function checkTime () {
            var today = new Date();
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
            return true;
        }
        
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
    $scope.$watch('vm.create.begin',function(begin){
        vm.validity.begin = begin ?  $date.format(begin).str : '';
    })
    $scope.$watch('vm.create.end',function(end){
        vm.validity.end = end ? $date.format(end).str : '';
    })
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
    
    // 更改 兑换券条件
    vm.changeMoneyGoods = function(){
        if(vm.create.money_goods == 'm'){
            vm.coupon.advancedInfo.useConditionTmp.object_use_for = '';
        }else{
            vm.create.least_cost = '';
        }
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