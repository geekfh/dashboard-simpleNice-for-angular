angular.module('sidebar',['ngMaterial'])
    .controller('sidebar', ['userInfo', '$location', '$rootScope', '$scope', function(userInfo, $location, $rootScope, $scope){
    var vm = this;
    
    $scope.rightShow = 'analysis';
    $scope.toggleBar = function(className, $event){
        $scope.goToggleBar(className, $event.target);
        $scope.rightShow = className;
    }
    $scope.goToggleBar = function(className, target){
        var liLength;
        if(target.getAttribute('section') == 'section'){
            var lastChild = target.parentElement.parentElement.lastElementChild;
            var ulLeight = target.parentElement.parentElement.parentElement.getElementsByTagName('ul');
        }else{
            var lastChild = target.parentElement.lastElementChild;
            var ulLeight = target.parentElement.parentElement.getElementsByTagName('ul');
        }
        if($scope.ifShow == className){
            $scope.ifShow = '';
            lastChild.style.height = '0px';
            return ;
        }else{
            $scope.ifShow = className;
            for(var i = 0; i < vm.sections.length; i++){
                if(vm.sections[i].className == className){
                    liLength = vm.sections[i].children.length;
                }
            }
            for(var j = 0; j < ulLeight.length; j++){
                ulLeight[j].style.height = '0px';
            }
            lastChild.style.height = 45 * liLength + 'px';
        }

    }
    userInfo.get('sys/menus.json').then(function(res){
        vm.sections = res.object;
    })
    
    $scope.helpCenterShow=function(){
    	var windowWid=document.body.clientWidth;
    	var windowHei=document.body.clientHeight;
    	var windowScreenWid=parseInt(window.screen.width);
    	var helpCenter=document.getElementsByClassName('help-center');
    	var helpCenterWrap=document.getElementsByClassName('helpCenter-wrap');
    	var helpCenterHeader=document.getElementsByClassName('help-header');
    	var mainDiv=document.getElementById('mainDiv');  
    	var ohelpCenterBg=document.getElementById('helpCenterBg'); 
    	var copyHeader=document.getElementById('copyHeader'); 
 /*   	var odiv = document.createElement('div');*/ 
    	/*var helpcenterPos=document.getElementById('helpcenterPos');*/
    	
    	if(windowWid<1912){   		
    		/*$scope.isShowBg=true;*/
          /* helpCenter[0].style.display=="block";*/
    	  /* mainDiv.appendChild(odiv);
    	   odiv.setAttribute("id", "helpCenterBg"); */
    	  helpCenter[0].style.display="block";
    	  ohelpCenterBg.style.display="block";
    	  helpCenter[0].style.zIndex="101";
    	  helpCenter[0].style.float="right";
    	  helpCenter[0].style.right=0;
    	 copyHeader.style.display="block";
    	 copyHeader.style.zIndex="101";
    	 copyHeader.style.width=306+'px';
    	 copyHeader.style.right=0;   
    	}
    }
    $scope.secLevelClick = function(child){
        console.log(child.href.split('.')[0], 'kdd')
        if(child.href.split('.')[0] == 'staff'){
            $scope.rightShow = 'poi';
        }else{
            $scope.rightShow = child.href.split('.')[0];
        }
    }
    
    
    $rootScope.$on('ngRepeatFinish', function( ngRepeatFinishedEvent ) {
        if(vm.sections){
            console.log(vm.sections.length, '菜单栏长度')
            for(var i = 0; i < vm.sections.length; i++){
                for(var j = 0; j <vm.sections[i].children.length; j++){
                    if(vm.sections[i].children[j].href == $rootScope.$current.name){
                        $scope.rightShow = vm.sections[i].className;
                        $scope.goToggleBar(vm.sections[i].className,  document.getElementById('sideBarMenu').getElementsByTagName('menu-toggle')[i]);
                        break;
                    }
                }
            }
        }
    })


    vm.helpCenter = [
        {
        	name: '经营分析',
            className: 'analysis',          
            children: [
                {
                    name: '经营概况',
                    href: 'https://huipos.kf5.com/hc/kb/article/1001684/?from=draft'
                }
            ]
        },
         {   name: '账务查询',
            className: 'accounts',
            children: [
                {
                    name: '结算记录',  
                    href: 'https://huipos.kf5.com/hc/kb/article/218967/?from=draft'
                },
                {
                    name: '对账明细',  
                    href: 'https://huipos.kf5.com/hc/kb/article/218978/?from=draft'
                },
                {
                    name: '交易流水',  
                    href: 'https://huipos.kf5.com/hc/kb/article/219119/?from=draft'
                }
            ]
        },        
        {
            name: '店铺管理',
            className: 'poi',            
            children: [
                {
                    name: '门店管理',  
                    href: 'https://huipos.kf5.com/hc/kb/article/219134/?from=draft'
                },
                {
                    name: '员工管理',  
                    href: 'https://huipos.kf5.com/hc/kb/article/192886/?from=draft'
                }
            ]
        },
        {
            name: '优惠券',
            className: 'coupons',          
            children: [
                {
                    name: '优惠券管理',  
                    href: '	https://huipos.kf5.com/hc/kb/article/219152/'
                },
                {
                    name: '优惠券数据',  
                    href: 'https://huipos.kf5.com/hc/kb/article/219184/?from=draft'
                },
                {
                    name: '优惠券记录',  
                    href: 'https://huipos.kf5.com/hc/kb/article/219199/?from=draft'
                },
                {
                    name: '优惠券派发',  
                     href: 'https://huipos.kf5.com/hc/kb/article/1001047/'
                }
            ]
        },
        {
            name: '会员',           
            className: 'clubcard',
            children: [
                {
                    name: '会员卡管理', 
                    href: 'https://huipos.kf5.com/hc/kb/article/219208/?from=draft'
                },
                {
                    name: '会员管理',  
                    href: 'https://huipos.kf5.com/hc/kb/article/219210/?from=draft'
                },
                {
                    name: '会员卡数据', 
                    href: 'https://huipos.kf5.com/hc/kb/article/219212/?from=draft'
                },
                {
                    name: '储值记录',     
                    href: 'https://huipos.kf5.com/hc/kb/article/219227/?from=draft'
                }
            ]
        },
        {
            name: '营销中心',
            className: 'marketing',          
            children: [
                {
                    name: '自动派券',
                    href: 'https://huipos.kf5.com/hc/kb/article/1003657/?from=draft'
                },
                {
                    name: '营销活动',  
                    href: 'https://huipos.kf5.com/hc/kb/article/1003750/?from=draft'
                }
            ]
        },
        {
            name: '系统设置',           
            className: 'setting',
            children: [
                {
                    name: '微信公众号',                
                    href: 'https://huipos.kf5.com/hc/kb/article/219229/?from=draft'
                },
                {
                    name: '商户信息',                
                    href: 'https://huipos.kf5.com/hc/kb/article/219233/?from=draft'
                },
                {
                    name: '支付管理',                
                    href: 'https://huipos.kf5.com/hc/kb/article/219235/?from=draft'
                },
                {
                    name: '打印设置',                
                    href: 'https://huipos.kf5.com/hc/kb/article/1001059/?from=draft'
                }
            ]
        }
    ]
    
    /*vm.sections = [
        {
            name: '账务查询',
            className: 'poi',
            type: 'toggle',
            children: [
                {
                    name: '结算记录',
                    type: 'link',
                    href: 'accounts.balance.list'
                },{
                    name: '对账明细',
                    type: 'link',
                    href: 'accounts.details.list'
                },{
                    name: '账单下载',
                    type: 'link',
                    href: 'accounts.download.list'
                }
            ]
        },
        {
            name: '交易管理',
            className: 'poi',
            type: 'toggle',
            children: [
                {
                    name: '交易流水',
                    type: 'link',
                    href: 'laundry.list'
                }
            ]
        },
        {
            name: '店铺管理',
            className: 'poi',
            type: 'toggle',
            children: [
                {
                    name: '门店管理',
                    type: 'link',
                    href: 'poi.list'
                },{
                    name: '员工管理',
                    type: 'link',
                    href: 'poi.list'
                }
            ]
        },{
            name: '优惠券',
            className: 'coupons',
            type: 'toggle',
            children: [
                {
                    name: '优惠券管理',
                    type: 'link',
                    href: 'coupons.list'
                },
                {
                    name: '优惠券数据',
                    type: 'link',
                    href: 'coupons.report'
                },
                {
                    name: '核销记录',
                    type: 'link',
                    href: 'coupons.check'
                },
                {
                    name: '发放记录',
                    type: 'link',
                    href: 'coupons.provide'
                }
            ]
        },{
            name: '会员',
            type: 'toggle',
            className: 'clubcard',
            children: [
                {
                    name: '会员卡管理',
                    type: 'link',
                    href: 'clubcard.card.preview'
                },
                {
                    name: '会员管理',
                    type: 'link',
                    href: 'clubcard.member.list'
                },
                {
                    name: '会员卡数据',
                    type: 'link',
                    href: 'clubcard.report'
                }
            ]
        },{
            name: '账号设置',
            type: 'toggle',
            className: 'setting',
            children: [
                {
                    name: '微信公众号',
                    type: 'link',
                    href: 'settings.wxchat'
                }
            ]
        }
    ]*/
    /*$scope = $rootScope.$new();*/
    /* var getMenus = function(){
        alert('执行了接口')
        userInfo.get('sys/menus').then(function(res){
            vm.sections = res.object;
        })
    }
    if($location.path() !== '/login'){
        getMenus();
    }
    $scope.$on('reloadMenu', function(){
        getMenus();
    })*/
}]);