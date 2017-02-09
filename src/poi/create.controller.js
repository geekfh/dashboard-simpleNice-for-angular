angular.module('poi.create', []).controller('poi.create.controller', ['$rootScope', '$alert', '$state', '$scope', 'userInfo', 'poi.create.service', function($rootScope, $alert, $state, $scope, userInfo, Service){
    var vm = this;
    // 选择的省市区信息
    vm.selected  = {};
    
    // 选择的分类信息
    vm.categories = [];

    // 上传图片文件列表
    vm.photos = [];

    vm.poi = {
        business_name : '',//门店名称
        branch_name : '',//分店名称
        province : '',//门店所在的省份
        city : '',//门店所在的城市
        district : '',//门店所在地区
        address : '',//门店所在的详细街道地址
        telephone : '',//门店的电话
        categories : [],
        longitude : '',//门店所在地理位置的经度
        latitude : '',//门店所在地理位置的纬度
        photoFileList : [],  //设置为多个 相同 name,
        special : '',//特色服务
        open_time : '',//营业时间，24 小时制表示，用“-”连接
        avg_price : '',//人均价格，大于0 的整数
        introduction : '',//商户简介，主要介绍商户信息等
        recommend : ''//推荐品
    };

    // 重新提交的数据
    if($state.params.poi && $state.params.poi.id){
        vm.poi = $state.params.poi;

        vm.poi.longitude = null;
        vm.poi.latitude = null;

        vm.poi.photoFileList = [];

        vm.poi.province = null;
        vm.poi.city = null;
        vm.poi.district = null;

        vm.poi.categories = [];
    }

    vm.addPhotos = function(){
        var index = vm.photos.length;
        vm.photos.push({file: 'file'+index, index: index});
        vm.maxImg = vm.photos.length >= 10 ? true : false;
    };
    // 取消图片
    vm.delImg = function(item){
        vm.photos.forEach(function(it, i){
            if(it.index == item.index){
                vm.photos.splice(i, 1);
            }
        });
        vm.maxImg = vm.photos.length >= 10 ? true : false;
    };

    
    vm.citySelected = function(){
        
    };
    
    vm.search = function(){
        var p, c, d, address;
        p = vm.selected.province ? vm.selected.province.fullname : '';
        c = vm.selected.city ? vm.selected.city.fullname : '';
        d = vm.selected.district ? vm.selected.district.fullname : '';
        address = p + c + d + vm.address;
        vm.selected.address = address;


        vm.poi.province = p;
        vm.poi.city = c;
        vm.poi.district = d;
        vm.poi.address = vm.address;
        
        $rootScope.getAddress(address, 16, true);
        
    };

    vm.stateGoBack = function(){
        window.history.back();
    }



    // 提交数据
    vm.addPoi = function(invalid){
        
        var formData = new FormData();
        //判断是否选择省
        if(!vm.selected.province){
            return $alert({msg: '请选择省份信息'});
        }
        //判断是否选择城市
        if(!vm.selected.city){
            return $alert({msg: '请选择城市信息'});
        }
        //判断是否选择地区
        if(!vm.selected.district){
            //return $alert({msg: '请选择地区信息'});
        }else{
            formData.append('district', vm.selected.district.fullname);
        }
        
        
        if(invalid){
            //vm.formError = 'formError';
            vm.formError = true;
            return;
        }else{
            //vm.formError = '';
            vm.formError = false;
        }
        
        
       
        // 设置经纬度
        vm.poi.longitude = vm.selected.longitude;
        vm.poi.latitude = vm.selected.latitude;

        if(!vm.poi.longitude || !vm.poi.latitude){
            $alert({msg: '请确认定位信息'});
            return;
        }

        // 设置类目
        vm.poi.categories = vm.categories;

        // 设置图片文件
        vm.photos.forEach(function(it){
            formData.append('photoFileList', it.file);
        });
        formData.append('store_merchant_no', $state.params.id);
        // 转换为 formData
        for(var it in vm.poi){
            formData.append(it, vm.poi[it]);
        }
        
        vm.submiting = true;
        userInfo.post('poi', formData, '', true).then(function(res){
            vm.submiting = false;
            if(res.code == 0){
                $alert({msg: '数据提交成功'});
                //判断登录权限
                var lastPoiPage = localStorage.getItem("lastPoiPage");
                if(lastPoiPage) $state.go(lastPoiPage);
                //$state.go('poi.list');
            }else{
                vm.submiting = false;
                $alert({msg: '创建失败，请重试'});
            }
        });
    }

}]);




