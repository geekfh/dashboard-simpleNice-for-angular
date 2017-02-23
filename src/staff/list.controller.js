app.controller('staffController', function (NgTableParams, $scope, userInfo, $date, $mdDialog, tplUrl, $q, $rootScope, $alert, $state) {
	//参数介绍
	//ifList : 列表页面和详情页的开关
	//ifModify : 详情页中“增加”和“编辑”开关
	var queryParamsSave = {};//进入新增或者修改员工页面时把列表页面搜索框数据保存
	var searchCon = '';//搜索内容
	$scope.ifList = true;
	$scope.queryParams = {};
	$scope.storeTypeList=
	[
		{
			"storeType": "正常",
			"value": "0"
		},
		{
			"storeType": "停用",
			"value": "1"
		},
		{
			"storeType": "注销",
			"value": "2"
		}
	]
	//登录的商户门店
	var mchtName = '';
	//带输入框的下拉列表 搜索函数
	$scope.querySearch = function(text){
		var deferred = $q.defer();
		if(text == null){
			 searchCon = false;
		     deferred.resolve([]);
		 }else{
			 if(text){
				 searchCon = true;
			 }
		     userInfo.get('mcht/listByName.json', {mchtName: text, mchtStatus: 1}, true).then(function(res){
				 if(res.object.length == '1'){//用户没点击选择框时，从这里赋值用户输入的mchtNo
					 $scope.queryParams.mchtId = res.object[0].mchtId;
					 $scope.queryParams.mchtNo = res.object[0].mchtNo;
				 }else if(!res.object.length){//搜索不到门店时，清空mchtNo
					 $scope.queryParams.mchtId = '';
					 $scope.queryParams.mchtNo = '';
				 }
		         deferred.resolve(res.object);
		     })
		 }
		return deferred.promise;
	}
	//带输入框的文字改变时的搜索函数
	$scope.searchTextChange = function(text){
		if(!text){//清空输入框时，清空mchtNo
			searchCon = false;
			$scope.queryParams.mchtId = '';//门店id
			$scope.queryParams.mchtNo = '';//门店商户号
			$scope.queryParams.mchtName = '';//门店商户号
		}
	}
	//带输入框的下拉列表点击函数
	$scope.selectedItemChange = function(item){
		if(item){
 			$scope.queryParams.mchtId = item.mchtId;//门店id
			$scope.queryParams.mchtNo = item.mchtNo;//门店商户号
			$scope.queryParams.mchtName = item.mchtName;//门店商户号
		}
	}
	//查询员工
	$scope.search = function(){
		queryParamsSave = angular.copy($scope.queryParams);
		if(searchCon && !$scope.queryParams.mchtNo){
			$alert({
				msg: '没有该门店的数据！请重新输入'
			})
			return ;
		}
		if($scope.ngTable){
			$scope.ngTable.page(1);
			$scope.ngTable.reload();
		}else {
			$scope.ngTable = new NgTableParams(
					{page : 1, count : 10},
					{
						getData : function(params){
							$scope.queryParams.page = params.page();
							$scope.queryParams.rows = params.count();

							return userInfo.get('mchtUser/listPage.json', $scope.queryParams, true).then(function(res){
								$scope.ifSearched = true;
								if(res.object.list.length){
									params.total(res.object.totalRows);
									$scope.noData = false;
									return res.object.list;
								} else {
									$scope.noData = '暂无数据';
									return [];
								}
							})
						}
					}
			);
		}
	};

	//$scope.search();
	$scope.goAddStaff = function(){
		$state.go("staff.detail", {searchText:$scope.queryParams.mchtName, mchtNo:$scope.queryParams.mchtNo})
	};

	//默认选中登录商户，并自动查询
	userInfo.getUser().then(function(res){
		mchtName = res.object.mchtName;
		$scope.searchText = mchtName;
		$scope.ifAutoShow = true;
		$scope.search();
	});

	//重置
	$scope.reload = function(){
		$scope.searchText = mchtName;
		$scope.queryParams = {};
		$scope.ngTable.page(1);
		$scope.ngTable.reload();
	}
})