app.controller('loginController', function ($scope, userInfo, $date, $mdDialog, tplUrl, $state, $rootScope, $alert) {
	$scope.submit = function(){
		userInfo.post('sys/login', {'loginName': $scope.name, 'password': $scope.pwd}).then(function(res){
			if($rootScope.ifRightBrowser){
				$alert({
					msg: '该浏览器与系统不兼容，建议更换谷歌或火狐使用!'
				})
			}
			/*$rootScope.rootMchtName = res.object.mchtName;
			$rootScope.brandSuffix = res.object.brandSuffix;*/
    		/*$state.go("analysis.overview");*/
			userInfo.getUser().then(function(res){
				if(res.object.role == 'BrandAdmin' || res.object.role == 'StoreAdmin'){
					$state.go("analysis.overview");
				}else{
					$state.go("app.home");
				}
			});
			$rootScope.ifLogin = true;
			/*$rootScope.$broadcast('reloadMenu');*/
			$rootScope.$broadcast('getUserInfo');
			$rootScope.$broadcast('reloadWigets');
		})
	}
})