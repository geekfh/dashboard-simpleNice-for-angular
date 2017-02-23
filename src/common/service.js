app.service('app.common.service', function($http, baseUrl, User, userInfo, $q,$rootScope){
    var _this = this;
    
    this.getColor = function(){
        return $http.get(baseUrl + 'colors.json').then(function(res){
            return res.data.object;
        });
    };
    this.categorys = [];
    this.getCategory = function(){
        var deferred = $q.defer();
        if(_this.categorys.length) deferred.resolve(_this.categorys);
        else $http.get(baseUrl + 'merchant/category.json').then(function(res){
            res.data = ws.changeRes(res.data);
            _this.categorys = res.data.object.category || [];
            deferred.resolve(res.data.object.category);
        });
        return deferred.promise;
    };


    // 判断公众号 分类是否能开通朋友的券
    this.canUseFriend = function(){

        // 朋友券范围
        var str_friend = '粤菜、茶餐厅、川菜、湘菜、东北菜、西北菜、火锅、自助餐、小吃、快餐、日本料理、韩国料理、东南亚菜、西餐、面包甜点、咖啡厅、江浙菜、其它美食、外卖、温泉洗浴、足疗按摩、运动健身、棋牌室、KTV、酒吧/俱乐部、艺术写真、宠物美容、美容美发、美甲、快递、宠物医疗、物业管理、家政服务、养生养护、电影票、快捷酒店、度假村、星级酒店、母婴用品、普通食品、鲜花礼品、家纺家装、钟表眼镜、日护用品、化妆品、运动户外、鞋类箱包、服饰、副食品门市、超市、购物中心/购物街、百货商场、婚庆服务、加油站、汽车维修、汽车驾校、景点门票、便利店、珠宝配饰、家居、建材五金/机械仪表、乐器、酒类、药房/药店、图书报刊杂志、数码家电、机票、船票、车票';

        // 会员卡范围
        var str_card = '粤菜、茶餐厅、川菜、湘菜、东北菜、西北菜、火锅、自助餐、小吃、快餐、日本料理、韩国料理、东南亚菜、西餐、面包甜点、咖啡厅、江浙菜、其它美食、外卖、美容美发、宠物美容、美甲、艺术写真、酒吧/俱乐部、文化文艺、展览展出、会议活动、KTV、棋牌室、运动健身、足疗按摩、温泉洗浴、婚庆服务、汽车维修、加油站、汽车驾校、汽车销售、汽车美容、家政服务、客服/售后、物业管理、医疗保健、宠物医疗、留学中介、客运、快递、养生养护、机票、船票、车票、电影票、景点门票、星级酒店、度假村、快捷酒店、客栈、百货商场、购物中心/购物街、超市、便利店、副食品门市、服饰、鞋类箱包、运动户外、化妆品、日护用品、珠宝配饰、钟表眼镜、家纺家装、建材五金/机械仪表、数码家电、乐器、鲜花礼品、普通食品、保健食品、酒类、药房/药店、母婴用品、图书报刊杂志、培训拓展、演出门票、教育学校、货运、政务民生、旅游套餐、话费/流量/宽带、水电煤缴费、有线电视缴费、广告/传媒/营销、网络技术';


        var friend_able_arr = str_friend.split('、');

        var card_able_arr = str_card.split('、');
        var primaryCategoryId, secondaryCategoryId, name;
        userInfo.get('mcht/info.json').then(function(res){
            primaryCategoryId = res.object.primaryCategoryId;
            secondaryCategoryId = res.object.secondaryCategoryId;  

            return _this.getCategory().then(function(category){
                angular.forEach(category, function(item){
                    if(item.primary_category_id == primaryCategoryId){
                        angular.forEach(item.secondary_category, function(it){
                            if(it.secondary_category_id == secondaryCategoryId){
                                name = it.category_name;
                            }
                        })
                    }
                })
                var friend_id_index = friend_able_arr.indexOf(name);
                var card_id_index = card_able_arr.indexOf(name);
                

                userInfo.canFriendsCards = friend_id_index > -1 ? true: false;
                userInfo.canMemberCards = card_id_index > -1 ? true: false;
                $rootScope.canFriendsCards = userInfo.canFriendsCards
                return userInfo.canFriendsCards;
            });
        })
    };

    this.checkCategory = function(){
        return _this.canUseFriend()
    };

    this.checkAuthority = function () {
        return $http.get(baseUrl + 'merchant/authority.json').then(function(res){
            return res.data;
        })
    };
})
.service('userInfo', function(baseUrl, $http, $q, User, $rootScope){
    var self = this;
    this.data = {};  
    this.wsUser = {};
    this.getUser = function(){
        var deferred = $q.defer();
        if(!ws.isEmptyObj($rootScope.User)){
            deferred.resolve($rootScope.User);
        }else{
            $http.get(baseUrl + 'sys/initMchtInfo.json').then(function(res){
                ws.successback(res.data, function () {
                    self.wsUser = res.data;
                    $rootScope.User = res.data;
                    $rootScope.rootMchtName = res.data.object.mchtName;
                    $rootScope.brandSuffix = res.data.object.brandSuffix;
                    $rootScope.userInfo = res.data.object;
                    $rootScope.userLoginName = res.data.object.userLoginName;
                    deferred.resolve(res.data);
                });
            })
        }
        return deferred.promise;
    };

    this.categorys = [];
    this.getCategory = function(){
        var deferred = $q.defer();
        if(self.categorys.length) deferred.resolve(self.categorys);
        else $http.get(baseUrl + 'merchant/category.json').then(function(res){
            res.data = ws.changeRes(res.data);
            self.categorys = res.data.object.category || [];
            deferred.resolve(res.data.object.category);
        });
        return deferred.promise;
    };
    this.str_friend = '粤菜、茶餐厅、川菜、湘菜、东北菜、西北菜、火锅、自助餐、小吃、快餐、日本料理、韩国料理、东南亚菜、西餐、面包甜点、咖啡厅、江浙菜、其它美食、外卖、温泉洗浴、足疗按摩、运动健身、棋牌室、KTV、酒吧/俱乐部、艺术写真、宠物美容、美容美发、美甲、快递、宠物医疗、物业管理、家政服务、养生养护、电影票、快捷酒店、度假村、星级酒店、母婴用品、普通食品、鲜花礼品、家纺家装、钟表眼镜、日护用品、化妆品、运动户外、鞋类箱包、服饰、副食品门市、超市、购物中心/购物街、百货商场、婚庆服务、加油站、汽车维修、汽车驾校、景点门票、便利店、珠宝配饰、家居、建材五金/机械仪表、乐器、酒类、药房/药店、图书报刊杂志、数码家电、机票、船票、车票';

    this.str_card = '粤菜、茶餐厅、川菜、湘菜、东北菜、西北菜、火锅、自助餐、小吃、快餐、日本料理、韩国料理、东南亚菜、西餐、面包甜点、咖啡厅、江浙菜、其它美食、外卖、美容美发、宠物美容、美甲、艺术写真、酒吧/俱乐部、文化文艺、展览展出、会议活动、KTV、棋牌室、运动健身、足疗按摩、温泉洗浴、婚庆服务、汽车维修、加油站、汽车驾校、汽车销售、汽车美容、家政服务、客服/售后、物业管理、医疗保健、宠物医疗、留学中介、客运、快递、养生养护、机票、船票、车票、电影票、景点门票、星级酒店、度假村、快捷酒店、客栈、百货商场、购物中心/购物街、超市、综合电商、便利店、副食品门市、服饰、鞋类箱包、运动户外、化妆品、日护用品、珠宝配饰、钟表眼镜、家纺家装、建材五金/机械仪表、数码家电、乐器、鲜花礼品、普通食品、保健食品、酒类、药房/药店、母婴用品、图书报刊杂志、培训拓展、演出门票、教育学校、货运、培训机构、政务民生、旅游套餐、话费/流量/宽带、水电煤缴费、有线电视缴费、广告/传媒/营销、网络技术';

    this.friend_able_arr = this.str_friend.split('、');

    this.card_able_arr = this.str_card.split('、');
    this.checkCategory = function(primaryCategoryId, secondaryCategoryId, cateName){
        var deferred = $q.defer();
        if(cateName){
            var friend_id_index = self.friend_able_arr.indexOf(cateName);
            var card_id_index = self.card_able_arr.indexOf(cateName);

            var canFriendsCards = friend_id_index > -1 ? true: false;
            var canMemberCards = card_id_index > -1 ? true: false;
            deferred.resolve({firend: canFriendsCards, card: canMemberCards});
        }else{
            if(!primaryCategoryId) deferred.resolve({firend: false, card: false});
            self.getCategory().then(function(category){
                angular.forEach(category, function(item){
                    if(item.primary_category_id == primaryCategoryId){
                        angular.forEach(item.secondary_category, function(it){
                            if(it.secondary_category_id == secondaryCategoryId){
                                name = it.category_name;
                            }
                        })
                    }
                })
                var friend_id_index = self.friend_able_arr.indexOf(name);
                var card_id_index = self.card_able_arr.indexOf(name);
                

                var canFriendsCards = friend_id_index > -1 ? true: false;
                var canMemberCards = card_id_index > -1 ? true: false;
                
                deferred.resolve({firend: canFriendsCards, card: canMemberCards});
            });
        }
        return deferred.promise;
    }
    this.user = {};
    this.getCommon = function(){
        var deferred = $q.defer();
        if(!ws.isEmptyObj(self.user)){
            deferred.resolve(self.user);
        }else{
            $http.get(baseUrl + 'mcht/info.json').then(function(res){
                ws.successback(res.data, function () {
                    self.user = res.data;
                    deferred.resolve(res.data);
                })
            })
        } 
        return deferred.promise;
    }
    this.getWigets = function(){
        var deferred = $q.defer();
        if($rootScope.powers && $rootScope.powers.length){
            deferred.resolve($rootScope.powers);
        }else{
            $http.get(baseUrl + 'sys/wigets.json').then(function(res){
                ws.successback(res.data, function () {
                    $rootScope.powers = res.data.object;
                    deferred.resolve(res.data.object);
                })
            })
        }
        return deferred.promise;
    }
    this.get = function(url, params, isParams, isLocal){
        params = params || {};
        var data = isParams ? {params: params} : params
        var deferred = $q.defer();
        var src = /http/.test(url) ? url : baseUrl + url;
        $http.get(src, data)
          .then(function (res) {
            ws.successback(res.data, function () {
              deferred.resolve(res.data);
            }, isLocal);
          })
          .then(function(res){
              deferred.reject(res);
          });
        return deferred.promise;
    };
    this.post = function(url, params, isParams, isMultipart){
        params = params || {};
        var data = isParams ? {params: params} : params;
        var deferred = $q.defer();
        var src = /http/.test(url) ? url : baseUrl + url;
        var obj = isMultipart ? {transformRequest: angular.identity, headers: { 'Content-Type': undefined } } : {};
        $http.post(src, data, obj)
          .then(function (res) {
            ws.successback(res.data, function () {
              deferred.resolve(res.data);
            });
          })
          .then(function(res){
              deferred.reject(res);
          });
        return deferred.promise;
    };
    this.del = function(url, params, isParams){
        params = params || {};
        var data = isParams ? {params: params} : params
        var deferred = $q.defer();
        var src = /http/.test(url) ? url : baseUrl + url
        $http.delete(src, data)
          .then(function (res) {
            ws.successback(res.data, function () {
              deferred.resolve(res.data);
            });
          })
          .then(function(res){
              deferred.reject(res);
          });
        return deferred.promise;
    };
    this.put = function(url, params, isParams){
        params = params || {};
        var data = isParams ? {params: params} : params
        var deferred = $q.defer();
        var src = /http/.test(url) ? url : baseUrl + url
        $http.put(src, data)
          .then(function (res) {
            ws.successback(res.data, function () {
              deferred.resolve(res.data);
            });
          })
          .then(function(res){
              deferred.reject(res);
          });
        return deferred.promise;
    };
})
.service('$alert', ['$timeout', function($timeout){
    return function(params){
        var msg = params.msg;
        var time = params.time || 1700;
        var cb = params.cb || undefined;
        var aid = 'alert_' + (new Date).getTime();
        var alertElement = angular.element('<div id="'+aid +'" class="app-alert">');

        angular.element(document).find('body').append( alertElement.html(msg) ) ;

        $timeout(function(){
            alertElement.remove();
            if(cb) cb();
        }, time);
        
    }
}])
.service('$date', function(){

    this.format = function (date, n){
        var y,m,d,str,string;
        if(!date){
            return {
                y:'',
                m: '',
                str: '',
                string: '',
                time: ''
            }
        }

        n = n*1000*60*60*24 || 0;
        date = new Date(date);
        if(n) date = new Date(date.getTime() + n);

        y= date.getFullYear();
        m= date.getMonth() + 1;
        d= date.getDate();


        str= y + '-' + (m>9?m: '0'+m) +'-' + (d>9?d: '0'+d);
        string = String(y) + (m>9?m: '0'+m) + (d>9?d: '0'+d);

        return {
            y: y,
            m: m,
            str: str,
            string : string,
            time: new Date(str)
        }
    };

})
.service('downloadFile',function(){
    var h5Down = !/Trident|MSIE/.test(navigator.userAgent);
    // try{
    // 	h5Down = document.createElement("a").hasOwnProperty("download");
    // } catch(e){
    // 	h5Down = document.createElement("a").download;
    // }

    /**
     * 在支持 download 属性的情况下使用该方法进行单个文件下载
     * @param  {String} fileName
     * @param  {String|FileObject} contentOrPath
     * @return {Null}
     */
    function downloadFile(fileName, contentOrPath){
        var aLink = document.createElement("a"),
            //evt = document.createEvent("HTMLEvents"),
            evt = document.createEvent("MouseEvents"),
            isData = contentOrPath ? contentOrPath.slice(0, 5) === "data:" : '',
            isPath = contentOrPath ? contentOrPath.lastIndexOf(".") > -1 : '';

        // 初始化点击事件
        //evt.initEvent("click", true, false);

        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, aLink);


        // 添加文件下载名
        aLink.download = fileName;

        // 如果是 path 或者 dataURL 直接赋值
        // 如果是 file 或者其他内容，使用 Blob 转换
        aLink.href = isPath || isData ? contentOrPath
            : URL.createObjectURL(new Blob([contentOrPath]));

        aLink.dispatchEvent(evt);
    }

    /**
     * [IEdownloadFile description]
     * @param  {String} fileName
     * @param  {String|FileObject} contentOrPath
     */
    function IEdownloadFile(fileName, contentOrPath, bool){
        var isImg = contentOrPath.slice(0, 10) === "data:image",
            ifr = document.createElement('iframe');

        ifr.style.display = 'none';
        ifr.src = contentOrPath;

        document.body.appendChild(ifr);

        // dataURL 的情况
        isImg && ifr.contentWindow.document.write("<img src='" +
            contentOrPath + "' />");

        // 保存页面 -> 保存文件
        // alert(ifr.contentWindow.document.body.innerHTML)
        if(bool){
            ifr.contentWindow.document.execCommand('SaveAs', false, fileName);
            document.body.removeChild(ifr);
        } else {
            setTimeout(function(){
                ifr.contentWindow.document.execCommand('SaveAs', false, fileName);
                document.body.removeChild(ifr);
            }, 0);
        }
    }

    /**
     * [parseURL description]
     * @param  {String} str [description]
     * @return {String}     [description]
     */
    function parseURL(str){
        if(str)
            return str.lastIndexOf("/") > -1 ? str.slice(str.lastIndexOf("/") + 1) : str;
        else
            return '';
    }

    this.download = function(files){
        // 选择下载函数
        var downer = h5Down ? downloadFile : IEdownloadFile;

        // 判断类型，处理下载文件名
        if(files instanceof Array) {
            for(var i = 0, l = files.length; i < l ; i++)
                // bug 处理
                downer(parseURL(files[i]), files[i], true);
        } else if(typeof files === "string") {
            downer(parseURL(files), files);
        } else {
            // 对象
            for(var file in files) downer(file, files[file]);
        }
    }
});