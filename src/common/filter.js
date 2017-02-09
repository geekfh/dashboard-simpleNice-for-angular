app.filter('wxChatAction', function(){
    return function(int){
        switch(int){
            case 1:
                return '消息与菜单权限集';
            break;
            case 2:
                return '用户管理权限集';
            break;
            case 3:
                return '账号管理权限集';
            break;
            case 4:
                return '网页授权权限集';
            break;
            case 5:
                return '微信小店权限集';
            break;
            case 6:
                return '多客服权限集';
            break;
            case 7:
                return '业务通知权限集';
            break;
            case 8:
                return '微信卡券权限集';
            break;
            case 9:
                return '微信扫一扫权限集';
            break;
            case 10:
                return '微信连WIFI权限集';
            break;
            case 11:
                return '素材管理权限集';
            break;
            case 12:
                return '摇一摇周边权限集';
            break;
            case 13:
                return '微信门店权限集';
            break;
        }
    }
});

app.filter('wxChatOpen',function(){
   return function(item){
       switch (item){
           case 'open_store':
               return '微信门店功能';
           break;
           case 'open_scan':
               return '微信扫商品功能';
               break;
           case 'open_pay':
               return '微信支付功能';
               break;
           case 'open_card':
               return '微信卡券功能';
               break;
           case 'open_shake':
               return '微信摇一摇功能';
               break;
       }
   }
});
app.filter('verifyTypeInfo', function(){
    return function(int){
        switch(int){
            case -1:
                return '未认证';
            break;
            case 0:
                return '微信认证';
            break;
            case 1:
                return '新浪微博认证';
            break;
            case 2:
                return '腾讯微博认证';
            break;
            case 3:
                return '已资质认证通过但还未通过名称认证';
            break;
            case 4:
                return '已资质认证通过、还未通过名称认证，但通过了新浪微博认证';
            break;
            case 5:
                return '已资质认证通过、还未通过名称认证，但通过了腾讯微博认证';
            break;
        }
    }
});
app.filter('serviceTypeInfo', function(){
    return function(int){
        switch(int){
            case 0:
                return '订阅号';
            break;
            case 1:
                return '由历史老账号升级后的订阅号';
            break;
            case 2:
                return '服务号';
            break;
        }
    }
});
app.filter('weixinType', function(){
    return function(int){
        switch(int){
            case '1':
                return '已认证';
            break;
            case '2':
                return '未认证';
            break;
        }
    }
});
app.filter('cardType', function(){
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
});
app.filter('cardStatus', function(){
    var statuses = {
        CARD_STATUS_NOT_VERIFY:'待审核',
        CARD_STATUS_VERIFY_FAIL:'审核失败',
        CARD_STATUS_VERIFY_OK:'通过审核',
        CARD_STATUS_USER_DELETE:'已删除',
        CARD_STATUS_EXPIRED: '已过期',
        CARD_STATUS_DELETE:'已删除'
    };

    return function(status){
        return statuses[status];
    };
})
.filter('fields', function(){
    var fieldsArr =  {
        USER_FORM_INFO_FLAG_NAME: '姓名',
        USER_FORM_INFO_FLAG_SEX: '性别',
        USER_FORM_INFO_FLAG_BIRTHDAY: '生日',
        USER_FORM_INFO_FLAG_IDCARD: '身份证',

        USER_FORM_INFO_FLAG_MOBILE:  '手机号',
        USER_FORM_INFO_FLAG_EMAIL: '邮箱',
        USER_FORM_INFO_FLAG_DETAIL_LOCATION: '详细地址',

        USER_FORM_INFO_FLAG_EDUCATION_BACKGROUND: '学历',
        USER_FORM_INFO_FLAG_CAREER: '职业',
        USER_FORM_INFO_FLAG_INDUSTRY: '行业',
        USER_FORM_INFO_FLAG_INCOME: '收入',

        USER_FORM_INFO_FLAG_HABIT: '兴趣爱好'
    };
    return function(field){
        return fieldsArr[field];
    };
})
.filter('custom_zh_index', function(){
    // 自定义入口  中文序号
    var arr = ['一', '二', '三'];
    return function (index){
        return arr[index];
    }
});
app.filter('mchtStatus', function(){
    return function(val){
        switch(val){
            case '0':
                return '正常';
            break;
            case '1':
                return '商户新增保存';
            break;
            case '2':
                return '提交待审核';
            break;
            case '3':
                return '商户停用';
            break;
            case '4':
                return '商户注销';
            break;
            case '5':
                return '拒绝待修改';
            break;
        }
    }
});
app.filter('roleAuthority', function(){
    return function(val){
        switch(val){
            case '0':
                return '收银员';
            break;
            case '1':
                return '门店管理员';
            break;
            case '2':
                return '品牌管理员';
            break;
        }
    }
});
app.filter('staffStatus', function(){
    return function(val){
        switch(val){
            case '0':
                return '正常';
            break;
            case '1':
                return '停用';
            break;
            case '2':
                return '注销';
            break;
        }
    }
});
app.filter('price', function(){
    return function (val, int) {
      if (!val) return '0.00';
      if (int === undefined) int = 2;
      if (typeof val === 'number') val = val.toString();
      if (val.length > int) {
        return val.substr(0, val.length - int) + '.' + val.substr(val.length - int, val.length - 1);
      } else {
        if (val.length === int) {
          return '0.' + val;
        } else {
          var count = int - val.length, str = '0.';
          for (var i = 0; i < count; i++) {
            str += '0';
          }
          return str + val;
        }
      }
    };
});
app.filter('poiFilter', function(){
    return function(status){
        return ['系统错误', '正在审核', '审核通过', '审核驳回'][status-1];
    }
});
app.filter('poiFilterMsg', function(){
    return function(status){
        return ['系统错误', '已提交至微信审核中，预计5个工作日内完成', '生效', '审核驳回'][status-1];
    }
});
//转化数字
app.filter('simplifiedDigital', function(){
    return function(number){
        //以元为单位，忽略小数点后
        var intNum = parseInt(number);
        if(!intNum){
            return number;
        }
        var length = (Math.abs(intNum) + '').length;
        switch(length){
            case 1:
                return intNum;
                break;
            case 2:
                return intNum;
                break;
            case 3:
                return intNum;
                break;
            case 4:
                return (intNum/1000) + '千';
                break;
            case 5:
            case 6:
            case 7:
            case 8:
                return (intNum/10000) + '万';
                break;
            case 9:
            case 10:
            case 11:
            case 12:
                return (intNum/100000000) + '亿';
                break;


        }
    }
});
//格式化金额,输入金额的单位：元
app.filter("formatMoney", function(){
    return function(money, int){
        if(!money) return "￥0.00";
        if(typeof money === "number") money = money.toString();
        if (int === undefined) int = 3;
        if(money.indexOf('.') > -1) money = money.substr(0,money.indexOf('.'));
        var f = function format(money){
            if(money.length > int){
                return format(money.substr(0, money.length-int)) + "," + money.substr(money.length-int);
            }
            else
                return "￥" + money;
        };
        return  f(money) +　".00";
    }
});
app.filter('MstatusFilter', function(){
    return function(status){
        switch (status) {
            case 'UNAVAILABLE':
                return '已失效';
            case 'UNACTIVE':
                return '未激活';
            case 'NORMAL':
                return '正常';
            case 'EXPIRE':
                return '已过期';
            case 'GIFT_SUCC':
            case 'DELETE':
                return '已删除';
        }

    }
});
app.filter('fieldFilter', function(){
    return function(field){

        switch (field) {
            case 'USER_FORM_INFO_FLAG_NAME':
                return '姓名';
            case 'USER_FORM_INFO_FLAG_IDCARD':
                return '身份证';
            case 'USER_FORM_INFO_FLAG_BIRTHDAY':
                return '生日';
            case 'USER_FORM_INFO_FLAG_MOBILE':
                return '手机号';
            case 'USER_FORM_INFO_FLAG_EMAIL':
                return '邮箱';


            case 'USER_FORM_INFO_FLAG_CAREER':
                return '职业';
            case 'USER_FORM_INFO_FLAG_EDUCATION_BACKGROUND':
                return '教育背景';
            case 'USER_FORM_INFO_FLAG_INDUSTRY':
                return '行业';
            case 'USER_FORM_INFO_FLAG_INCOME':
                return '收入';


            case 'USER_FORM_INFO_FLAG_HABIT':
                return '兴趣爱好';
            case 'USER_FORM_INFO_FLAG_DETAIL_LOCATION':
                return '详细地址';
            default:
                return field;
        }
    }
});

//支付方式
app.filter("paymentMethod", function(){
    return function(payment){
        switch (payment){
            case '200':
                return '所有方式';
            break;
            case '201':
                return '刷卡';
            break;
            case '202':
                return '微信支付';
                break;
            case '203':
                return '支付宝支付';
                break;
            case '204':
                return '现金';
            break;
            case '205':
                return '电子现金';
                break;
            case '206':
                return '钱盒钱包';
                break;
            default:
                return '其他';
        }
    }
});
//支付管理的支付方式
app.filter("payMgrMethod", function(){
    return function(payment){
        switch (payment){
            case '1':
                return '刷卡支付';
                break;
            case '2':
                return '微信支付';
                break;
            case '3':
                return '支付宝支付';
                break;
            case '4':
                return '现金支付';
                break;
        }
    }
});
//结算方式
app.filter("settleTypeFilter", function(){
    return function(payment){
        switch (payment){
            case '1':
                return 'T0';
                break;
            case '2':
                return 'S0';
                break;
        }
    }
});

//交易状态
/*app.filter("tradStatus", function(){
    return function(status){
        switch(status){
            case '0':
                return '成功';
            break;
           /!* case '1':
                return '请求';
            break;*!/
            case '2':
                return '已冲正';
            break;
            case '3':
                return '已撤销';
            break;
            case '4':
                return '失败';
            break;
           /!* case '5':
                return '部分退货';
                break;
            case '6':
                return '全额退货';
                break;*!/
            case '7':
                return '交易异常';
                break;


        }
    }
});*/
//交易状态-账务
app.filter("tradStatus", function(){
    return function(status){
        switch(status){
            case '0':
                return '成功';
            break;
            case '1':
                return '失败';
            break;
            case '2':
                return '已撤销';
            break;
            case '3':
                return '已冲正';
            break;
            case '4':
                return '余额查询';
            break;
           case '5':
                return '所有状态';
                break;
           case '6':
                return '异常交易';
                break;
           case '7':
                return '请求';
                break;
        }
    }
});
//交易状态-储值卡消费记录 交易状态，-1：未支付0：交易失败，1：交易成功，2：结果未知
app.filter("tradStatusCard", function(){
    return function(status){
        switch(status){
            case '-1':
                return '未支付';
                break;
            case '0':
                return '失败';
                break;
            case '1':
                return '成功';
                break;
            case '2':
                return '结果未知';
                break;
        }
    }
});
//储值记录、账务 交易类型
app.filter("tradeType",function(){
    return function(type){
        switch(type){
            case 0:
            case '0':
                return '所有类型';
                break;
            case 1 :
            case '1':
                return '余额查询';
                break;
            case 2:
            case '2':
                return '消费';
                break;
            case 3:
            case '3':
                return '消费冲正';
                break;
            case 4:
            case '4':
                return '消费撤销';
                break;
            case 5:
            case '5':
                return '消费撤销冲正';
                break;
            case 6:
            case '6':
                return '退货';
                break;
        }
    }
});
//储值记录-卡类型
app.filter("cardType",function(){
    return function(type){
        switch(type){
            case 1:
                return '借记卡';
            break;
            case 2:
                return '贷记卡';
            break;
        }
    }
});


//结算周期
app.filter("settlementCycle", function(){
    return function(cycle){
        cycle = parseInt(cycle);
        switch(cycle){
            case 0 | 0.0:
                return 'T+0';
                break;
            case 1 | 1.0:
                return 'T+1';
                break;
            case 2 | 2.0:
                return 'S+0';
                break;
            case 3 | 3.0:
                return '所有结算周期';
                break;
        }
    }
});
//异常原因
app.filter("errReson", function(){
    return function(cycle){
        cycle = parseInt(cycle);
        switch(cycle){
            case 1:
                return '对账不平';
                break;
            case 2:
                return '风控拦截延迟清算';
                break;
            case 3:
                return '手工延迟清算';
                break;
            case 4:
                return '商户不正常延迟清算';
                break;
            case 5:
                return '商户信息不全';
                break;
        }
    }
});
//结算详情 处理结果
app.filter("treatResult", function(){
    return function(cycle){
        cycle = parseInt(cycle);
        switch(cycle){
            case 0:
                return '参入清算后并已清分';
                break;
            case 1:
                return '处理后参加清算';
                break;
            case 2:
                return '手工处理退货';
                break;
            case 3:
                return '手工处理请款';
                break;
            case 4:
                return '手工处理挂账';
                break;
            case 5:
                return '手动退货';
                break;
            case 6:
                return '补账处理';
                break;
            case 7:
                return '退单';
                break;
            case 8:
                return '交易取消';
                break;
            case 9:
                return '未处理';
                break;
        }
    }
});
//结算详情 交易类型
app.filter("txTypeMap", function(){
    return function(cycle){
        cycle = parseInt(cycle);
        switch(cycle){
            case 200:
                return '所有';
                break;
            case 201:
                return '刷卡';
                break;
            case 202:
                return '微信支付';
                break;
            case 203:
                return '支付宝';
                break;
            default:
                return '其他';
                break;
        }
    }
});
app.filter('filTime', function(){
    return function(val){
        return val.replace(/\//g, '-');
    }
})
app.filter('splitting', function(){
    return function(val, int, string){
        if(!val) return '';
        int = int || 4;
        string = string || ' ';
        var reg = new RegExp("(?=(?!\\b)(\\w{"+int+"})+$)", "g");
        return val.replace(reg, string);
    }
})
app.filter('myLimit', function(){
    return function(val, int){
        if(val == 0) return 0;
        if(!val) return '';
        var total = int * 2;
        var chineseLength = 0;
        if(/[\u2E80-\u9FFF]/.test(val)){
            chineseLength = val.match(/[\u2E80-\u9FFF]/g).length;
        }
        var totalLength = chineseLength + val.length; //得到总字符的个数
        if(totalLength > total){
            var str = '';
            var ii = 0;
            for(var i in val){
                if(/[\u2E80-\u9FFF]/.test(val[i])){
                    ii += 2;
                }else{
                    ii += 1;
                }
                if(ii > total){
                    break;
                }else{
                    str += val[i];
                }
            }
            str += '...';
            return str;
        }else{
            return val;
        }
    }
})



































