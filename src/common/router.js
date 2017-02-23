angular.module('App').config(['$stateProvider', '$urlRouterProvider', 'tplUrl', function ($stateProvider, $urlRouterProvider, tplUrl) {

    $urlRouterProvider.when('', '/index');
    $urlRouterProvider.otherwise('/index');

    // 用户登录
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: tplUrl + 'tpl/login/login.html',
        controller: 'loginController'
    });

    // APP
    $stateProvider.state('app', {
        url: '',
        templateUrl:  tplUrl + 'tpl/common/content.html'
    })
        // 默认首页
        .state('app.home', {
            url: '/index',
            templateUrl:  tplUrl + 'tpl/common/index.html',
            title: '首页'
        });

    //经营分析
    $stateProvider.state('analysis', {
        url: '/analysis',
        templateUrl: tplUrl + 'tpl/common/content.html'
    })
        // 经营概况
        .state('analysis.overview', {
            url: '/overview',
            templateUrl: tplUrl + 'tpl/analysis/overview.html',
            controller: 'overviewController',
            title: '经营概况',
            from: 'analysis'
        });

    //帐务查询
    $stateProvider.state('accounts', {
        url: '/accounts',
        from: 'accounts',
        templateUrl: tplUrl + 'tpl/common/content.html'
    })
        .state('accounts.balance', {
            url: '/balance',
            from: 'accounts',
            template: '<div ui-view></div>'
        })

        // 账务查询/结算记录
        .state('accounts.balance.list', {
            url: '/list',
            templateUrl: tplUrl + 'tpl/accounts/balance/list.html',
            controller: 'balanceController',
            title: '账务查询.结算记录'
        })

        // 账务查询/结算记录/结算详情
        .state('accounts.balance.detail', {
            url: '/detail/:settleDate/:mchtNo/:mchtName/:ifFailed/:chaCode/:settleMcht/:mchtTraceNo',
            templateUrl: tplUrl + 'tpl/accounts/balance/detail.html',
            controller: 'balanceDetailController',
            title: '结算记录,#/accounts/balance/list.结算详情'
        })

        .state('accounts.details', {
            url: '/details',
            from: 'accounts',
            template: '<div ui-view></div>'
        })
        .state('accounts.details.list', {
            url: '/list',
            templateUrl: tplUrl + 'tpl/accounts/details/list.html',
            controller: 'detailsController',
            title: '账务查询.对账明细'
        })
        .state('accounts.download', {
            url: '/download',
            from: 'accounts',
            template: '<div ui-view></div>'
        })
        .state('accounts.download.list', {
            url: '/list',
            templateUrl: tplUrl + 'tpl/accounts/download/list.html',
            controller: 'downloadController',
            title: '账单下载'
        })
        .state('accounts.flow', {
            url: '/flow',
            template: '<div ui-view></div>',
            from : '/accounts'
        })
        .state('accounts.flow.list', {
            url: '/list',
            templateUrl: tplUrl + 'tpl/accounts/flow/list.html',
            controller: 'flowController',
            title: '账务查询.交易流水'
        });

    //门店       
    $stateProvider.state('poi', {
            url: '/poi',
            templateUrl: tplUrl + 'tpl/common/content.html'
        })
        .state('poi.list', {
            url: '/list',
            templateUrl: tplUrl + 'tpl/poi/list.html',
            controller: 'poi.list.controller',
            title: '门店管理',
            from: 'poi'
        })
        .state('poi.sublist', {
            url: '/sublist',
            templateUrl: tplUrl + 'tpl/poi/sublist.html',
            controller: 'poi.sublist.controller',
            title: '门店管理',
            from: 'poi'
        })
        .state('poi.create', {
            url: '/create/:id',
            params: {poi: {}},
            templateUrl: tplUrl + 'tpl/poi/create.html',
            controller: 'poi.create.controller',
            controllerAs: 'vm',
            /*title: '绑定门店'*/
            title: '门店管理,#/poi/list.绑定门店'
        })
        .state('poi.detail', {
            url: '/detail/:id',
            templateUrl: tplUrl + 'tpl/poi/detail.html',
            controller: 'poi.detail.controller',
            controllerAs: 'vm',
            title: '门店管理,#/poi/list.详情'
        })
        .state('poi.subdetail', {
            url: '/subdetail/:id',
            templateUrl: tplUrl + 'tpl/poi/detail.html',
            controller: 'poi.detail.controller',
            controllerAs: 'vm',
            title: '门店管理,#/poi/sublist.详情'
        });
    //员工    
    $stateProvider.state('staff', {
            url: '/staff',
            templateUrl: tplUrl + 'tpl/common/content.html'
        })
        .state('staff.list', {
            url: '/list',
            templateUrl: tplUrl + 'tpl/staff/list.html',
            controller: 'staffController',
            title: '员工管理',
            from: 'staff'
        })
        .state('staff.detail', {
            url: '/detail/:id/:searchText/:mchtNo',
            templateUrl: tplUrl + 'tpl/staff/detail.html',
            controller: 'detailController',
            /*title: '员工详情',*/
            title: '员工管理,#/staff/list.员工详情',
            from: 'staff'
        })

    $stateProvider.state('clubcard', {
            url: '/clubcard',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/common/content.html'
        })
        .state('clubcard.card', {
            url: '/card',
            from: 'clubcard',
            template: '<div ui-view class="relative"></div>'
        })

        /**
         * 预览
         */
        .state('clubcard.card.preview', {
            url: '/preview',
            templateUrl:  tplUrl + 'tpl/clubcard/card/preview.html',
            from: 'clubcard',
            title: '会员卡管理',
            controller: 'card.preview.controller',
            controllerAs: 'vm'
        })
        .state('clubcard.card.create1', {
            url: '/create/1',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/card/create_1.html',
            controller: 'card.create1.controller',
            controllerAs: 'vm',
            resolve: {
                cardDetail: function(){
                    return {};
                }
            },
            title: ' 创建会员卡'
        })
        .state('clubcard.card.create2', {
            url: '/create/2',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/card/create_2.html',
            controller: 'card.create2.controller',
            controllerAs: 'vm',
            title: ' 创建会员卡'
        })
        .state('clubcard.card.create3', {
            url: '/create/3',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/card/create_3.html',
            controller: 'card.create3.controller',
            controllerAs: 'vm',
            title: ' 创建会员卡'
        })
        .state('clubcard.card.create4', {
            url: '/create/4',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/card/create_4.html',
            controller: 'card.create4.controller',
            controllerAs: 'vm',
            title: ' 创建会员卡'
        })
        .state('clubcard.card.edit1', {
            url: '/edit_1/:id',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/card/create_1.html',
            controller: 'card.create1.controller',
            resolve: {
                cardDetail:function(userInfo, $q){
                    var deferred = $q.defer();
                    userInfo.get('memberCards').then(function(res){
                        if(res.object && res.object.list){
                            deferred.resolve(res.object.list[0].card);
                        }
                    })
                    return deferred.promise;
                }
            },
            controllerAs: 'vm',
            /*title: ' 修改会员卡'*/
            title: '会员卡管理,#/clubcard/card/preview.修改会员卡'
        })
        .state('clubcard.card.edit2', {
            url: '/edit_2/:id',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/card/create_2.html',
            controller: 'card.create2.controller',
            controllerAs: 'vm',
           /* title: ' 修改会员卡'*/
            title: '会员卡管理,#/clubcard/card/preview.修改会员卡'
        })
        .state('clubcard.card.edit3', {
            url: '/edit_3/:id',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/card/create_3.html',
            controller: 'card.create3.controller',
            controllerAs: 'vm',
            /*title: ' 修改会员卡'*/
            title: '会员卡管理,#/clubcard/card/preview.修改会员卡'
        })
        .state('clubcard.card.edit4', {
            url: '/edit_4/:id',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/card/create_4.html',
            controller: 'card.create4.controller',
            controllerAs: 'vm',
            /*title: ' 修改会员卡'*/
            title: '会员卡管理,#/clubcard/card/preview.修改会员卡'
        })
        .state('clubcard.member', {
            url: '/memmber',
            from: 'clubcard',
            template: '<div ui-view></div>'
        })
        .state('clubcard.member.list', {
            url: '/list',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/member/list.html',
            title: '会员管理',
            controller: 'clubcard.member.controller',
            controllerAs: 'vm'

        })
        .state('clubcard.member.detail', {
            url: '/detial/:tel',
            templateUrl:  tplUrl + 'tpl/clubcard/member/detail.html',
            from: 'clubcard',
            title: '会员管理,#/clubcard/memmber/list.会员详情',
            controller: 'clubcard.detail.controller',
            controllerAs: 'vm'
        })
        .state('clubcard.report', {
            url: '/report',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/report/list.html',
            controller: 'clubcard.report.controller',
            controllerAs: 'vm',
            title: '会员卡数据'
        })
        .state('clubcard.storedvalue', {
            url: '/storedvalue',
            from: 'clubcard',
            templateUrl:  tplUrl + 'tpl/clubcard/storedvalue/list.html',
            controller: 'clubcard.storedvalue.controller',
            controllerAs: 'vm',
            title: '储值记录'
        });


    $stateProvider.state('coupons', {
            url: '/coupons',
            templateUrl:  tplUrl + 'tpl/common/content.html'
        })

        .state('coupons.coin', {
            url: '/coin',
            templateUrl: tplUrl + 'tpl/coupons/coin.html',
            controller: 'coupons.coin',
            from: 'coupons',
            title: '券点管理',
            controllerAs: 'vm'
        })
        .state('coupons.coinDetail', {
            url: '/coin/:id',
            templateUrl: tplUrl + 'tpl/coupons/coin_detail.html',
            controller: 'coupons.coin',
           /* title: '券点流水',*/
            title: '券点管理,#/coupons/coin.券点流水',
            controllerAs: 'vm'
        })
        .state('coupons.list', {
            url: '/list',
            templateUrl:  tplUrl + 'tpl/coupons/list.html',
            controller: 'coupons.list.controller',
            controllerAs: 'vm',
            from: 'coupons',
            title: '优惠券管理',
            accredit: true
        })
        .state('coupons.detail', {
            url: '/detail/:cid',
            templateUrl:  tplUrl + 'tpl/coupons/detail.html',
            title: '优惠券管理,#/coupons/list.卡券详情',
            controller: 'coupons.detail.controller',
            controllerAs: 'vm'
            /*title: '卡券详情'*/
        })
        .state('coupons.edit', {
            url: '/edit/:cid',
            templateUrl:  tplUrl + 'tpl/coupons/create.html',
            controller: 'coupons.create.controller',
            controllerAs: 'vm',
           /* title: '卡券编辑'*/
            title: '优惠券管理,#/coupons/list.修改优惠券'
        })
        .state('coupons.edit_f', {
            url: '/edit_f/:cid',
            templateUrl:  tplUrl + 'tpl/coupons/edit.friend.html',
            controller: 'coupons.edit_f.controller',
            controllerAs: 'vm',
            /*title: '卡券编辑'*/
            title: '优惠券管理,#/coupons/list.修改优惠券'
        })
        .state('coupons.edit_f2', {
            url: '/edit_f2/:cid',
            templateUrl:  tplUrl + 'tpl/coupons/edit.friend2.html',
            controller: 'coupons.edit_f2.controller',
            controllerAs: 'vm',
            /*title: '卡券编辑'*/
            title: '优惠券管理,#/coupons/list.修改优惠券'
        })
        .state('coupons.create', {
            url: '/create/:type',
            templateUrl:  tplUrl + 'tpl/coupons/create.html',
            controller: 'coupons.create.controller',
            controllerAs: 'vm',
            /*title: '新增优惠券'*/
            title: '优惠券管理,#/coupons/list.新增优惠券'
        })

        // 新增朋友的券
        .state('coupons.create_f', {
            url: '/create_f/:type',
            templateUrl:  tplUrl + 'tpl/coupons/create.friend.html',
            controller: 'coupons.create_f.controller',
            controllerAs: 'vm',
            /*title: '新增优惠券'*/
            title: '优惠券管理,#/coupons/list.新增优惠券'
        })
        .state('coupons.create_f2', {
            url: '/create_f2/:type',
            templateUrl:  tplUrl + 'tpl/coupons/create.friend2.html',
            controller: 'coupons.create_f2.controller',
            controllerAs: 'vm',
           /* title: '新增优惠券'*/
            title: '优惠券管理,#/coupons/list.新增优惠券'
        })

        .state('coupons.report', {
            url: '/report?:id',
            templateUrl:  tplUrl + 'tpl/coupons/report.html',
            controller: 'coupons.report.controller',
            controllerAs: 'vm',
            from: 'coupons',
            title: '优惠券数据',
            accredit: true
        })
        /*.state('coupons.provide', {
            url: '/provide',
            templateUrl:  tplUrl + 'tpl/coupons/provide.html',
            controller: 'coupons.provide.controller',
            controllerAs: 'vm',
            from: 'coupons',
            title: '发放记录',
            accredit: true
        })
        .state('coupons.check', {
            url: '/check',
            templateUrl:  tplUrl + 'tpl/coupons/check.html',
            controller: 'coupons.check.controller',
            controllerAs: 'vm',
            from: 'coupons',
            title: '核销记录',
            accredit: true
        });*/
        .state('coupons.record', {
            url: '/record',
            templateUrl:  tplUrl + 'tpl/coupons/record.html',
            controller: 'coupons.record.controller',
            controllerAs: 'vm',
            from: 'coupons',
            title: '优惠券记录',
            accredit: true
        })
        //优惠券派发
        .state('coupons.send', {
            url: '/send',
            templateUrl:  tplUrl + 'tpl/coupons/send.html',
            controller: 'coupons.send.controller',
            controllerAs: 'vm',
            from: 'coupons',
            title: '优惠券派发',
            accredit: true
        });
    //营销中心
    $stateProvider.state('marketing',{
        url : '/marketing',
        templateUrl : tplUrl + 'tpl/common/content.html'
    })
    .state('marketing.autoCoupon', {
        url: '/autoCoupon',
        from: 'marketing',
        template: '<div ui-view></div>'
    })
    .state('marketing.autoCoupon.record',{
        url : '/record/:type/:ruleId',
        from : 'autoCoupon',
        templateUrl : tplUrl + 'tpl/marketing/autoCoupon/record.html',
        controller : 'autoCoupon.record.controller',
        controllerAs : 'vm',
        title:  '自动派券,#/marketing/autoCoupon/rule.派发记录'
    })
    .state('marketing.autoCoupon.rule',{
        url : '/rule/:type',
        from : 'autoCoupon',
        templateUrl : tplUrl + 'tpl/marketing/autoCoupon/rule.html',
        controller : 'autoCoupon.rule.controller',
        controllerAs : 'vm',
        title : '自动派券'
    })
    .state('marketing.activity', {
        url: '/activity',
        from: 'marketing',
        template: '<div ui-view></div>'
    })
    .state('marketing.activity.rule',{
        url : '/rule',
        from : 'marketing',
        templateUrl : tplUrl + 'tpl/marketing/activity/rule.html',
        controller : 'activity.rule.controller',
        controllerAs : 'vm',
        title : '营销活动'
    })
    .state('marketing.activity.record',{
        url : '/record',
        from : 'marketing',
        templateUrl : tplUrl + 'tpl/marketing/activity/record.html',
        controller : 'activity.record.controller',
        controllerAs : 'vm',
        title : '营销记录'
    })
    .state('marketing.activity.detail',{
        url : '/detail/:id',
        from : 'marketing',
        templateUrl : tplUrl + 'tpl/marketing/activity/detail.html',
        controller : 'activity.detail.controller',
        controllerAs : 'vm',
        title : '营销记录,#/marketing/activity/record.查看详情'
    });
    //账号设置
    $stateProvider.state('settings', {
            url: '/settings',
            templateUrl:  tplUrl + 'tpl/common/content.html',
            from: 'settings'
        })
        .state('settings.upGrade', {
            url: '/upGrade',
            from: 'settings',
            templateUrl: tplUrl + 'tpl/settings/upGrade.html',
            controller: 'upGradeController',
            title: '升级为集团商户'
        })
        .state('settings.wxchat', {
            url: '/wxchat',
            from: 'settings',
            templateUrl: tplUrl + 'tpl/settings/wxchat.html',
            controller: 'wxchatController',
            title: '微信公众号'
        })
        .state('settings.merchantInfo', {
            url: '/merchantInfo',
            from: 'settings',
            templateUrl: tplUrl + 'tpl/settings/merchantInfo.html',
            controller: 'merchantInfoController',
            title: '商户信息'
        })
        .state('settings.payMgr', {
            url: '/payMgr',
            from: 'settings',
            templateUrl: tplUrl + 'tpl/settings/payMgr.html',
            controller: 'payMgrController',
            title: '支付管理'
        })
        .state('settings.printSet', {
            url: '/printSet',
            from: 'settings',
            templateUrl: tplUrl + 'tpl/settings/printSet.html',
            controller: 'printSetController',
            title: '打印设置'
        })
        
}]);