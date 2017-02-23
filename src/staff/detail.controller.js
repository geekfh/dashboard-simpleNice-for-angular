app.controller('detailController', function (NgTableParams, $scope, userInfo, $date, $mdDialog, tplUrl, $q, $rootScope, $stateParams, $state) {
	//参数介绍
	//ifList : 列表页面和详情页的开关
	//ifModify : 详情页中“增加”和“编辑”开关
	var queryParamsSave = {};//进入新增或者修改员工页面时把列表页面搜索框数据保存
	var telPlaceHolder = '请输入11位手机号';
	$scope.ifList = true;
	$scope.noBrandAdmin = true;
	$scope.queryParams = {};
	$scope.ifCheckBox = false;
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
	$scope.primaryList=
		[
			{
				"primary": "收银员",
				"value": "0"
			},
			{
				"primary": "门店管理员",
				"value": "1"
			}
		]
	//判断是谷歌浏览器还是火狐浏览器(利用form标签解决，此代码无用)
	/*if(ws.myBrowser().isFiefox){
		$scope.fireFoxBro = true;
	}else if(ws.myBrowser().isChrome){
		$scope.chromeBro = true;
	}else{
		$scope.otherBro = true;
	}*/
	$scope.pwdFocused = function(){
		$scope.ifPwdFocused = true;
	}
	$scope.noPwdFocused = function(){
		$scope.ifPwdFocused = false;
	}

	if($stateParams.id){
		//查看员工信息接口
		userInfo.get('mchtUser/details.json').then(function(res){
			$scope.queryParams.userId = res.object.userId;
			$scope.queryParams.userName = res.object.userName;
			$scope.loginPrefix =  res.object.loginAccount.split('@')[0];
			$scope.queryParams.mchtName = res.object.mchtName;
			$scope.queryParams.mchtNo = res.object.mchtNo;
			$scope.searchText = res.object.mchtName;
			$scope.ifSearchText = true;
			$scope.queryParams.primary = res.object.primary;
			$scope.queryParams.status = res.object.status;
			$scope.queryParams.userPhone = res.object.userPhone;
			$scope.selectedType = res.object.status;

			//需求：编辑员工是否显示后缀 by xiebin on 20160824；
			if(res.object.loginAccount.indexOf('@') > 0){
				$scope.ifSuffixCheck = false;
				$scope.ifSuffix = true;
				$scope.ifPlace = '';
			}else{
				$scope.ifSuffixCheck = true;
				$scope.ifSuffix = false;
				$scope.ifPlace = telPlaceHolder;
			}

			//判断是门店管理员还是品牌管理员
			userInfo.getUser().then(function(res){
				if(res.object.role == 'BrandStoreAdmin'){
					$scope.ifBrandStoreAdmin = true;
					if($scope.queryParams.primary == '1'){
						$scope.primaryName = '门店管理员';
						$scope.ifModify = false;
						$scope.noChangeName = true;
					}else{
						$scope.primaryName = '收银员';
						$scope.ifModify = true;
						$scope.noChangeName = false;
					}
				}else{
					$scope.ifBrandStoreAdmin = false;
					$scope.selectedPrimary = $scope.queryParams.primary;
					if($scope.queryParams.userId == res.object.userId){
						$scope.ifBrandStoreAdmin = true;
						$scope.primaryName = '品牌管理员';
						$scope.ifModify = false;
						$scope.noBrandAdmin = false;
						$scope.noChangeName = true;
					}else{
						$scope.ifModify = true;
						//需求：只要是编辑员工详情，角色权限都不可更改  by xiebin on 20160824；
						$scope.ifBrandStoreAdmin = true;
						if($scope.queryParams.primary == '0'){
							$scope.primaryName = '收银员';
							$scope.noChangeName = false;
						}else if($scope.queryParams.primary == '1'){
							$scope.primaryName = '管理员';
							$scope.noChangeName = true;
						}
					}

				}
			})
		})
	}else{
		//新增员工
		//判断是门店管理员还是品牌管理员
		userInfo.getUser().then(function(res){
			if(res.object.role == 'BrandStoreAdmin'){
				$scope.ifBrandStoreAdmin = true;
				$scope.primaryName = '收银员';
			}else{
				$scope.ifBrandStoreAdmin = false;
				$scope.selectedPrimary = 0;
			}
			$scope.ifModify = false;
			$scope.queryParams.primary = '0';
			$scope.ifSearchText = true;
		})

		//需求：新增员工显示后缀 by xiebin on 20160824；
		$scope.ifSuffixCheck = true;
		$scope.ifSuffix = false;
		$scope.ifPlace = telPlaceHolder;

	}

	//需求：点击是否添加后缀checkbox逻辑 by xiebin on 20160824；
	$scope.addSuffix = function(ifAddSuffix){
		if(!ifAddSuffix){
			$scope.ifSuffix = true;
			$scope.ifPlace = '';
		}else{
			$scope.ifSuffix = false;
			$scope.ifPlace = telPlaceHolder;
		}
	}

	//带输入框的下拉列表 搜索函数
	$scope.querySearch = function(text){
		console.log(text, 'querySearch');
		var deferred = $q.defer();
		if(text == null){
			deferred.resolve([]);
		}else{
			userInfo.get('mcht/listByName.json', {mchtName: text, mchtStatus: 2}, true).then(function(res){
				deferred.resolve(res.object);
			})
		}
		return deferred.promise;
	}
	//带输入框的文字改变时的搜索函数
	$scope.searchTextChange = function(text){
		console.log(text, 'searchTextChange');
		if(!text){//清空输入框时，清空mchtNo
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

	//添加或修改员工资料
	$scope.staffSub = function(userId){
		var reg = new RegExp("^[a-zA-Z 0-9]+$");
		/*if(!$scope.queryParams.mchtNo){
			ws.alert(
				{msg: '所属门店不能为空！'}
			);
			return;
		}else*/
		if(!$scope.queryParams.userName){
			ws.alert(
				{msg: '员工姓名不能为空！'}
			);
			return;
		}else if(!$scope.loginPrefix){
			ws.alert(
				{msg: '登录账号不能为空！'}
			);
			return;
		}else if(!reg.test($scope.loginPrefix)){
			ws.alert(
				{msg: '登录账号只能包括数字或者英文！'}
			);
			return;
		}else if(!$scope.queryParams.userPhone){
			ws.alert(
				{msg: '手机号码不能为空！'}
			);
			return;
		}else if(!(/^1[3|4|5|7|8]\d{9}$/.test($scope.queryParams.userPhone))){
			ws.alert(
					{msg: '请输入正确手机号格式！'}
			);
			return;
		}

		//需求：判断登录账号是否加上后缀 by xiebin on 20160824；
		if($scope.ifSuffix){
			userInfo.getUser().then(function(res){
				$scope.queryParams.loginAccount = $scope.loginPrefix + '@' + res.object.brandSuffix;
				if(userId && $scope.ifSuffixCheck){
					$mdDialog.show({
						clickOutsideToClose: true,
						templateUrl : tplUrl + 'tpl/staff/suffixSure.html',
						controller : function(scope){
							scope.loginAccount = $scope.queryParams.loginAccount;
							scope.close = function(){
								$mdDialog.hide();
							}
							scope.confirm = function(){
								userSubmit(userId);
								$mdDialog.hide();
							}
						}
					})
				}else{
					userSubmit(userId);
				}
			})
		}else{
			if(!$scope.ifSuffix && $scope.ifSuffixCheck){
				if(!(/^1[3|4|5|7|8]\d{9}$/.test($scope.loginPrefix))){//没有后缀时，检测输入的账号是否为手机号
					$scope.ifAccountErr = true;
					return ;
				}else{
					$scope.ifAccountErr = false;
				}
			}
			$scope.queryParams.loginAccount = $scope.loginPrefix;
			userSubmit(userId);
		}
	}
	//添加或修改员工资料接口
	var userSubmit = function(userId){
		if(userId){
			if($scope.queryParams.pwd && ($scope.queryParams.pwd.length > 16 || $scope.queryParams.pwd.length < 6)){
				ws.alert(
						{msg: '密码应为6到16个字符！'}
				);
				return;
			}
			userInfo.put('/mchtUser/update', $scope.queryParams).then(function(res){
				ws.alert(
						{msg: '修改员工成功！'}
				);
				$state.go('staff.list');
			})
		}else{
			if(!$scope.queryParams.pwd || $scope.queryParams.pwd.length > 16 || $scope.queryParams.pwd.length < 6){
				ws.alert(
						{msg: '密码不能为空且为6到16个字符！'}
				);
				return;
			}else{
				userInfo.post('/mchtUser/create', $scope.queryParams).then(function(res){
					ws.alert(
							{msg: '新增员工成功！'}
					);
					/*$scope.staffDetail({'ifList':true});*/
					$state.go('staff.list');
				})
			}
		}
	}
	//更改状态
	$scope.changeStoreType = function(selectType){
		$scope.queryParams.status = selectType;
	}
	//更改角色
	$scope.changePrimary = function(selectedPrimary){
		$scope.queryParams.primary = selectedPrimary;
	}
	//跳转回列表页
	$scope.backToList = function(){
		$state.go('staff.list')
	}
})