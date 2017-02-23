app.controller('upGradeController', function ($scope, userInfo, $state, $rootScope, tplUrl, $mdDialog, $interval, $alert) {
	$scope.submit = function(){
		if(!(/^[a-zA-Z\d]+$/.test($scope.regSuffix))){
			$alert({
				msg: '账号后缀只能存在数字或者英文！'
			})
			return ;
		}
		userInfo.put('/mcht/updateToBrandMcht', {brandSuffix:$scope.regSuffix}).then(function(res){
			$mdDialog.show({
				clickOutsideToClose: true,
				templateUrl: tplUrl + 'tpl/settings/succTip.html',
				controller: function($scope){
					$scope.countNum = 5;
					var timePromise = $interval(function(){
						if($scope.countNum-- == 0){
							$interval.cancel(timePromise);
							timePromise = undefined;
							$mdDialog.hide();
							$scope.logout();
						}
					},1000);
					$scope.confirm = function(){
						$scope.logout();
						$mdDialog.hide();
					};

					$scope.logout = function(){
						userInfo.get('sys/logout.json').then(function(res){
							$rootScope.rootMchtName = '';
							$rootScope.ifLogin = false;
							$rootScope.powers = [];//退出登录，权限清空
							$rootScope.User = {};//清空用户信息
							$state.go('login');
						})
					}
				}
			})
		})
	}
});