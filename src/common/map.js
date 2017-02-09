
var QQMapUrl = 'https://apis.map.qq.com/ws/district/v1/';
//var QQMapKey = 'XHHBZ-ZVEKU-YEIVV-4O6XI-3EQDQ-HGFFS';
var QQMapKey = 'FXIBZ-WF7AQ-MEA5M-GIB46-6IOQQ-H5FT7';

angular.module('map', [])
    .component('map', {
        template: '<div id="qqMapContainer" style="height: 450px;" ></div>',
        bindings: {
            selected: '<'
        },
        controller: ['$window', '$rootScope', function($window, $rootScope){
            var cityLocation, geocoder, map, infoWin, showInfo, vm = this;

            $rootScope.getAddress = function(address, zoom, info, isGeocoder){
                showInfo = info ? info : false;
                if(isGeocoder){
                    var timer = setInterval(function(){
                        if(geocoder && map){
                            geocoder.getLocation(address);
                            map.setZoom(zoom);
                            window.clearInterval(timer);
                        }
                    }, 20);
                }else{
                    geocoder ? geocoder.getLocation(address) : void 0;
                }
                map ? map.setZoom(zoom) : void 0;

            };

            $window.qqMapInit = function(){
                if(/detail/.test(window.location.href)){
                    map = new qq.maps.Map(document.getElementById("qqMapContainer"));
                }else{
                    var myOptions = {
                        center: new qq.maps.LatLng(39.916527,116.397128),
                        zoom: 4
                    };
                    map = new qq.maps.Map(document.getElementById("qqMapContainer"), myOptions);
                }

            
                // 根据经纬度 解析
                geocoder = new qq.maps.Geocoder({
                    complete: function(result){
                        map.setCenter(result.detail.location);
                        if(showInfo){
                            setInfo(result.detail);
                            showInfo = false;
                        }
                    }
                });

                //添加到提示窗
                infoWin = new qq.maps.InfoWindow({
                    map: map
                });


                // 调用 searchLocalCity 根据用户 ip 查询城市信息
                if(!/detail/.test(window.location.href)){
                    cityLocation = new qq.maps.CityService();
                    cityLocation.setComplete(function(result){
                        
                        // 根据查询结果 重新设置地图
                        map.setCenter(result.detail.latLng);
                        map.setZoom(9);
                    });
                    cityLocation.searchLocalCity();
                }
            };

            // 初始化地图
            if (!($window.qq && $window.qq.maps)) {
                var script = document.createElement("script");
                script.type = "text/javascript";
                //script.src = "https://map.qq.com/api/js?v=2.exp&callback=qqMapInit";
                script.src = "https://apis.map.qq.com/api/js?v=2.exp&callback=qqMapInit&key="+QQMapKey;
                document.body.appendChild(script);
            } else {
                qqMapInit();
            }

            function setInfo(detail){
                if(!detail.location) return;
                vm.selected.longitude = detail.location.lng;

                vm.selected.latitude = detail.location.lat;
                infoWin.open();
                infoWin.setContent('<div style="text-align:center;white-space:nowrap;margin:5px;">'+ detail.address + '</div>');
                infoWin.setPosition(detail.location);
            }
        }]
    });

app.directive('mySelect', function($parse){
    return{
        restrict: 'A',
        link: function(scope, element, attrs){
            angular.element(element).find('md-select-value').addClass('myBoxShadow');
            angular.element(element).find('span').css({'color': '#acacac', 'margin': '-3px 0 0 10px'});
            angular.element(element).find('div').css('color', '#acacac');
            angular.element(element).css('height', '35px');
            angular.element(element).find('md-select-value').css({'border-radius': '2px'});
        }
    }
})

angular.module('map').component('city',  {
        template: '<div flex layout="row">' +
        '<md-select my-select flex="1" aria-label="省" placeholder="省份" ng-model="city.select.province" ng-change="city.changeProvince()">'+
            '<md-option class="mdOption" ng-repeat="item in city.province" value="{{item}}">{{item.name}}</md-option>' +
        '</md-select>' +

        '<md-select my-select flex="2" aria-label="市" placeholder="城市" ng-disabled="!city.select.province" ng-model="city.select.city" ng-change="city.changeCity()">'+
            '<md-option class="mdOption" ng-repeat="item in city.city" value="{{item}}">{{item.name}}</md-option>' +
        '</md-select>' +

        '<md-select my-select flex="3" aria-label="区" placeholder="地区" ng-disabled="!city.select.city" ng-model="city.select.district" ng-change="city.changeDistrict()" ng-show="city.showDistrict">'+
            '<md-option class="mdOption" ng-repeat="item in city.district" value="{{item}}">{{item.fullname}}</md-option>' +
        '</md-select>' +

        '</div>',
        controllerAs: 'city',
        bindings: {
            onSelected: '&',
            selected: '<',
            district: '@'
        },
        controller:['map.service', '$rootScope', '$scope', function(Service, $rootScope, $scope){
            
            var vm = this;
            vm.select = {};
            var isEdit, int = 0;
            if(!ws.isEmptyObj(vm.selected)) isEdit = true;    
            // 是否 显示第三级
            vm.showDistrict = vm.district == 'none' ? false : true;
            
            // 初始化，获取省份列表
            Service.getById().then(function(res){
                vm.province = res.data.result[0];
                if(isEdit){
                    int++;
                    var arr = res.data.result[0];
                    for(var i in arr){
                        if(arr[i].fullname == vm.selected.province){
                            vm.select.province = JSON.stringify(arr[i]);
                            vm.changeProvince();
                            continue;
                        }
                    }
                }
            });

            vm.changeProvince = function(){
                var province = JSON.parse(vm.select.province);
                Service.getById(province.id).then(function(res){
                    vm.city = res.data.result[0];

                    if(isEdit){
                        int++;
                        var arr = vm.city;
                        for(var i in arr){
                            if(arr[i].fullname == vm.selected.city){
                                vm.select.city = JSON.stringify(arr[i]);
                                continue;
                            }
                        }
                    }else{
                        vm.select.city = JSON.stringify(vm.city[0]);
                    }
                    vm.changeCity()
                    $rootScope.getAddress(province.fullname, 9);
                    setSelected({name: 'province', value: province});
                });

                
            };
            vm.changeCity = function(){
                var city = JSON.parse(vm.select.city);
                Service.getById(city.id).then(function(res){
                    vm.district = res.data.result[0];
                    if(vm.showDistrict){
                        if(isEdit){
                            int++;
                            if(int == 3){
                                isEdit = false;
                            } 
                            var arr = vm.district;
                            for(var i in arr){
                                if(arr[i].fullname == vm.selected.district){
                                    vm.select.district = JSON.stringify(arr[i]);
                                    continue;
                                }
                            }
                        }else{
                            vm.select.district = JSON.stringify(vm.district[0]);
                        }
                        
                    }
                    $rootScope.getAddress(city.fullname, 11);

                    setSelected({name: 'city', value: city});
                    vm.changeDistrict();
                });
                
            };
            vm.changeDistrict = function(){
                var district = vm.select.district ? JSON.parse(vm.select.district) : '';
                if(district){
                    $rootScope.getAddress(district.fullname, 14);
                    setSelected({name: 'district', value: district});
                }else{
                    setSelected({name: 'district', value: ''});
                }
                if(int == 3){
                    $rootScope.$broadcast('render-map');
                }
                vm.onSelected();
            };
            
            function setSelected(obj){
                vm.selected[obj.name] = obj.value;
            }

        }]
    })
    .service('map.service', ['$http', function($http){
        this.getById = function(id){
            var id = id ? ('&id=' + id) : '';
            return $http.jsonp(QQMapUrl + 'getchildren' + '?callback=JSON_CALLBACK&output=jsonp&key=' + QQMapKey + id).then(function(data){
                return data;
            });
        }
    }]);
