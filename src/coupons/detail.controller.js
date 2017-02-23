app.controller('coupons.detail.controller', function(NgTableParams, $state, $scope, userInfo,$date,$sce, ws){
    var vm = this;
    //用于判断mobile_view.html中如何显示
    vm.isDetail = true;

    
    userInfo.get('cards/' + $state.params.cid, {}).then(function(res){
        vm.preview = res.object.card;
        vm.preview.poi = res.object.poi;
        vm.validity = {};
        if(vm.preview.baseInfo.dateInfoType == "DATE_TYPE_FIX_TERM"){
            var today = new Date();
            vm.validity.begin = $date.format(today, vm.preview.baseInfo.fixedBeginTerm).str;
            vm.validity.end = $date.format(today, vm.preview.baseInfo.fixedTerm + vm.preview.baseInfo.fixedBeginTerm).str;
        }else if(vm.preview.baseInfo.dateInfoType == "DATE_TYPE_FIX_TIME_RANGE"){
            vm.validity.begin = vm.preview.baseInfo.beginTimestamp;
            vm.validity.end = vm.preview.baseInfo.endTimestamp;
        }
        //处理使用须知中的换行
        if(vm.preview.baseInfo.description){
            vm.preview.baseInfo.description = ws.newLine(vm.preview.baseInfo.description);
            vm.preview.baseInfo.description = $sce.trustAsHtml(vm.preview.baseInfo.description);
        }
    });

    vm.initPos = function(){
        setTimeout(function(){
            var content = document.getElementsByClassName('scrollContent')[0];
            var mobileView = document.getElementsByClassName('suspension-wrap')[0];
            mobileView.style.top = '104px';
            content.onscroll = function(){
                var sTop = content.scrollTop;
                if(sTop < 104 - 65) mobileView.style.top = (104 - sTop) + 'px';
                else mobileView.style.top = '85px';
            }
        }, 100)
    }


    vm.edit = function(){
    	var str = vm.preview.baseInfo.type == '1' ? 'coupons.edit' : 'coupons.edit_f';
        $state.go(str, {cid: vm.preview.baseInfo.cardId});
    }
});
