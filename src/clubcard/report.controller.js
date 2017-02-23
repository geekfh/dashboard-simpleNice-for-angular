app.controller('clubcard.report.controller', function (NgTableParams, userInfo, $filter, $state) {

    var vm = this, today = new Date(), numTime = 24 * 3600 * 1000;
    var queryParams = vm.queryParams = {};
    vm.searchIng = false;
    vm.date = {};
    vm.start = true;

    /*queryParams.beginDate = $filter('date')(today, 'yyyy-MM-dd');
    queryParams.endDate = $filter('date')(today, 'yyyy-MM-dd');*/

    vm.search = function(){
        queryParams.beginDate = $filter('date')(vm.date.begin, 'yyyy-MM-dd');
        queryParams.endDate = $filter('date')(vm.date.end, 'yyyy-MM-dd');
        vm.ngTable.page(1);
        vm.ngTable.reload();
    }
    userInfo.get('merchant/info').then(function(res){
        vm.user = res.object;
        if(res.code == 0 && !ws.isEmptyObj(res.object)){
            userInfo.get('memberCards').then(function (res) {
                if(res.object.list && res.object.list.length){
                    vm.count = res.object.list.length;
                    init()
                }else{
                    vm.count = res.object.count;
                    //init() //没有会员卡时也调获取会员卡接口--避免弹窗不调接口
                    vm.noData = '暂无数据';
                }
            })
            function init(){
                vm.ngTable = new NgTableParams(
                    { page: 1, count: 10 },
                    {
                        getData: function ($defer, params) {
                            vm.searchIng = true;
                            queryParams.page = params.page();
                            queryParams.rows = params.count();
                            queryParams.beginDate = $filter('date')(vm.date.begin, 'yyyy-MM-dd');
                            queryParams.endDate = $filter('date')(vm.date.end, 'yyyy-MM-dd');
                            userInfo.get('memberCardInfo', queryParams, true).then(function(res){
                                params.total(res.object.rows)
                                vm.searchIng = false;
                                if(res.code == 0){
                                    if(res.object.list.length){
                                        params.total(res.object.totalRows);
                                        $defer.resolve(res.object.list);
                                        vm.noData = false;
                                    }else{
                                        vm.noData = res.msg || '暂无数据';
                                        $defer.resolve([]);
                                    }
                                }else{
                                    vm.noData = res.msg || '暂无数据';
                                    $defer.resolve([]);
                                }
                            });

                        }
                    }
                );
            }
        }else{
            vm.noData = '暂无数据';
        }
    });

    vm.reload = function(){
        vm.date.begin = new Date(+new Date() - 6 * numTime);
        vm.date.end = new Date();

        queryParams.beginDate = $filter('date')(vm.date.begin, 'yyyy-MM-dd');
        queryParams.endDate = $filter('date')(vm.date.end, 'yyyy-MM-dd');
        vm.ngTable.page(1);
        vm.ngTable.reload();
    }

    vm.createCard = function(){
      userInfo.get('mcht/countAllChildMcht').then(function(res){
          if(res.object.mchtCount > 0) $state.go('clubcard.card.create1')
          else return ws.alert({msg: '请先创建门店'});  
      })
    }

    vm.getExcel = function(e){
        if(vm.noData) return ws.alert({msg: '暂无数据可供下载'});

        return e.target.href = '/server/s300/memberCardInfo/material?beginDate=' + vm.queryParams.beginDate + '&endDate=' + vm.queryParams.endDate, setTimeout(function(){e.target.href = '';}, 1500);
    };

    

});

