/**
 * Created by xuye on 2016/11/28.
 */
app.controller('activity.detail.controller',function($scope, userInfo, $stateParams, ws){
	$scope.showParams = {};
	userInfo.get('marketingActivity/activityDetail/' + $stateParams.id).then(function(res){
		/*var res = {
			code : 0,
			message : 'OK',
			object : {
				activityName:'活动名称',//活动名称
				age:['0-18', '19-25'],
				memberCardLevel:['黄金会员', '白金会员'],
				consumeTimes:{
					begin:'1',
					end:'2'
				},
				lastConsumeDays:{
					begin:'1',
					end:'2'
				},
				prepaidBalance:{
					begin:'1',
					end:'2'
				},
				totalBalance:{
					begin:'1',
					end:'2'
				},
				totalBonus:{
					begin:'1',
					end:'2'
				},
				cardName:'会员卡名称',//优惠名称
				payoutCardNum:'1',//每个人派发卡券的数量
				payoutPersonNum:'37' //派券人数
			}
		};*/
		$scope.showParams = res.object;
		$scope.showParams.age = res.object.age.join(',').replace('0-18', '18岁以下').replace('46-', '46岁以上');
		$scope.showParams.memberCardLevel = res.object.memberCardLevel.join(',');

		angular.forEach(res.object, function(value, key){
			var unit = '';
			if(typeof value == 'object'){
				if(ws.isEmptyObj(value)){
					$scope[key] = '';
				}else{
					if(value.begin || value.end){
						switch(key){
							case 'consumeTimes':
								unit = '次';
								break;
							case 'lastConsumeDays':
								unit = '天';
								break;
							case 'prepaidBalance':
								unit = '元';
								value.begin = value.begin/100;
								value.end = value.end/100;
								break;
							case 'totalBalance':
								unit = '元';
								value.begin = value.begin/100;
								value.end = value.end/100;
								break;
							case 'totalBonus':
								unit = '分';
								break;
						}
						if(value.begin && !value.end){
							$scope[key] = value.begin + unit + '以上';
						}else if(!value.begin && value.end){
							$scope[key] = value.end + unit + '以下';
						}else{
							$scope[key] = value.begin + '-' + value.end + unit;
						}
					}else{
						$scope[key] = '';
					}
				}
			}
		});
	});
});