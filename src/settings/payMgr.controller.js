app.controller('payMgrController', function (NgTableParams, $mdDialog, tplUrl, $state, $rootScope, userInfo, $scope, $q, $timeout, $alert, $mdDialog, User) {
	$scope.queryParams = {};
	var searchCon = '';//搜索内容

	$scope.t0Selected = [];
	$scope.s0Selected = [];
	//交易门店选择类型
	$scope.storeTypeList = [
		{
			storeType : "所有门店",
			value : "1"
		},
		{
			storeType : "指定门店",
			value : "5"
		},
		{
			storeType : "指定分组",
			value : "4"
		}
	];
	$scope.querySearch   = querySearch;
	$scope.selectedItemChange = selectedItemChange;
	$scope.searchTextChange   = searchTextChange;

	$scope.changeStoreType = function(selectedType){
		//获取门店所有分组
		if(selectedType == 4){
			userInfo.get('mchtGroup/listAll.json').then(function(res){
				$scope.storeGroupList = res.object;
				if(!res.object.length){
					$scope.storeGroupList.unshift({groupId: '', groupName: '暂无分组'})
				}
				//不能
				/*else{
				 $scope.storeGroupList.unshift({groupId: '', groupName: '全部分组'})
				 }*/
			})
		}
	}

	$scope.changeStoreGroup = function(selectedGroup){
		$scope.queryParams.groupId = selectedGroup;
	}
	$scope.search = function(){
		if($scope.queryParams.visibleRange == '5'){
			if(!$scope.queryParams.mchtNo){
				ws.alert(
						{msg: '请选择指定门店！'}
				);
				return ;
			}
			$scope.queryParams.groupId = '';
		}else if($scope.queryParams.visibleRange == '4'){
			if(!$scope.queryParams.groupId){
				ws.alert(
						{msg: '分组名称不能为空！'}
				);
				return ;
			}
			$scope.queryParams.mchtNo = '';
			$scope.queryParams.mchtId = '';
		}else if($scope.queryParams.visibleRange == '1'){
			$scope.queryParams.mchtNo = '';
			$scope.queryParams.mchtId = '';
			$scope.queryParams.groupId = '';
		}
		if($scope.ngTable){
			$scope.ngTable.page(1);
			$scope.ngTable.reload();
		}else {
			$scope.ngTable = new NgTableParams(
					{page : 1, count : 10},
					{
						getData : function($defer, params){
							$scope.queryParams.page  = params.page();
							$scope.queryParams.rows = params.count();
							userInfo.get('mcht/payment/listPage', $scope.queryParams, true).then(function(res){
								if(res.object && res.object.list.length){
									params.total(res.object.totalRows);
									$scope.noData = false;
									for(var i=0; i<res.object.list.length; i++){
										$scope.t0Selected[i] = res.object.list[i].t0Flag;
										$scope.s0Selected[i] = res.object.list[i].s0Flag;
									}
									$defer.resolve(res.object.list);
								} else {
									$scope.noData = '暂无数据';
									$scope.t0Selected = [];
									$scope.s0Selected = [];
									$defer.resolve([]);
								}

							})
						}
					}
			);
		}
	}

	$scope.search();
	function querySearch (text) {
		console.log('querySearch');
		var deferred = $q.defer();
		if(text == null){
			deferred.resolve([]);
		}else{
			userInfo.get('mcht/listByName.json', {mchtName: text,mchtStatus:2}, true).then(function(res){
				if(res.object.length == '1'){//用户没点击选择框时，从这里赋值用户输入的mchtNo
					$scope.queryParams.mchtNo = res.object[0].mchtNo;
					$scope.queryParams.mchtId = res.object[0].mchtId;
				}else if(!res.object.length){//搜索不到门店时，清空mchtNo
					$scope.queryParams.mchtNo = '';
					$scope.queryParams.mchtId = '';
				}
				deferred.resolve(res.object);
			})
		}
		return deferred.promise;
	}

	function searchTextChange(text) {
		if(!text){//清空输入框时，清空mchtNo
			$scope.queryParams.mchtNo = '';
			$scope.queryParams.mchtId = '';
		}
	}
	function selectedItemChange(item) {
		if(item){
			$scope.queryParams.mchtNo = item.mchtNo;
			$scope.queryParams.mchtId = item.mchtId;
		}
	}
	$scope.changeCheck = function(flag, item, settleType, index){
		var updateSettelType = function(){
			var type, typeName, ifOn;
			if(settleType == 1){
				type = !flag;
				typeName = 'T+0';
			}else{
				type = !flag;
				typeName = 'S+0';
			}
			if(type){
				ifOn = '开启';
			}else{
				ifOn = '关闭';
			}
			userInfo.put('mcht/payment/updateSettelType', {mchtNo: item.mchtNo, settleType: settleType, type: type}).then(function(res){
				if(res.code == '0'){
					$alert({
						msg: typeName + '到账服务已' + ifOn
					})
				}else{
					$alert({
						msg: typeName + '到账服务' + ifOn + '失败！'
					})
					if(settleType == 1){
						$scope.t0Selected[index] = flag;
					}else{
						$scope.s0Selected[index] = flag;
					}
				}
			})
		}
		if(flag){
			updateSettelType();
		}else{
			userInfo.get('photoCard/photoStatus/' + item.mchtNo).then(function(res){
				/*res.object.photoStatus = '1';*/
				if(res.object.photoStatus == '0'){
					updateSettelType();
				}else if(res.object.photoStatus == '1'){
					/*res.object.canPhotoCount = '0';*/
					if(settleType == 1){
						$scope.t0Selected[index] = flag;
					}else{
						$scope.s0Selected[index] = flag;
					}
					if(res.object.canPhotoCount == '0'){
						$alert({
							msg: '今日认证次数超限，明天再来重新认证吧'
						});
						return ;
					}
					var itemObj = item;
					$mdDialog.show({
						clickOutsideToClose: true,
						templateUrl: tplUrl + 'tpl/settings/cardAuthentication.html',
						controllerAs: 'typeCtrl',
						controller: function(userInfo, ws){
							var vm = this;
							this.pic = {};
							this.nopic = false;
							this.mchtName = itemObj.mchtName;
							this.cardAuthenSub = function(){
								this.formError = true;
								if(ws.isEmptyObj(this.pic)){
									this.nopic = true;
									return ;
								}else if(!this.cardNum){
									return ;
								}else{
									//拍卡确认接口
									userInfo.post('photoCard/photoConfirm', {mchtNo: itemObj.mchtNo, picName: this.pic.picName, cardNum: this.cardNum}).then(function(res){
									/*userInfo.get('sys/wigets', {mchtNo: itemObj.mchtNo, picName: this.pic.picName, cardNum: this.cardNum}, true).then(function(res){*/
										if(res.code == '0'){
											$mdDialog.cancel();
											$alert({
												msg: res.message
											});
										}else{
											vm.errMessage = res.message;
										}
									})
								}
							}
							this.cancel = function(){
								$mdDialog.cancel();
							};
						}
					})
				}
			})
		}
	}
});