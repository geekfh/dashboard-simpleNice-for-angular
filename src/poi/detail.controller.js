app.controller('poi.detail.controller', function(NgTableParams, $mdDialog, tplUrl, $state, $rootScope, userInfo, $scope, $q, $timeout, baseUrl, $http,$alert){
    var vm = this, photoUlrLength;

    userInfo.get('poi/details.json').then(function(res){
        
        vm.poi = res.object;
        //console.log(JSON.parse(vm.poi.categories))
        vm.categories = ws.wipe(vm.poi.categories).replace(/\'/, '');
        vm.poi.categories = ws.wipe(vm.poi.categories).replace(/\'/, '');
        vm.poi.photoUrlList = JSON.parse(vm.poi.photo_list);
        vm.modify = false;
        vm.canEdit = false;
        photoUlrLength = vm.poi.photoUrlList.length;
    });

 vm.stateGoBack = function(){
        window.history.back();
    }

    // 上传图片文件列表
    vm.photos = [];

    vm.addPhotos = function(){
        var index = vm.photos.length;
        vm.maxImg = photoUlrLength + vm.photos.length >=10 ? true : false;
        if(vm.maxImg) return ws.alert({msg: '全部照片最多十张!'});
        if(index == 0) return vm.photos.push({file: 'file'+index, index: index});
        if(vm.photos[index - 1].file){
            vm.photos.push({file: 'file'+index, index: index});
        }else{
            ws.alert({msg: '请先上传图片!'});
        }
    };
    //编辑
    vm.str = '';
    vm.reSubmit = function(str){
        vm.modify = true;
        vm.str = str;
        if(str == 'all'){
            vm.canEdit = true;
            vm.categories = ws.wipe(vm.poi.categories).replace(/ /, '');
            vm.categories = vm.categories.split(',');
            vm.selected = {province: vm.poi.province, city: vm.poi.city, district: vm.poi.district};
        } 
    }
    //搜索地图
    vm.search = function(){
        var p, c, d, address;
        p = vm.selected.province ? vm.selected.province.fullname : '';
        c = vm.selected.city ? vm.selected.city.fullname : '';
        d = vm.selected.district ? vm.selected.district.fullname : '';
        address = p + c + d + vm.poi.address;
        vm.selected.address = address;

        $rootScope.getAddress(address, 16, true, true);
    };
    $scope.$on('render-map', function(eve){
        vm.search();
    })
    
    // 取消已有的
    vm.cancel = function(index){
        vm.poi.photoUrlList.splice(index, 1);
        photoUlrLength = vm.poi.photoUrlList.length;
        vm.maxImg = photoUlrLength + vm.photos.length >=10 ? true : false;
    };

    // 删除 新上传的
    vm.delImg = function(index){
        vm.photos.splice(index, 1);
        vm.maxImg = photoUlrLength + vm.photos.length >=10 ? true : false;
    };

    vm.addPoi = function(invalid){
        var formData = new FormData();
        var ulrList = vm.poi.photoUrlList || [];

        //delete vm.poi.photoUrlList;

        if(invalid){
            //vm.formError = 'formError';
            vm.formError = true;
            return;
        }else{
            //vm.formError = '';
            vm.formError = false;
        }

        

        // 设置经纬度
        if(vm.str == 'all'){
            if(!vm.selected.longitude || !vm.selected.latitude){
                $alert({msg: '请确认定位信息'});
                return;
            }
            //vm.poi.longitude = vm.selected.longitude;
            //vm.poi.latitude = vm.selected.latitude;
        }
          

        // 设置图片url
        ulrList.forEach(function(it){
            it.qiniu_file_url = it.qiniu_file_url || '';
            formData.append('photoUrlList', '{qiniu_file_url:' + it.qiniu_file_url + ',photo_url:' + it.photo_url + ',qiniu_file_name:' + it.qiniu_file_name + '}');
        });
        // 设置图片文件
        vm.photos.forEach(function(it){
            formData.append('photoFileList', it.file);
        });

        
        var obj = {};
        
        obj.business_name = vm.poi.business_name;
        obj.branch_name = vm.poi.branch_name;
        
        var iaAll = vm.str == 'all';
        obj.province = iaAll ? vm.selected.province.fullname : vm.poi.province;
        obj.city = iaAll ? vm.selected.city.fullname : vm.poi.city;
        obj.district = iaAll ? vm.selected.district.fullname : vm.poi.district;
        obj.longitude = iaAll ? vm.selected.longitude : vm.poi.longitude;
        obj.latitude = iaAll ? vm.selected.latitude : vm.poi.latitude;
        obj.categories = iaAll ? vm.categories : ws.wipe(vm.poi.categories).split(',');

        obj.telephone = vm.poi.telephone;
        obj.avg_price = vm.poi.avg_price;
        obj.open_time = vm.poi.open_time;
        obj.recommend = vm.poi.recommend;
        obj.special = vm.poi.special;
        obj.introduction = vm.poi.introduction;

        obj.address = vm.poi.address;      

        obj = ws.changeUndefined(obj);
        for(var it in obj){
            formData.append(it, obj[it]);
        }
        if(vm.str == 'all'){
            formData.append('id', vm.poi.id);
            formData.append('store_merchant_no', $state.params.id);
            $http.post(baseUrl + 'poi', formData, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(function(res){
                    if(res.data.code == -502){
                        return window.location.href = 'index.html#/login';
                    }
                    if(res.data.code == 0) {
                        ws.alert({msg: '操作成功'});
                        $state.reload();
                    }else{
                        ws.alert({msg: res.data.message});
                    }
                })
        }else{
           $http.post(baseUrl + 'poi/' + vm.poi.id, formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function(res){
                if(res.data.code == -502){
                    return window.location.href = 'index.html#/login';
                }
                if(res.data.code == 0) {
                    ws.alert({msg: '操作成功'});
                    $state.reload();
                }else{
                    ws.alert({msg: res.data.message});
                }
            }) 
        }
    };
});
