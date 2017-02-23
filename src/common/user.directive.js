angular.module('App').directive('user', function($rootScope, $state, $location){
    return {
        restrict : 'E',
        replace : true,
        // template: '<div class="header-user"><p>{{User.memberName}}</p><p><a href="/cardServerWeb/logout" class="app-color">退出登录</a></p></div>',
        template : '<div class="header-user"><p style="color: #fff;">{{rootMchtName}}</p><p class="userLogin-name">{{userLoginName}}</p><p><a href="javascript: ;" ng-click="logout()" class="app-color">退出登录</a></p></div>',

        controller : function(userInfo, $scope){
            //登录页面时，不调此接口
            /*if($location.path() !== '/login'){
                userInfo.getUser().then(function(res){
                    $rootScope.rootMchtName = res.object.mchtName;
                    $rootScope.brandSuffix = res.object.brandSuffix;
                })
            }*/
            $rootScope.$broadcast('getUserInfo');
            $scope.logout = function(){
                userInfo.get('sys/logout.json').then(function(res){
                    $rootScope.rootMchtName = '';
                    $rootScope.userLoginName = '';
                    $rootScope.ifLogin = false;
                    $rootScope.powers = [];//退出登录，权限清空
                    $rootScope.User = {};//清空用户信息
                    $state.go('login');
                    /*window.location.href = 'login.html#/login';*/
                })
            }
        }
    }
});
