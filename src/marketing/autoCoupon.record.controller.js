/**
 * Created by xuye on 2016/11/28.
 */
app.controller('autoCoupon.record.controller',function($scope, $state, userInfo, ngTableParams, $rootScope){
    var vm = this;
    var type = $state.params.type;
    vm.queryParams = {};

    if($rootScope.titleObj && $rootScope.titleObj.href)
        $rootScope.titleObj.href += '/' + type;

    //新会员营销
    if(type == 'new'){
        vm.pageTitle = '新会员营销-派发记录';
        vm.queryParams.type = '3';

    }
    if(type == 'lost'){
        vm.pageTitle = '濒临流失会员营销-派发记录';
        vm.queryParams.type = '4';
    }
    if(type == 'count'){
        vm.pageTitle = '消费次数奖励营销-派发记录';
        vm.queryParams.type = '5';
    }

    function initPage(){
        var ruleId = $state.params.ruleId;
        if(vm.ngTable){
            vm.ngTable.page(1);
            vm.ngTable.reload();
        }else{
            vm.ngTable = new ngTableParams({page: 1, count: 10},{
                getData: function($defer, params) {
                    userInfo.get('cards/sendCenter/sendRecord/' + ruleId, {type : vm.queryParams.type}, true).then(function(res){
                        params.total(res.object.totalRows);
                        vm.totalCount = res.object.totalSend;
                        if(res.code == 0){
                            if(res.object.list && res.object.list.length){
                                vm.noData = false;
                                $defer.resolve(res.object.list);

                            }else{
                                vm.noData = true;
                                $defer.resolve([]);
                            }
                        }else{
                            vm.noData = true;
                        }
                    })
                }
            });
        }
    }

    initPage();


});