
var app = angular.module('App', [
    'ui.router',
    'ngCookies',
    'ngTable',
    'ngMaterial',
    'ngMessages',
    'sidebar',

    'map',
    'poi.list',
    'poi.create',
    'poi.sublist'

    // 'coupons.list',
    // 'coupons.create',
    // 'coupons.report',
    // 'coupons.check',
    // 'coupons.coin',
    // 'coupons.provide',

    // 'clubcard.card',
    //'clubcard.member',
    //'clubcard.report'
]);

app.run(function($rootScope, $mdSidenav, $window, $state, User, $alert, $mdDialog, userInfo, tplUrl, NgTableParams, $parse, $location, ws) {
    window.ws = ws;
    //判断浏览器类型
    /*alert(ws.myBrowser());*/
   /* if(ws.myBrowser() != 'Chrome' && ws.myBrowser() != 'FF'){
        $rootScope.ifRightBrowser = true;
        $state.go('login');
    }*/
    /*console.log(ws.myBrowser(), '浏览器')*/
    if(ws.myBrowser().isUC || !(ws.myBrowser().isChrome || ws.myBrowser().isFiefox)){
        $rootScope.ifRightBrowser = true;
        $state.go('login');
    }
    // ws.parse = $parse;
    // ws.alert = $alert;
    // ws.mdDialog = $mdDialog;
    // ws.userInfo = userInfo;
    // ws.rootScope = $rootScope;
    // ws.state = $state;
    //
    // 常用文字集合

    $rootScope.err = {};
    $rootScope.err.mobile = '电话号码格式不正确';
    $rootScope.err.money = '人均价格必须为大于零的整数';
    $rootScope.err.business = '营业时间格式错误';
    $rootScope.err.empty = '不能为空';
    $rootScope.err.download = '下载失败请联系管理员';
    $rootScope.err.intCaseChinese = '只能输入中文、字母和数字';

    $rootScope.placeholder = {};
    $rootScope.placeholder.mobile = '固定电话须填写区号；区号、分机号均用“-”连接';
    $rootScope.placeholder.money = '大于零的整数，须如实填写，默认单位为元(人民币)';
    $rootScope.placeholder.business = '如，10:00-21:00';
    //end 常用文字集合
    //定义导航条的样式属性
    $rootScope.nav = {};
    $rootScope.powers = [];
    var $current = {};
    $rootScope.User = User;
    /*userInfo.getUser();*/

    // if(User.authStatus == 2){
    //     $current.title = '公众号授权';
    //     $state.go('app.open');
    // }
    //左侧菜单控制
    $rootScope.isSectionSelected = function(section) {
        return $current.name == section.href;
    };
    //选择门店
    $rootScope.$on('select.poi.start', function(eve, array){
        $rootScope.poiLists = angular.copy(array);
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/common/select_poi.html',
            controller: 'select.poi.controller'
        })
    });
    //选择优惠券
    $rootScope.$on('select.coupon.start', function(eve, coupon, type){
        $rootScope.lastSelectedCoupon = coupon;
        $rootScope.autoCouponType = type;
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + 'tpl/common/select_coupon.html',
            controller: 'select.coupon.controller'
        })
    })
   
    $rootScope.$on('$stateChangeSuccess', function(event, current){
        document.getElementById('mobile_view') ? document.getElementById('mobile_view').remove() : void 0;
        $rootScope.isEdit = false;
        $rootScope.needShow = false;
        $rootScope.nav = {};
        if(/list/.test(current.url) || /preview/.test(current.url)){
            userInfo.data = {};
        }
        if(/edit/.test(current.url)){
            $rootScope.isEdit = true;
        }
    });
    //展示详情
    $rootScope.$on('show.detail', function(eve, url, data, successCallBack){
        $mdDialog.show({
            clickOutsideToClose: true,
            templateUrl: tplUrl + url,
            controller: function($scope){
                $scope.close = function(){
                    $mdDialog.hide();    
                }
                $scope.confirm = function(){
                    if(typeof successCallBack == 'function'){
                        successCallBack.call(this);
                    }
                    $mdDialog.hide();
                }
                $scope.data = data;
            }
        })
    })
    function beforeUnload(e){
        var confirmationMessage = '确定离开此页吗？本页不需要刷新或后退';

        (e || window.event).returnValue = confirmationMessage;     // Gecko and Trident

        return confirmationMessage;                                // Gecko and WebKit
    }
    $rootScope.$on('$stateChangeStart', function(event, current){
        $current = $rootScope.$current = current;
        if(/\./.test(current.title)){
            $rootScope.titleArr = current.title.split('.');
            var arr = $rootScope.titleArr[0].split(',');
            $rootScope.titleObj = {title: arr[0], href: arr[1]};
            $rootScope.title = $rootScope.titleArr[1]
        }else{
            $rootScope.titleArr = []; 
            $rootScope.title = current.title;
        }
        if($current.name && $current.name.indexOf('clubcard.member.list') == -1){
            window.removeEventListener('beforeunload',beforeUnload,false)
        }

    });

    $rootScope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };

    $rootScope.$on('$viewContentLoaded', function(){
        var content = document.getElementsByClassName('scrollContent')[0];
        content.scrollTop = 0;
    });

    if($location.path() !== '/login'){
        userInfo.getWigets();
        userInfo.getUser();
        $rootScope.ifLogin = true;
    }

    $rootScope.$on('reloadWigets', function(){
        userInfo.getWigets();
    });

    $rootScope.$on('getUserInfo', function(){
        userInfo.getUser();
    })
    
   //点击遮罩层隐藏中心 
    $rootScope.isShowHelpcenter=function(){
   	var helpCenterHeader=document.getElementsByClassName('help-header');
   	var helpCenterBg=document.getElementById('helpCenterBg');
   	var helpCenter=document.getElementsByClassName('help-center');
   	var copyHeader=document.getElementById('copyHeader'); 
   	var helpcenterPos=document.getElementById('helpcenterPos');
	   	helpCenterBg.style.display="none";
		helpCenter[0].style.display="none";
		copyHeader.style.display="none";
		helpcenterPos.style.position="initial";

   	
   }


    
});
app.config(['$mdDateLocaleProvider', function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ];
    $mdDateLocaleProvider.shortMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ];
    $mdDateLocaleProvider.shortDays = ['日', '一', '二', '三', '四', '五', '六' ];
}]);

app.service('httpInterceptor', ['$rootScope',  function($rootScope){
    this.request = function(config){

        if(config.method == 'POST' || config.method == 'PUT'){
            $rootScope.submitingData = true;
        }
        return config;
    };

    this.responseError = function(response){
        $rootScope.submitingData = false;
        return response
    };
    this.response = function(response){
        if(response.data.code && response.data.code == -502){
            $rootScope.ifLogin = false;
            /*window.location.reload();*/
        }
        $rootScope.submitingData = false;
        return response;
    }
}]);




app.config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push('httpInterceptor');
}]);
var myStyle = document.createElement('style');
                    //白色按纽    
myStyle.innerHTML =   '.my-style{color: #666666 !important; background-color: #ffffff !important; box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.2) !important;}'
                    //红色按纽    
                    + '.my-shadow{box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.2) !important;}'
                    //上方文字
                    + '.flex .contentTitle{font-size: 16px; margin: 10px 0;}'
                    //选择框的下拉按纽左移
                    + '.md-select-value .md-select-icon:after{color: #666;}'
                    + '.md-select-value .md-select-icon:after{transform: scaleY(.7) scaleX(1); -webkit-transform: scaleY(.7) scaleX(1); left: -4px;}'
                    //暂时不清楚 
                    + '.md-datepicker-triangle-button .md-datepicker-expand-triangle{border-top-color: #666 !important}'
                    //没有数据的文字颜色
                    + '.no-data p{color: rgb(172, 172, 172);}'
                    //input输入框高度 圆角
                    + 'md-input-container input{height: 35px !important; border-radius: 2px !important;}'
                    + 'md-input-container{margin: 13px 0;}'
                    //button的高度 圆角 调整
                    + '.md-button.md-raised{background-color: #fff;}'
                    + '.md-button{margin: 11px 0 11px 10px; border-radius: 2px !important;}'  /*min-height: 35px; line-height: 35px; */
                    //+ '.md-button{min-height: 35px; line-height: 31px; margin: 11px 0 11px 10px; border-radius: 2px !important;}'
                    //tbody的:hover样式
                    + 'tbody tr:hover{background-color: #f9f9f9 !important;}'
                    //细线的颜色样式
                    + 'md-divider{border-top-color: #F0F0F0 !important;}'
                    //table边框
                    + 'table td{border-color: #F0F0F0 !important;}'
                    //input 左边距
                    + 'input{padding: 0 0 0 10px !important;}'
                    //分页组件 已用不上
                    + '.btn{border: 1px solid #f0f0f0; width: 35px; height: 35px; padding: 0; color: #666666;}'
                    + '.btn:hover, .btn:focus{border: 1px solid #f0f0f0; background-color: #f9f9f9;}'
                    //+ '.btn-default{color: #666666;}'
                    //分页组件 
                    +'.skip-btn a:hover{background-color:#eee !important;}'
                    + '.pagination>li>a{border: 1px solid #f0f0f0; min-width: 35px; height: 35px; color: #666666;}'                    
                    + '.pagination>li>a:focus{background-color:#eee !important;}'
                    + '.pagination>.active>a, .pagination>.active>a:hover{border: 1px solid #ff591c;}'                   
                    +'.pagination>li>a:hover,.pagination>li>span:hover{background-color:transparent;}'
                    + '.pagination>li:last-child>a, .pagination>li:last-child>span{border-radius: 2px !important;border: none !important; box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.2);padding:0;text-align:center;width:35px;height:35px; line-height:35px;}'
                    +'.pagination>li:first-child>a, .pagination>li:first-child>span{border-radius: 2px !important;border: none !important; box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.2);padding:0;text-align:center;width:35px;height:35px; line-height:35px;}'
                    +'.page-number{display:inline-block;margin-right:3px;vertical-align:top;}'                    
                    +'.page-next-i{background:url(http://7xogpz.com2.z0.glb.qiniucdn.com/friendCard__1477550522816.png) no-repeat;width:7px; height:12px;display:inline-block;}'
                    +'.disabled .page-next-i{background:url(http://7xogpz.com2.z0.glb.qiniucdn.com/friendCard__1477553481004.png) no-repeat;width:7px; height:12px;display:inline-block;}'
                    +'.page-prev-i{background:url(http://7xogpz.com2.z0.glb.qiniucdn.com/friendCard__1477552970116.png) no-repeat;width:7px; height:12px;display:inline-block;}' 
                    +'.disabled .page-prev-i{background:url(http://7xogpz.com2.z0.glb.qiniucdn.com/friendCard__1477553456137.png) no-repeat;width:7px; height:12px;display:inline-block;}'                    
                    +'.page-number .page-prev a.disabled,.page-number .page-next a.disabled{color:#e3e2e2;}'
                    +'.page-number .page-prev,.page-number .page-next{display:inline-block;height:35px; width:35px;text-align:center;line-height:35px; }'
                    +'.page-number .page-prev a ,.page-number .page-next a{width:100%;height:100%;border-radius:2px; box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.2);display:inline-block;background:#fff;color:#666;font-size:16px;}'
                    +'.page-number .page-current-total{display:inline-block; margin:0 10px;font-size:14px; color:#666;height:35px;line-height:35px;}'
                    +'.page-number .skip-num{display:inline-block;margin:0 10px 0 30px;color:#666;font-size:14px;}'
                    +'.page-number .skip-num input{width:52px; height:35px; border: solid 1px #f0f0f0;text-align:center; color:#666; font-size:14px;padding:0 !important;margin-right:6px;outline:none;}'
                    +'.page-number .skip-btn{display:inline-block;outline:none;}'
                    +'.page-number .skip-btn a{display:inline-block;width:60px; height:35px; line-height:35px; color:#666; font-size:14px; box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.2);background:#fff;text-align:center;text-decoration:none;}'                    
                        /*//分页组件
                    + '.pagination>li>a{border: 1px solid #f0f0f0; min-width: 35px; height: 35px; color: #666666;}'
                    + '.pagination>.active>a, .pagination>.active>a:hover{border: 1px solid #ff591c;}'
                    + '.pagination>.disabled>a, .pagination>.disabled>a:hover, .pagination>.disabled>a:focus, .pagination>li>a:hover{color: #acacac; min-width: 35px; height: 35px; border: 1px solid #f0f0f0;}'
*/
        //时间选择框组件
                    + '.md-datepicker-expand-triangle{border-top: 6px solid;}'
                    + 'md-datepicker{box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, .2); border-radius: 2px; background-color: #fff !important; padding-right:6px !important; border-bottom: 1px solid rgba(0,0,0,.12)}'
                    + 'md-datepicker .md-datepicker-input-container{border-bottom-width: 0}'
                    + 'md-datepicker button{height: 35px !important;}'
                    + '.md-button.md-icon-button{padding: 6px; margin: 0 5px 0 0;}'
                    //表格内按纽宽度问题
                    + 'td .md-button{min-width: 80px;}'
                    //清除边距
                    + '.margintop15{margin-top: 15px;}'
                    + '.marginright0{margin-right: 0 !important;}'
                    + '.marginleft0{margin-left: 0 !important;}'
                    + '.margintop0{margin-top: 0 !important;}'
                    + '.marginbottom0{margin-bottom: 0 !important;}'
                    + '.margin0{margin: 0 !important;}'
                    + '.marginleft15{margin-left: 15px !important;}'
                    + '.marginbottom15{margin-bottom: 15px !important;}'
                    + '.marginright15{margin-right: 15px !important;}'
                    + '.marginleft30{margin-left: 30px !important;}'
                    + '.marginbottom30{margin-bottom: 30px !important;}'
                    + '.marginright30{margin-right: 30px !important;}'
                    + '.margintop30{margin-top: 30px;}'
                    //普通输入框的间距问题
                    + 'md-input-container{margin-right: 10px;}'
                    //清除padding值
                    + '.row{padding: 0 !important;}'
                    //选择框禁用margin-bottom调整
                    + 'md-select[disabled] .md-select-value{margin-bottom: 0;}'
                    +'md-select-value{height:32px;}'
                    //内容页的table高度调整
                    + '.contentable>thead>tr>td,.contentable>tbody>tr>td{line-height: 44px !important; height: 44px !important; padding: 0 8px !important;}'
                    //h4的浮动和焦点设置
                    + '.floath4{float: left; margin:20px 48px 0 0 !important; font-size: 14px !important; cursor: pointer; padding-bottom: 10px; border-bottom: none;}'
                    + '.activeh4{border-bottom: 2px solid #ff0000; color: #ff591c;}'
                    //row 中文字的设置
                    + '.text-p{margin: 0 10px 0 0 !important; min-width: 60px; color: #666666; line-height: 55px;text-align:right;}'
                    //div的属性设置
                    + '.contantDiv{height: 47px; border-bottom: 1px solid #F0F0F0;}'
                    //我的按纽
                    + '.my-button{min-width: 0 !important; margin: 0 !important; min-height: 0 !important; padding: 0px 16px !important; }'/*padding: 2px 16px !important; max-height: 35px !important;*/
                    //左侧红色线条
                    + '.border-left{height: 14px; border-left: 2px solid #ff591c;}'
                    + '.border-left a{line-height: 14px; font-size: 14px; margin: 0 0 0 10px; padding: 0; text-decoration: underline;}'
                    //span文字
                    + '.span-text{line-height: 14px; font-size: 14px; margin: 0 0 0 10px; padding: 0;}'
                    //a 的active
                    + '.active{color: #fff !important; background-color: #ff591c !important;}'
                    + 'md-autocomplete,md-autocomplete-wrap,md-autocomplete input:not(.md-input){height: 35px !important;background-color:#fff !important;color:#666 !important;}'
                    + '.md-autocomplete-suggestions-container li:hover{background-color:#ff793a; color: #fff;}'
                    + '.md-autocomplete-suggestions-container li .highlight{color: #ff793a;}'
                    + '.md-autocomplete-suggestions-container li:hover .highlight{color: #ffffff;}'
                    //thead的高度调整
                    + '.table>thead>tr>td{line-height: 30px; height: 30px;padding-bottom:8px;color:#2b2b2b !important;}'
                    + '.myBoxShadow{box-shadow: 1px 1px 3px 0 rgba(0,0,0,.2) !important;}'
                    //md-autocomplete宽度调整
                    + 'md-autocomplete-wrap{with:100%}'
                    + '.pagination{margin: 0}'
                    + '.md-switch .md-bar{background-color: #e0e0e0 !important;}'
                    + '.md-switch.md-checked .md-bar{background-color: #ffac8e !important;}'
                    + '.md-switch.md-checked .md-thumb{background-color: #ff591c !important;}'
                    + 'md-input-container.md-input-invalid .md-input{border-color: #F5473C !important; border-bottom-width: 2px !important;}'
                    + 'md-input-container.md-input-invalid textarea.md-input{border-bottom-width: 1px !important;}'
                    + '.md-button[disabled],.md-button.md-raised[disabled]{color: #fff !important;}'
                    //下拉框选择的文本的字体颜色
                    +'md-select md-select-value span .md-text{color:#666 !important;}'
                    +'md-select-menu md-content md-option:first-child{background-color:#f8f8f8 !important;}'
                    +'md-select-menu md-content md-option:first-child:hover{background-color:#ff591c !important;}'
                    //文本下拉框滚动条颜色
                    +'md-progress-linear.md-default-theme .md-bar, md-progress-linear .md-bar{background-color:#ff591c}'
                    //滚动条容器颜色
                    +'md-progress-linear.md-default-theme .md-container, md-progress-linear .md-container{background-color:#fcd2cf}'
                    +'.ng-table-counts p{color:#666 !important}'
                    + '.md-datepicker-input-container.md-datepicker-focused{margin-left: -20px;}'
                    // + 'md-select-menu md-option[selected]{background-color: #ff591c !important; color: #fff !important;}'
                    //弹出框没有圆角
                    +'md-dialog.md-default-theme, md-dialog{border-radius:0px !important;}'
                    + '.md-datepicker-input{color: #666;} md-datepicker[disabled] .md-datepicker-input{color: #bbb;}'
                    //设置输入下拉框md-autocomplete 阴影和下边框颜色
                    +'.md-whiteframe-1dp, .md-whiteframe-z1{box-shadow: 1px 1.5px 3px 0 rgba(0,0,0,.2) !important;border-radius: 2px!important;}';
                    //+'.md-whiteframe-1dp, .md-whiteframe-z1 input {border-bottom: 1px solid rgba(0,0,0,0.12) !important;border-radius: 2px!important;}';
                    //虚线转实线
                    //+' md-input-container .md-input[disabled]{background-image: none;border-bottom: 1px solid #e5e5e5;}';
document.getElementsByTagName('head').item(0).appendChild(myStyle);

