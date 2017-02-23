/**
 * Created by xuye on 2016/11/28.
 */
app.controller('activity.rule.controller', ['NgTableParams', '$scope', 'userInfo', '$alert', 'coupons.list.service', 'ws', '$mdDialog', 'tplUrl', '$state', function(NgTableParams, $scope, userInfo, $alert, Service, ws, $mdDialog, tplUrl, $state){
	var initRulePage = function(){
		$scope.markingParams = {};
		$scope.markingParams.consumeTimes = {};
		$scope.markingParams.lastConsumeDays = {};
		$scope.markingParams.prepaidBalance = {};
		$scope.markingParams.totalBalance = {};
		$scope.markingParams.totalBonus = {};
		$scope.markingParams.payoutCardNum = 1;
		$scope.card = {};

		$scope.checkActivityName = function(){
			$scope.ifActivityName = true;
		}

		//基础信息年龄信息
		$scope.ageArr = [
			{
				name: '18以下',
				value: '0-18',
				ifChecked: '0'
			},
			{
				name: '19-25',
				value: '19-25',
				ifChecked: '0'
			},
			{
				name: '26-35',
				value: '26-35',
				ifChecked: '0'
			},
			{
				name: '36-45',
				value: '36-45',
				ifChecked: '0'
			},
			{
				name: '46以上',
				value: '46-',
				ifChecked: '0'
			}
		];
		$scope.ageCheckAll = true;//年龄默认全选
		var ageCheckNum = 0;//年龄被选数
		$scope.selectAge = function(index){
			if(index != null){
				if($scope.ageArr[index].ifChecked == 1){
					$scope.ageArr[index].ifChecked = 0;
					ageCheckNum--;
				}else{
					ageCheckNum++;
					$scope.ageArr[index].ifChecked = 1;
				}
				if(ageCheckNum){
					$scope.ageCheckAll = false;
				}else{
					$scope.ageCheckAll = true;
				}
			}else{
				if(ageCheckNum != 0){
					for(var i=0; i<$scope.ageArr.length; i++){
						$scope.ageArr[i].ifChecked = '0';
					}
				}
				$scope.ageCheckAll = true;
				ageCheckNum = 0;
			}
		}

		$scope.levelCheckAll = true;//会员等级默认全选
		var levelCheckNum = 0;//会员等级被选数
		$scope.selectLevel = function(index){
			if(index != null){
				if($scope.levelArr[index].ifChecked == 1){
					$scope.levelArr[index].ifChecked = 0;
					levelCheckNum--;
				}else{
					levelCheckNum++;
					$scope.levelArr[index].ifChecked = 1;
				}
				if(levelCheckNum){
					$scope.levelCheckAll = false;
				}else{
					$scope.levelCheckAll = true;
				}
			}else{
				if(levelCheckNum != 0){
					for(var i=0; i<$scope.levelArr.length; i++){
						$scope.levelArr[i].ifChecked = '0';
					}
				}
				$scope.levelCheckAll = true;
				levelCheckNum = 0;
			}
			console.log($scope.levelArr);
		}

		//统计活动发放人数
		$scope.countPersonNum = function(){
			var legal = true;
			//替换余额单位
			$scope.markingParams.prepaidBalance.begin = $scope.cPrepaidBalanceBegin * 100;
			$scope.cPrepaidBalanceEnd ? $scope.markingParams.prepaidBalance.end = $scope.cPrepaidBalanceEnd * 100 : $scope.markingParams.prepaidBalance.end = '';
			$scope.markingParams.totalBalance.begin = $scope.cTotalBalanceBegin * 100;
			$scope.cTotalBalanceEnd ? $scope.markingParams.totalBalance.end = $scope.cTotalBalanceEnd * 100 : $scope.markingParams.totalBalance.end = '';
			angular.forEach($scope.markingParams, function(value, key){
				if(typeof value == 'object'){
					if(value.begin && value.end && (Number(value.end) < Number(value.begin))){
						legal = false;
						switch(key){
							case 'consumeTimes':
								$scope.consumeTimes = true;
								break;
							case 'lastConsumeDays':
								$scope.lastConsumeDays = true;
								break;
							case 'prepaidBalance':
								$scope.prepaidBalance = true;
								break;
							case 'totalBalance':
								$scope.totalBalance = true;
								break;
							case 'totalBonus':
								$scope.totalBonus = true;
								break;
						}
						return ;
					}
				}
			});
			if(legal){
				getAgeLevelParams();
				console.log($scope.markingParams, '发放参数')
				//统计活动发放人数接口
				userInfo.post('marketingActivity/payoutPersonNum', $scope.markingParams).then(function(res){
					$scope.payoutPersonNum = res.object.payoutPersonNum;
					if($scope.card.quantity < $scope.payoutPersonNum){
						$alert({
							msg: '优惠券库存不足，是否确定派券？'
						})
					}
				});
			}
		}

		//营销活动派券
		$scope.payout = function(err){
			if(!ws.isEmptyObj(err)){
				$scope.ifActivityName = true;
			}else if(!$scope.markingParams.cardId){
				$alert({msg: '请选择赠送优惠券'})
				return ;
			}else if($scope.payoutCount >=30){
				$alert({
					msg: '每月派券的次数不能超过30次'
				})
			}else{
				getAgeLevelParams();
				userInfo.post('marketingActivity/payout', $scope.markingParams).then(function(){
					$mdDialog.show({
						clickOutsideToClose: true,
						templateUrl : tplUrl + 'tpl/common/mdDialogTip.html',
						controller : function(scope){
							scope.onlyTip = true;
							scope.tip = '操作成功';
							setTimeout(function(){
								$mdDialog.hide();
								window.location.reload();
							},2000);
						}
					})
				});
			}
		}

		$scope.changeValue = function(param){
			$scope[param] = false;
		}

		//获取年龄和会员等级参数
		var getAgeLevelParams = function(){
			$scope.markingParams.age = [];
			$scope.markingParams.memberCardLevel = [];
			angular.forEach($scope.ageArr, function(value, key){
				if(value.ifChecked == 1){
					$scope.markingParams.age.push(value.value);
				}
			})
			angular.forEach($scope.levelArr, function(value, key){
				if(value.ifChecked == 1){
					$scope.markingParams.memberCardLevel.push(value.name);
				}
			})
		}

		//选择优惠券
		$scope.selectCoupon = function(coupon){
			$scope.$emit('select.coupon.start',coupon, 6)
		};
		//选择优惠券结束
		$scope.$on('select.coupon.end',function(eve,coupon){
			$scope.markingParams.cardId = coupon.cardId;
			$scope.card = {
				title:coupon.title,
				cardId:coupon.cardId,
				quantity: coupon.quantity
			};
			if($scope.card.quantity < $scope.payoutPersonNum){
				$alert({
					msg: '优惠券库存不足，是否确定派券？'
				})
			}
		});
		//修改库存
		$scope.editInventory = function(item){
			if(item){
				Service.editInventory(item);
			}
		}

		//统计商户当月营销活动派券次数
		userInfo.get('marketingActivity/payoutCount').then(function(res){
			$scope.payoutCount = res.object.payoutCount;
		});


		//营销记录
		/*if($scope.ngTable){
			$scope.ngTable.reload();
		}else {
			$scope.ngTable = new ngTableParams(
					{page : 1, count : 10},
					{
						getData : function($defer, params){
							/!*$scope.queryParams.page = params.page();
							 $scope.queryParams.rows = params.count();*!/
							userInfo.get('sys/wigets').then(function(res){
								var res = {
									code : 0,
									message : String,
									object :
									{
										pageData:{
											page:123,
											totalRows:23,
											totalPage:23,
											list:
													[{
														activityId:'2',
														payoutTime:'2016-09-10',
														activityName:'这是名字',
														cardName:'这是卡名',
														cardType:'卡类型',
														payoutNum:'派发数量',
													},{
														activityId:'3',
														payoutTime:'2016-11-10',
														activityName:'这是名字2',
														cardName:'这是卡名2',
														cardType:'卡类型2',
														payoutNum:'派发数量2',
													}]
										}
									}
								}
								if(res.object){
									$defer.resolve(res.object.pageData.list);
								} else {
									$scope.noData = '暂无数据';
									$defer.resolve([]);
								}
							})
						}
					}
			);
		}*/
	}

	//基础信息会员等级
	userInfo.get('memberCards/memberCardLevelList').then(function(res){
		if(res.code == '0'){
			$scope.noInitPage = false;
			$scope.levelArr = [];
			if(res.object && res.object.level_name){
				for(var i = 0; i < res.object.level_name.length; i++){
					$scope.levelArr[i] = {};
					$scope.levelArr[i].name = res.object.level_name[i];
					$scope.levelArr[i].ifChecked = 0;
				}
			}
			initRulePage();
		}else{
			$scope.noInitPage = true;
		}
	});

	$scope.createCard = function(){
		userInfo.get('mcht/countAllChildMcht').then(function(res){
			if(res.object.mchtCount > 0){
				$state.go('clubcard.card.preview');
				$scope.$emit('ngRepeatFinish');				
			}else {
				return ws.alert({msg: '请先创建门店'});
			}
		})
	}
}]);