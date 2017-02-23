/**
 * Created by xiebin on 2016/12/02.
 */
app.controller('activity.record.controller', ['NgTableParams', '$scope', 'userInfo', function(NgTableParams, $scope, userInfo){
	$scope.queryParams = {};
	//营销记录
	if($scope.ngTable){
		$scope.ngTable.reload();
	}else {
		$scope.ngTable = new NgTableParams(
			{page : 1, count : 10},
			{
				getData : function($defer, params){
					$scope.queryParams.page = params.page();
					 $scope.queryParams.rows = params.count();
					userInfo.get('marketingActivity/payoutList', $scope.queryParams, true).then(function(res){
						/*var res = {
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
						}*/
						if(res.object && res.object.pageData){
							params.total(res.object.pageData.totalRows);
						} else {
							params.total(0);
						}

						if (res.object && res.object.pageData && res.object.pageData.list && res.object.pageData.list.length > 0) {
							$scope.noData = false;
							$defer.resolve(res.object.pageData.list);
						} else {
							$scope.noData = true;
							$scope.noDataInfo =  '暂无数据';
							$defer.resolve([]);
						}
					})
				}
			}
		);
	}
}]);