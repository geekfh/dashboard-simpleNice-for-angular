app.controller('printSetController', function (NgTableParams, $mdDialog, tplUrl, $state, $rootScope, userInfo, $scope, $q, $timeout, $alert){
	$scope.queryParams = {};
	function getDetail(){
		userInfo.get('merchant/printDetail').then(function(res){
			//$scope.brandName = res.object.brandName;
			$scope.brandName = $rootScope.userInfo.mchtName;

			$scope.editFlag = res.object.editFlag;
			if($scope.editFlag == '0'){
				$scope.noImg = true;
			}else{
				$scope.noImg = false;
			}
			$scope.pic = {
				qiniu_file_url:res.object.picUrl
			}
			$scope.queryParams = {
				picUrl : res.object.picUrl,
				description : res.object.description
			}
			$scope.oldDescription = res.object.description;
		})
	}
	getDetail();
	$scope.savePrint = function(){
		$scope.queryParams.picUrl = $scope.pic.qiniu_file_url;
		userInfo.post('merchant/savePrint', $scope.queryParams).then(function(res){
			$mdDialog.show({
				clickOutsideToClose: true,
				templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
				controller : function(scope){
					scope.onlyTip = true;
					scope.tip = '保存成功';
					setTimeout(
						function(){
							$mdDialog.hide();
							getDetail();
					},1000);
				}

			})
		})
	}
	$scope.editPage = function(){
		$scope.editFlag = '0';
	}
	$scope.cancel = function(){
		$scope.editFlag = '1';
		$scope.queryParams.description = $scope.oldDescription;
	}
});