app.directive('preColor', ['app.common.service', function(Service){
    return {
        scope: {
            'colorName': '='
        },
        template: '<span class="detail-color" ng-style="{background: colorName}"></span>',
        controllerAs: 'preColor',
        controller: function($scope){
            var vm  = this;
        }
    }
}])
.directive('categoryView', ['app.common.service','userInfo', function(Service,userInfo){
    return {
        restrict: 'E',
        scope: {},
        bindToController: {
            category: '='
        },
        template: '{{categoryCtrl.primary_category}} &nbsp; {{categoryCtrl.secondary_category}}',
        controllerAs: 'categoryCtrl',
        controller: function(){
            var vm = this;

            /*Service.getCategory().then(function(res){
                res.forEach(function(p){

                    if(p.primary_category_id == vm.category.primary){
                        vm.primary_category = p.category_name;

                        p.secondary_category.forEach(function(s){
                            if(s.secondary_category_id == vm.category.secondary){
                                vm.secondary_category = s.category_name;
                            }
                        });

                    }else{

                    }
                })
            });*/
            if(vm.category.primary && vm.category.secondary){
                vm.primary_category = vm.category.primary;
                vm.secondary_category = vm.category.secondary;
            }else{
                userInfo.get('merchant/applyInfo').then(function(res){
                    vm.primary_category = res.object.primaryCategoryId;
                    vm.secondary_category = res.object.secondaryCategoryId;
                })
            }

        }
    }
}])
.directive('upload', function(baseUrl, $http){
    return {
        restrict: 'E',
        require: 'ngModel',
        replace: true,
        scope: {
            name: '@',
            required: '=ngRequired',
            imgShow: '@',
            size: '@',
            onCancel: '&'
        },
        transclude: true,
        template: '<div class="upload-directive-wrapper">' +
        '<label class="upload-directive" ng-hide="imgShow && hasImg">' +
        '<span ng-transclude></span>' +
        '<input name="name" type="file" ng-required="required"> </label>' +
        '<img ng-src="{{imgData}}" alt="" ng-show="hasImg">' +
        '<br ng-hide="imgShow && hasImg">{{fileName}}' +
        '<p class="app-tips-err cancel-btn" ng-show="hasImg && imgShow" ng-click="cancel()">取消</p> ' +
        '<div class="app-tips-err">{{error}}</div>' +
        '</div>',
        link: function(scope, element, attrs, ngModel){
            scope.cancel = function(){
                ngModel.$setViewValue('');
                scope.fileName = '';
                scope.hasImg = false;
                scope.onCancel();
            };

            element.find('input').bind('change', function(e){
                var file = e.target.files[0];

                scope.fileName = file.name;

                if(scope.name == 'logo'){
                    if(!(/(jpeg|png)/.test(file.type))){
                        scope.error = '请上传正确格式的图片文件';
                        ngModel.$setViewValue('');
                        e.target = null;

                        ngModel.$setValidity('file-error', false);
                        return;
                    }
                }else{
                    if(!(/(jpeg)/.test(file.type))){
                        scope.error = '请上传正确格式的图片文件';
                        ngModel.$setViewValue('');
                        e.target = null;

                        ngModel.$setValidity('file-error', false);
                        return;
                    }
                }

                if(scope.name == 'logo' || scope.size == '1m'){
                    if(file.size > 1000000){
                        scope.error = '文件大小超过 1M';
                        ngModel.$setViewValue('');
                        ngModel.$setValidity('file-error', false);
                        e.target = null;
                        return
                    }
                }else{
                    if(file.size > 2050000){
                        scope.error = '文件大小超过 2M';
                        ngModel.$setViewValue('');
                        ngModel.$setValidity('file-error', false);
                        e.target = null;
                        return
                    }
                }

                scope.error ='';
                scope.hasImg = true;

                ngModel.$setValidity('file-error', true);
                showImg(file);

                ngModel.$setViewValue(file);
            });

            function showImg(file){

                var reader = new FileReader();
                reader.onload = function() {
                    scope.$parent.imgData = reader.result;
                    if(scope.imgShow == 'show'){
                        scope.imgData = reader.result;
                    }
                    scope.$apply();
                };
                
                reader.readAsDataURL(file);
            }
        }
    }
})
.directive('myupload', function(baseUrl, $http, $parse, $rootScope){
    return {
        restrict: 'E',
        require: 'ngModel',
        replace: true,
        scope: {
            pic: '=pic',
            uploadurl: '=uploadurl',
            noname: '=noname'
        },
        transclude: true,
        template: '<div>'+
        '<div class="upload-directive-wrapper">' +
        '<label id="uploadLabel" class="upload-directive" ng-hide="hasImg">' +
        '<span ng-transclude></span>' +
        '<input id="fileUpload" name="name" type="file" ng-required="required"> </label>' +
        '<img style="min-width: 100px;" ng-src="{{pic.qiniu_file_url}}" alt="" ng-show="hasImg">' +

        '<br ng-show="hasImg"><span ng-hide="noname">{{pic.qiniu_file_name | limitTo: textNum}}{{pic.qiniu_file_name.length > textNum ? "..." : ""}}</span>' +

        '<p class="delImg" ng-show="hasImg" ng-click="cancel()"></p> ' +
        '</div>' +
        '<div class="app-tips-err" ng-bind="error"></div>'+
        '</div>',
        link: function(scope, element, attrs, ngModel){
            scope.pic = scope.pic || {};
            var count = 1;
            var num = 1024 * 1024;
            var size = attrs.size || 1;
            var type = attrs.type || '1';
            var isPic = true;
            scope.textNum = attrs.textNum || 12;
            if(attrs.isPic) isPic = $parse(attrs.isPic)(scope);
            
            scope.$watch('pic.qiniu_file_url', function(val){
                if(val){
                    scope.hasImg = true;
                }else{
                    scope.hasImg = false;
                }
            })
            scope.cancel = function(){
                if(attrs.inDialog){
                    return scope.pic = {}, scope.$emit('removePic');
                }
                ws.noAjaxDialog('确认删除该图片吗?', function(){
                    scope.pic = {};
                })
            };
            scope.$watch('pic.qiniu_file_url', function(val){
                if(val){
                    ngModel.$setValidity('required', true);
                }else{
                    ngModel.$setValidity('required', false);
                }
            });
            element.find('input').bind('change', function(e){
                /*count++;
                var labelEle = element.find('label');
                 var inputEle = element.find('input');
                labelEle[0].removeChild(inputEle[0]);
                var newInput = document.createElement('input');
                newInput.setAttribute('name','name');
                newInput.setAttribute('type','file');
                newInput.setAttribute('ng-required','required');
                newInput.setAttribute('title',count);
                labelEle[0].appendChild(newInput);*/
                //$("#fileUpload").replaceWith('<input id="fileUpload" name="name" type="file" ng-required="required" title="'+count+'">')

                var file = e.target.files[0];
                this.value = '';
                if(!(/(jpeg|png|application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet)/.test(file.type)) && file.type != ''){
                    scope.error = isPic ? '当前图片不符合要求，仅支持.jpg .png格式图片' : '请上传正确格式的excel文件';
                    e.target = null;
                    return scope.$apply();
                }
                if(file.size > size * num){
                    scope.error = isPic ? '当前图片不符合要求，仅支持大小不超过'+size+ 'M的图片':'文件大小超过 ' +size+ 'M';
                    e.target = null;
                    return scope.$apply();
                }
                
                //文件
                if(/(application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet|'')/.test(file.type) || file.type == ''){
                    scope.pic.qiniu_file_name = file.name;
                    scope.pic.qiniu_file_url = 'http://7xogpz.com2.z0.glb.qiniucdn.com/excel.png';
                    scope.error ='';
                    scope.hasImg = true;
                    scope.pic.file = file;
                    return scope.$apply();
                }
                if(/(jpeg|png)/.test(file.type)){
                    if(isPic){
                        scope.error ='';
                        upload(file);
                    }else{
                        scope.error = '请上传正确格式的excel文件';
                        e.target = null;
                        return scope.$apply();
                    }
                }

            });

            function showImg(obj){
                scope.pic = obj;
                scope.hasImg = true;
            }
            function upload(file){
                var formData = new FormData();
                formData.append('file', file);
                formData.append('type', type);
                //微信无关的图片 type=1
                //formData.append('type', 1);
                if(scope.uploadurl){
                    var url = scope.uploadurl;
                }else{
                    var url = isPic ? 'cards/uploadFile' : 'memberCardUsers/import';
                }
                $http.post(baseUrl + url, formData, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(function(res){
                    ws.successback(res.data, function(){
                        if(isPic){
                            if(res.data.object[0])
                                showImg(res.data.object[0]);
                            else
                                ws.alert({msg:'上传失败'})
                        }else{
                            $rootScope.$broadcast('uploadSuccess');
                        }
                    })
                })
            }
        }
    }
})
.directive('myuploadimg', function(baseUrl, $http, userInfo){
        return {
            restrict: 'E',
            require: 'ngModel',
            replace: true,
            scope: {
                pic: '=pic',
                ngModel : '=ngModel'
            },
            transclude: true,
            template: '<div class="">' +
            '<img style="width: 100px;height:100px;" ng-src="{{ngModel || pic.s300LogoUrl}}" alt="" >' +
            '<label id="uploadLabel" class="upload-directive" style="margin-top:0;margin-left:10px;float:right;">' +
            '<span ng-transclude></span>' +
            '<input id="fileUpload" name="name" type="file" ng-required="required"> </label>' +
            '<div class="app-tips-err" ng-bind="error"></div>' +
            '</div>',
            link: function(scope, element, attrs){
                scope.pic = scope.pic || {};
                var count = 1;
                var num = 1024 * 1024;
                var size = attrs.size || 1;
                var isPic = true;

                element.find('input').bind('change', function(e){
                    var file = e.target.files[0];
                    if(!(/(jpg|gif|bmp|jpeg|png|tiff)/.test(file.type)) && file.type != ''){
                        scope.error = '请上传正确格式的图片文件';
                        e.target = null;
                        return scope.$apply();
                    }
                    if(file.size > size * num){
                        scope.error = '文件大小超过 ' +size+ 'M';
                        e.target = null;
                        return scope.$apply();
                    }

                    if(/(jpg|gif|bmp|jpeg|png|tiff)/.test(file.type)){
                        if(isPic){
                            scope.error ='';
                            upload(file);
                        }
                    }
                });

                function showImg(obj){
                    scope.ngModel = '';
                    scope.pic = obj;
                }
                function upload(file){
                    var formData = new FormData();
                    formData.append('logoFile', file);
                    //formData.append('type', type);
                    //微信无关的图片 type=1
                    //formData.append('type', 1);
                    userInfo.post('merchant/info', formData, '',true).then(function(res){
                        if(isPic) {
                            showImg(res.object);
                            ws.alert({msg: '修改成功'});
                        }
                    })
                }
            }
        }
    })
.directive('uploadimg', function(baseUrl, $http, $parse, $rootScope, $alert){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            pic: '=pic',
            nopic: '=nopic'
        },
        transclude: true,
        templateUrl: 'tpl/settings/cardAuthenUpload.html',
        link: function(scope, element, attrs, ngModel){
            scope.loadword = '上传图片';
            scope.pic = scope.pic || '';
            var num = 1024 * 1024;
            var size = attrs.size || 1;
            var type = attrs.type || '1';
            element.find('input').bind('change', function(e){
                var file = e.target.files[0];
                if(!(/(jpeg|png|application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet)/.test(file.type)) && file.type != ''){
                    scope.error = isPic ? '请上传正确格式的图片文件' : '请上传正确格式的excel文件';
                    e.target = null;
                    return scope.$apply();
                }
                if(file.size > size * num){
                    scope.error = '文件大小超过 ' +size+ 'M';
                    $alert({
                        msg: scope.error
                    });
                    e.target = null;
                    return scope.$apply();
                }

                //文件
                if(/(application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet|'')/.test(file.type) || file.type == ''){
                    scope.pic.qiniu_file_name = file.name;
                    scope.pic.qiniu_file_url = 'http://7xogpz.com2.z0.glb.qiniucdn.com/excel.png';
                    scope.error ='';
                    scope.hasImg = true;
                    scope.pic.file = file;
                    return scope.$apply();
                }
                if(/(jpeg|png)/.test(file.type)){
                    scope.error ='';
                    scope.hasImg = true;
                    upload(file);
                    e.target.value = '';
                }

            });
            element.find('img').bind('click', function(){
                element.find('input')[0].click();
            })
            function showImg(obj){
                scope.pic = obj;
                scope.nopic = false;
                scope.loadword = '重新上传';
            }
            function upload(file){
                var formData = new FormData();
                formData.append('file', file);
                formData.append('type', type);
                //微信无关的图片 type=1
                //formData.append('type', 1);
                var url = 'file/uploadImg';
                $http.post(baseUrl + url, formData, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(function(res){
                    ws.successback(res.data, function(){
                        showImg(res.data.object)
                    })
                })

            }
        }
    }
})
.directive('han', function(){
    return {
        restrict: 'A',
        scope: {
            value: '=ngModel',
            hanLength: '=han'
        },
        require: 'ngModel',
        link: function(scope, element, attr, ngModel){
            var length = scope.hanLength;
            var charCountEl = angular.element('<div class="md-char-counter">');
            var name = element[0].nodeName;
            if(name == 'INPUT'){
                element.parent().prepend(charCountEl);
            }
            if(name == 'TEXTAREA'){
                element.after(charCountEl);
            }

            scope.$watch('value',function(current){
                renderCharCount(countHan(current || ''));
                /*if(ws.myBrowser().isChrome){
                    if(countHan(current || '') > length){
                        ngModel.$setValidity('han', false);
                        console.log('validity')
                    }
                }*/

            });
            renderCharCount(countHan(scope.value || ''));

            /*angular.element(element).attr('maxlength', length)*/
            /*scope.$watch('value', function(){
                console.log(scope.value);
                if(countHan(scope.value || '') > length){
                    ngModel.$setValidity('han', false);
                    scope.value = scope.value.substr(0,scope.value.length -1);
                    console.log(scope.value + ':' + scope.value.length);
                    //console.log(scope.value);
                }else{
                    ngModel.$setValidity('han', true);
                }
                renderCharCount(countHan(scope.value || ''));
                console.log(scope.value);

            });*/

            function countHan(str){
                var totalCount = 0;
                for(var i=0; i<str.length; i++){

                    var c = str.charCodeAt(i);

                    if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)){
                        totalCount++;
                    }
                    else{
                        totalCount+=2;
                    }
                }
                return totalCount;
            }

            function renderCharCount(num){
                charCountEl.text(Math.floor(num/2) + '/' + length/2);
            }

            element.on('keyup',function(){
                if(countHan(scope.value || '') > length){
                    showValue(scope.value);
                }else{
                    ngModel.$setValidity('han', true);
                }
                renderCharCount(countHan(scope.value || ''));
                console.log(scope.value, 'render');
            });

            element.on('blur',function(){
                if(countHan(scope.value || '') > length){
                    showValue(scope.value);
                }else{
                    ngModel.$setValidity('han', true);
                }
                renderCharCount(countHan(scope.value || ''));
                console.log('blur')
            });

            function showValue(value){
                if(countHan(value || '') > length){
                    ngModel.$setValidity('han', false);
                    showValue(value.substr(0,value.length -1));
                    console.log(scope.value, '截断后');
                }else{
                    ngModel.$setValidity('han', true);
                    scope.$apply(function(){
                        scope.value = value;
                    })
                }
            }
        }
    }
})
//输入框右侧关闭按钮
.directive('clearInput',function(){
    return{
        restrict : 'E',
        scope : {
            value : '='
        },
        template : '<span style="position: absolute;right: 10px;top: 10px;"><img src="http://7xogpz.com2.z0.glb.qiniucdn.com/friendCard__1475059918714.png" alt=""></span>',
        link : function(scope, element, attr){
            element.bind('click',function(){
                scope.$apply(function() {
                    scope.value = "";
                });
            });
            element.bind('mouseover',function(){
                element.css('cursor','pointer');
            });
            scope.$watch('value',function(current){
                if(!current)
                    element.css('display','none');
                else
                    element.css('display','block');

            })

        }
    }
})
//codehan 另外加的输入框限制字符数量的指令，限制不能输入中文，数量以字节为准。
.directive('codehan', function(){
    return {
        restrict: 'A',
        scope: {
            value: '=ngModel',
            hanLength: '=codehan'
        },
        require: 'ngModel',
        link: function(scope, element, attr, ngModel){
            var length = scope.hanLength;
            var charCountEl = angular.element('<div class="md-char-counter">');
            var name = element[0].nodeName;
            if(name == 'INPUT'){
                element.parent().prepend(charCountEl);
            }
            if(name == 'TEXTAREA'){
                element.after(charCountEl);
            }

            angular.element(element).attr('maxlength', length)
            scope.$watch('value', function(){
                if(scope.value){
                    scope.value = scope.value.replace(/[^\w\.\/]/g,'');//只能输入英文和数字
                }
                if(countHan(scope.value || '') > length){
                    ngModel.$setValidity('codehan', false);
                }else{
                    ngModel.$setValidity('codehan', true);
                }
                charCountEl.text(countHan(scope.value || '') + '/' + length);

            });

            function countHan(str){
                var totalCount = 0;
                for(var i=0; i<str.length; i++){

                    var c = str.charCodeAt(i);

                    if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)){
                        totalCount++;
                    }
                    else{
                        totalCount+=2;
                    }
                }
                return totalCount;
            }

        }
    }
});
//日期选择器样式修复
app.directive('myDatepicker', function($parse){
    return {
        restrict: 'A',
        link: function(scope, element, attr){
           var int = attr.myDatepicker;
           angular.element(element).find('input').css('text-indent', int + 'px'); 
        }
    }
});
app.directive('myPrice', function(){
    return {
       restrict: 'A',
       require: 'ngModel',
       link: function (scope, elem, attr, ctrl) {
        var num = Number(attr.myPrice) || 1;
        function formatter(value) {
           if(value == 0) return 0; 
           if (!value) return null;
           if (typeof value === 'string') value = Number(value);
           return value/num;
        }

        function parser(val) {
            if(!val && val != 0) return null;
            return val * num;
        }

        ctrl.$formatters.push(formatter);
        ctrl.$parsers.push(parser);
      }
    };
})
//字符过滤器
app.directive('myLimit', function($parse){
    return {
        restrict: 'A',
        link: function(scope, element, attr){
           var array = $parse(attr.myLimit)(scope);         
           var val = $parse(array[0])(scope); // 保存需要操作的字符串
           
           //if(!val) return element.text('---'), element.css('text-align', 'center');
           if(!val) return element.text('---');
           var total = array[1] * 2;
           var chineseLength = 0;
           if(/[\u2E80-\u9FFF]/.test(val)){
                chineseLength = val.match(/[\u2E80-\u9FFF]/g).length;
           }
           var totalLength = chineseLength + val.length; //得到总字符的个数
           if(totalLength > total){
                var str = '';
                var ii = 0;
                for(var i in val){
                    if(/[\u2E80-\u9FFF]/.test(val[i])){
                        ii += 2;
                    }else{
                        ii += 1;
                    }
                    if(ii > total){
                        continue;
                    }else{
                        str += val[i];
                    }
                }
                str += '...';
                // 添加标题
                element.attr('title', val);
                element.text(str);
            }else{
                element.text(val);
            }
        }
    }
})
//正则验证规则
app.directive('myReg', function(){
    return{
       restrict: 'A',
       link: function(scope, element, attr){
            var str = attr.myReg;
            var reg;
            var int;
            switch(str){
                case 'mobile':
                    reg = '/^(1[3|4|5|7|8][\\d]{9}|0[\\d]{2,3}-[\\d]{7,8}|400[-]?[\\d]{3}[-]?[\\d]{4})$/'; //手机号码
                    int = 13;
                    break;
                case 'number':
                    reg = '/^([1-9]\\d{0,6}(\\.\\d{1,2})?|0\\.[1-9][0-9]?|0\\.[0-9][1-9])$/';  //0.01-9999999.99
                    int = 10;
                    break;
                case 'money':
                    reg = '/^([1-9]\\d{0,6}(\\.\\d{1,2})?|0\\.[1-9][0-9]?|0\\.[0-9][1-9])$/';  //0.01-9999999.99
                    int = 10;
                    break;
                case 'int':
                    reg = '/^[1-9][0-9]{0,6}$/'; //1-9999999
                    int = 7;
                    break;
                case 'intAndZero':
                    reg = '/^([1-9][0-9]{0,6}|0)$/';   //0-9999999
                    int = 7;
                    break;
                case 'percent':
                    reg = '/^(([1-9][0-9]{0,1}|0)(\\.[0-9]{1,2})?|100(\\.[0]{1,2})?)$/'; //0.01-99.99
                    int = 7;
                    break;
                case 'code':
                    reg = '/^[0-9a-zA-Z]{0,4}$/';  //code编码
                    int = 4;
                    break;
                case 'email':
                    reg = '/^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$/'; //email
                    break;   
                case 'chinese':
                    reg = '/^[\\u2E80-\\u9FFF]+$/';  //中文
                    break; 
                case 'name':
                    reg = '/^[\\u2E80-\\u9FFF]{2,5}$/';  //2-5个中文
                    int = 5;
                    break;
                case 'business':
                    reg = '/^([0|1][0-9]|2[0|1|2|3]):[0|3]0-([0|1][0-9]|2[0|1|2|3]):[0|3]0$/'; // 00:00-23:30
                    int = 11;
                    break;
                case 'businessTime':
                    reg = '/^([0|1][0-9]|2[0|1|2|3]):[0|3]0$/'; // 00:00-23:30
                    int = 5;
                    break;
                case 'discount':
                    reg = '/^([1-9](\\.[0-9])?|0\\.[1-9])$/'; // 0.1-9.9   
                    int = 3;
                    break;   
                case 'intCaseChinese':
                    reg = '/^[\\w|\\u2E80-\\u9FFF|-]*$/'; // 中文 ABC  abd _ - 123
                    break;    
                default :
                    int = 255;                                 
            }
            if(reg) attr.ngPattern = reg;
            if(int) angular.element(element).attr('maxlength', int);
       } 
    }
})
//margin 距离设置
app.directive('margin', function($parse){
    return{
        restrict: 'A',
        link: function(scope, elem, attr){
            var arr = [];
            if(attr.margin){
                arr = $parse(attr.margin)(scope);
            }
            if(arr.length){
                angular.element(elem).css('margin', arr[0] + 'px ' + arr[1] + 'px ' + arr[2] + 'px ' + arr[3] + 'px')
            }
        }
    }
})
//日期控件
app.directive('searchDay', function(tplUrl, $rootScope, $parse, $filter){
    return{
        restrict: 'E',
        templateUrl: tplUrl + 'tpl/common/select_day.html',
        scope: {
            date: '=',
            disabled: '=ngDisabled',
            isCard:'=isCard'
        },
        link: function(scope, elem, attr){
            scope.itemName = attr.itemName ? attr.itemName : '查询日期';
            if(attr.ifSearchTime == 'true'){
                scope.ifSearchTime = attr.ifSearchTime;
                scope.selectTimeList_01 =  [
                    {name : "00:00", value : "000000"},
                    {name : "01:00", value : "010000"},
                    {name : "02:00", value : "020000"},
                    {name : "03:00", value : "030000"},
                    {name : "04:00", value : "040000"},
                    {name : "05:00", value : "050000"},
                    {name : "06:00", value : "060000"},
                    {name : "07:00", value : "070000"},
                    {name : "08:00", value : "080000"},
                    {name : "09:00", value : "090000"},
                    {name : "10:00", value : "100000"},
                    {name : "11:00", value : "110000"},
                    {name : "12:00", value : "120000"},
                    {name : "13:00", value : "130000"},
                    {name : "14:00", value : "140000"},
                    {name : "15:00", value : "150000"},
                    {name : "16:00", value : "160000"},
                    {name : "17:00", value : "170000"},
                    {name : "18:00", value : "180000"},
                    {name : "19:00", value : "190000"},
                    {name : "20:00", value : "200000"},
                    {name : "21:00", value : "210000"},
                    {name : "22:00", value : "220000"},
                    {name : "23:00", value : "230000"}
                ];
                scope.selectTimeList_02 =  [
                    {name : "01:00", value : "010000"},
                    {name : "02:00", value : "020000"},
                    {name : "03:00", value : "030000"},
                    {name : "04:00", value : "040000"},
                    {name : "05:00", value : "050000"},
                    {name : "06:00", value : "060000"},
                    {name : "07:00", value : "070000"},
                    {name : "08:00", value : "080000"},
                    {name : "09:00", value : "090000"},
                    {name : "10:00", value : "100000"},
                    {name : "11:00", value : "110000"},
                    {name : "12:00", value : "120000"},
                    {name : "13:00", value : "130000"},
                    {name : "14:00", value : "140000"},
                    {name : "15:00", value : "150000"},
                    {name : "16:00", value : "160000"},
                    {name : "17:00", value : "170000"},
                    {name : "18:00", value : "180000"},
                    {name : "19:00", value : "190000"},
                    {name : "20:00", value : "200000"},
                    {name : "21:00", value : "210000"},
                    {name : "22:00", value : "220000"},
                    {name : "23:00", value : "230000"},
                    {name : "24:00", value : "240000"}
                ];
                scope.date.startTime = '000000';
                scope.date.endTime = '240000';
                scope.$watch('date.startTime', function(val){
                    contrastTime('start');
                })
                scope.$watch('date.endTime', function(val){
                    contrastTime('end');
                })
            }
            scope.status = attr.status == 'normal' ? 'normal' : 'search';
            scope.date.dayIndex = scope.date.dayIndex || 0;
            var maxDay = attr.maxDay || 61;
            scope.date.maxDay = maxDay;
            scope.firstStyle = attr.firstStyle ? $parse(attr.firstStyle)(scope) : {};
            scope.secondStyle = attr.secondStyle ? $parse(attr.secondStyle)(scope) : {};
            var today = new Date();
            var numTime = 3600 * 24 * 1000;
            if(scope.status == 'search'){
                //默认最近七天
                scope.date.begin = new Date(+new Date() - 6 * numTime);
                scope.date.end = new Date();
                //scope.date.begin = scope.date.end = today;
                scope.date.maxDate = today;
                /*scope.date.minDate = new Date(+today - maxDay * numTime);*/
            }else{

                //添加状态
                if(!$rootScope.isEdit){
                    scope.date.beginMinDate = scope.date.endMinDate = today;
                    scope.date.beginMaxDate = scope.date.endMaxDate = new Date(+today + maxDay * numTime);  
                }else{
                    var is_old = scope.date.begin_old ? true : false;

                    scope.date.begin = new Date(scope.date.begin);
                    scope.date.end = new Date(scope.date.end);
                    scope.date.begin_old = is_old ? new Date(scope.date.begin_old) : scope.date.begin;

                    var disance = +scope.date.begin_old - +today;
                    //编辑状态下 开始时间小于今天的时间
                    if(disance <= numTime){
                        scope.isDisabled1 = true;

                        scope.date.endMinDate = today;
                        scope.date.endMaxDate = new Date(+new Date(scope.date.begin_old) + maxDay * numTime); 
                    }else{
                        scope.isDisabled1 = false;
                        scope.date.beginMinDate = today;
                        scope.date.beginMaxDate = scope.date.begin_old;

                        scope.date.endMinDate = today;
                        scope.date.endMaxDate = new Date(+new Date(today) + maxDay * numTime);  
                    }
                    console.log(scope.date.begin)
                    console.log(scope.date.end)
                }  
            }
            scope.$watch('disabled',function(current){
                if(typeof current == 'boolean'){
                    scope.isDisabled1 = scope.isDisabled2 = current;
                    /*if(current){
                        elem.find('md-datepicker').attr('required',false);
                    }else{
                        elem.find('md-datepicker').attr('required' , true);
                    }*/
                }

            })
            scope.changeDay = function(int){
                scope.date.startTime = '000000';
                scope.date.endTime = '240000';

                scope.date.dayIndex = int;
                switch(int){
                    case 0:
                    scope.date.begin = new Date();
                    scope.date.end = new Date();
                    break;
                    case 1:
                    scope.date.begin = new Date(+new Date() - 1 * numTime);
                    scope.date.end = new Date(+new Date() - 1 * numTime);
                    break;
                    case 7:
                    scope.date.begin = new Date(+new Date() - 6 * numTime);
                    scope.date.end = new Date();    
                    break;
                    case 30:
                    scope.date.begin = new Date(+new Date() - 29 * numTime);
                    scope.date.end = new Date();
                    break;
                }
            }
            scope.$watch('date.begin', function(val){
                val ? scope.searchByTimes(0) : void  0;
                contrastTime('start');
            })
            scope.$watch('date.end', function(val){
                val ? scope.searchByTimes(1) : void  0;
                contrastTime('end');
            })
            scope.searchByTimes = function(param){
                var end = +scope.date.end, begin = +scope.date.begin;
                if( end - begin < 0){
                    ws.alert({msg: '开始日期不能大于结束日期'});
                    if(scope.status == 'search'){
                        scope.date.begin = scope.date.end = new Date();
                    }else{
                        scope.date.begin = scope.date.end = scope.date.minDate;
                    }
                    return;
                }
                
                if(scope.status == 'search'){
                    //判断最大日期或最小日期
                   /* if(end != today && begin != today){
                        if(param){
                            //设置最小开始时间
                            /!*scope.date.minDate = new Date(+end - maxDay * numTime);*!/
                        }else{
                            //设置最大结束时间
                            if(new Date(+begin + maxDay * numTime) > today){
                                scope.date.maxDate = today
                            }else{
                                scope.date.maxDate = new Date(+begin + maxDay * numTime)
                            }
                        }
                    }*/
                    var now = +new Date();
                    if((Math.abs(end - begin) < (maxDay-1) * 1000 * 60 * 60 *24) && (Math.abs(now - end) < numTime)){
                        var int = (end - begin)/numTime;
                        var int_ = (now - begin)/numTime;
                        if(int < 1 && int_ < 1) return scope.date.dayIndex = 0;
                        //if(int >= 1 && int <= 2) return scope.date.dayIndex = 1;
                        if(int >= 6 && int <= 7) return scope.date.dayIndex = 7;
                        if(int >= 29 && int <= 30) return scope.date.dayIndex = 30;
                    }
                    else if((Math.abs(end - begin) < (maxDay-1) * 1000 * 60 * 60 *24) && (Math.abs(end - begin) < numTime)  && (Math.abs(now - end) < 2*numTime)){
                         return scope.date.dayIndex = 1;
                    }
                    else if(Math.abs(end - begin) > (maxDay-1) * 1000 * 60 * 60 *24){
                        scope.date.dayIndex = -1;
                        return ws.alert({msg: '查询时间间隔不能超过'+(maxDay)+'天'});
                    }
                    return scope.date.dayIndex = -1;
                }

            };
            var contrastTime = function(param){
                if(Date.parse(scope.date.begin) - Date.parse(scope.date.end) >= 0){
                    if(param == 'start'){
                        if(Number(scope.date.startTime) > Number(scope.date.endTime)){
                            ws.alert({msg: '开始时间不能大于结束时间'});
                            scope.date.startTime = scope.date.endTime;
                        }
                    }else if(param == 'end'){
                         if(Number(scope.date.startTime) > Number(scope.date.endTime)){
                            ws.alert({msg: '结束时间不能小于开始时间'});
                            scope.date.endTime = scope.date.startTime;
                         }
                    }
                }
            }

        }
    }
})
//dorp-menu 
app.directive('dropMenu', function(userInfo){
    return{
        restrict: 'A',
        link: function($scope, elem, attr){
            var id = attr.dropMenu;
            var offset, div;
            var isOrder = attr.isOrder;
            var callback = attr.callBack;
            elem.bind('click', function(eve){
                if(typeof $scope[callback] == 'function'){
                    $scope[callback].call(this);
                }
                var target = eve.target.tagName == 'BUTTON' ? eve.target : eve.target.parentNode;
                var mask;
                offset = target.getBoundingClientRect();
                div = document.getElementById(id);    

                if(!document.getElementById('mask')){
                    mask = document.createElement('div');
                    mask.id = 'mask';
                    document.body.appendChild(mask);
                }
                
                div.style.display = 'block';
                
                setHeight()
                div.addEventListener('click', function(e){
                    div.style.display = 'none';
                    mask ? document.body.removeChild(mask) : void 0;
                    mask = null;
                });
                mask.addEventListener('click', function(e){
                    div.style.display = 'none';
                    mask ? document.body.removeChild(mask) : void 0;
                    mask = null;
                })
            })
            function setHeight(){
                if(!div) return;
                var height = document.body.clientHeight;
                var dHeight = div.clientHeight;
                div.style.left = offset.left + 'px';
                if(height - (dHeight + offset.top + offset.height) > 100){
                    $scope[isOrder] = false;
                    
                    div.style.top = offset.top + offset.height + 20 + 'px';
                }else{
                    $scope[isOrder] = true;
                    div.style.top = offset.top - dHeight - 20 + 'px';
                }
            }
            $scope.$on('ngRepeatFinished', function(){
                setTimeout(function(){setHeight()}, 100);
            })
        }
    }
});
app.directive('finishRender', function($rootScope){
    return{
        restrict: 'A',
        link: function(scope){
            if(scope.$last === true){
                $rootScope.$broadcast('ngRepeatFinished');
            }
        }
    }
})
//tab交互设置
app.directive('myContentdiv', function(){
    var div, divId;
    return{
        restrict: 'A',
        scope : {
            pageTab : '=pageTab'
        },
        link: function(scope, elem, attr){
            var h4 = elem.children();
            angular.forEach(h4, function(item, i){

                item.addEventListener('click', function(e){
                    for(var i = 0, length = h4.length; i < length; i++){
                        h4[i].classList.remove('activeh4');
                        //h4[i].classList.remove('wechart');
                        //h4[i].classList.remove('receipts');
                        divId = angular.element(h4[i]).attr('contantid');
                        div = document.getElementById(divId);
                        div.style.display = 'none';
                    }
                    this.classList.add('activeh4');
                    divId = angular.element(this).attr('contantid');
                    //if(divId.indexOf('wechat') >= 0) this.classList.add('wechat');
                    //if(divId.indexOf('receipts') >= 0) this.classList.add('receipts');
                    div = document.getElementById(divId);
                    div.style.display = 'block';
                })
            });
            scope.$watch('pageTab',function(newValue, oldValue){
                angular.forEach(h4, function(item,i){
                    divId = angular.element(item).attr('contantid');
                    if(divId == newValue){
                        angular.element(item).addClass('activeh4');
                        angular.element(item).addClass(newValue);
                        div = document.getElementById(divId);
                        div.style.display = 'block';
                    }else{
                        angular.element(item).removeClass('activeh4');
                        div = document.getElementById(divId);
                        div.style.display = 'none';
                    }
                });
            })
        }
    }
});
//tab交互设置
app.directive('contantDiv', function(){
    var div, divId;
    return{
        restrict: 'A',
        link: function(scope, elem, attr){
            var h4 = elem.children();
            angular.forEach(h4, function(item, i){
                if(item.classList.contains('activeh4')){
                    divId = angular.element(item).attr('contantid');
                    div = document.getElementById(divId);
                    div.style.display = 'block';
                }else{
                    divId = angular.element(item).attr('contantid');
                    div = document.getElementById(divId);
                    div.style.display = 'none';
                }
                item.addEventListener('click', function(e){
                    for(var i = 0, length = h4.length; i < length; i++){
                        h4[i].classList.remove('activeh4');
                        divId = angular.element(h4[i]).attr('contantid');
                        div = document.getElementById(divId);
                        div.style.display = 'none';
                    }
                    this.classList.add('activeh4');
                    divId = angular.element(this).attr('contantid');
                    div = document.getElementById(divId);
                    div.style.display = 'block';
                })
            })
        }
    }
});

app.directive('myColor', function(userInfo, $rootScope){
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            color: '='
        },
        template: '<span ng-click="toggle()" class="color-select" ng-class="{active: showColors}" style="background: #fff !important;"><span flex class="detail-color"  ng-style="{background: color.cvalue}"></span></span><ul class="card-colors" flex ng-show="showColors"><li ng-repeat=" (cname, cvalue) in colors " ng-style="{background: cvalue}" ng-click="hide(cname, cvalue)"></li></ul>',    
        link: function(scope, elem, attr, ctrl){
            scope.color = scope.color || {};
            if($rootScope.colors){
                scope.colors = $rootScope.colors;
                if(scope.color.cvalue){
                    for(var key in scope.colors){
                        if(scope.color.cvalue == scope.colors[key]){
                            scope.color.cname = key;
                            continue;
                        }
                    }
                }
            } 
            else{
                userInfo.get('colors').then(function(res){
                    $rootScope.colors = res.object;
                    scope.colors = res.object;
                    if(scope.color.cvalue){
                        for(var key in scope.colors){
                            if(scope.color.cvalue == scope.colors[key]){
                                scope.color.cname = key;
                                continue;
                            }
                        }
                    }
                })
            }
            scope.$watch('color.cvalue', function(val){
                if(val){
                    ctrl.$setValidity('required', true);
                }else{
                    ctrl.$setValidity('required', false);
                }
            })
            scope.showColors = false;

            scope.hide = function(cname, cvalue){
                scope.showColors = false;
                scope.color = {cvalue: cvalue, cname: cname};
            };

            scope.toggle = function(){
                scope.showColors = !scope.showColors;
            }
        }
    }
});
app.component('poiCategory', {
    templateUrl: ['tplUrl', function(tplUrl){
        return tplUrl + 'tpl/poi/category.html';
    }],
    bindings: {
        categories: '<',
        confirm: '&'
    },
    controller: ['app.common.service', '$rootScope', 'poi.create.service', function(commonService, $rootScope, poiService){
        var vm = this, category = [], int = 0;
        var isEdit = vm.categories.length ? true : false;
        vm.isPoi = /poi/.test(window.location.href);
        var Service = vm.isPoi ? poiService : commonService;
        Service.getCategory().then(function(data){
            category = data;
            vm.primaryList = category.map(function(item, index){
                if(vm.isPoi) return {name: item.name, index: index};
                else return {name: item.category_name, index: index};
            });
            if(isEdit){
                int++;
                for(var i in vm.primaryList){
                    if(vm.primaryList[i].name == vm.categories[0]){
                        vm.primaryIndex = vm.primaryList[i].index;
                        vm.changePrimary();
                        continue;
                    }
                }
            }
        });

        vm.changePrimary = function(){
            vm.subList = vm.isPoi ? category[vm.primaryIndex].sub : category[vm.primaryIndex].secondary_category;
            if(isEdit){
                int++;
                if(int == 2) isEdit = false;
                for(var i in vm.subList){
                    if(vm.subList[i].name == vm.categories[1]){
                        vm.sub = vm.subList[i].name;  
                    }
                }
            }else{
                vm.sub = vm.isPoi ?　vm.subList[0].name : vm.subList[0].category_name;  
           }
            vm.changeSub();
            if(!vm.isPoi) $rootScope.primary_category_id = category[vm.primaryIndex].primary_category_id;
        };

        vm.changeSub = function(){
            vm.primary = vm.isPoi ? category[vm.primaryIndex].name : category[vm.primaryIndex].category_name;

            if(!vm.isPoi) $rootScope.secondary_category_id = getId(vm.sub);
            // 清空数组 并设置新的 类目
            vm.categories.length = 0;
            vm.categories.push(vm.primary + ',' + vm.sub);
        };
        function getId(name){
            var int = 0;
            for(var i = 0, length = vm.subList.length; i < length; i++){
                if(vm.subList[i].category_name == name){
                    int = vm.subList[i].secondary_category_id;
                    continue;
                }
            }
            return int;
        }
    }]
});
app.directive('downSelect', function($rootScope, $http, $parse){
    return {
        restrict: 'A',
        scope: {
            options: '=options'
        },
        link: function(scope, elem, attr){
            var firstData = {};
            firstData[scope.options.dataName] = -1;
            firstData[scope.options.dataOptionName] = scope.options.optionNames[0];
            var secondData = {};
            secondData[scope.options.dataName] = -1;
            secondData[scope.options.dataOptionName] = scope.options.optionNames[1];
            var thirdData;
            if(scope.options.count != 2){
                thirdData = {};
                thirdData[scope.options.dataName] = -1;
                thirdData[scope.options.dataOptionName] = scope.options.optionNames[2];
            }
            $http.post(scope.options.urlArray[0], scope.options.data)
                .success(function(msg){
                    //wsh.successback(msg, '', false, function(){
                        scope.options.dataOptions.firstOption = scope.options.backDataName ? msg.errmsg.data : msg.errmsg;
                        scope.options.dataOptions.firstOption.unshift(firstData);
                    //})
                })
            //侦测第一级菜单的变化  
            var isfirst = false;
            var status;  
            scope.$watch('options.dataBack[0]', function(a){
                if(typeof scope.options.firstCallBack == 'function'){
                    scope.options.firstCallBack.call(this);
                }
                if(a == -1){
                    scope.options.dataOptions.secondOption = [secondData];
                    if(scope.options.count != 2){
                        scope.options.dataOptions.thirdOption = [thirdData];
                    }
                    scope.options.dataBack[1] = -1;
                }else{
                    var data = {};
                    data[scope.options.searchName] = a;
                    getData(scope.options.urlArray[1], data, setSecond);
                }
                status = 0;
                if(!isfirst){
                    isfirst = true;
                    if(a == -1) status = 0;
                    else status = 1;
                }
            });
            //侦测第二级菜单的变化
            if(scope.options.count >= 2) {
                scope.$watch('options.dataBack[1]', function (a) {
                    if(typeof scope.options.secondCallBack == 'function'){
                        scope.options.secondCallBack.call(this);
                    }
                    if(scope.options.count > 2){
                        if (a == -1) {
                            scope.options.dataOptions.thirdOption = [thirdData];
                            scope.options.dataBack[2] = -1;
                        } else {
                            var data = {};
                            data[scope.options.searchName] = a;
                            getData(scope.options.urlArray[2], data, setThird);
                        }
                    }
                });
            }
            //侦测第三级菜单的变化
            if(scope.options.count >= 3) {
                scope.$watch('options.dataBack[1]', function (a) {
                    if(typeof scope.options.thirdCallBack == 'function'){
                        scope.options.thirdCallBack.call(this);
                    }
                    if(scope.options.count > 3){
                        if (a == -1) {
                            scope.options.dataOptions.thirdOption = [thirdData];
                            scope.options.dataBack[2] = -1;
                        } else {
                            var data = {};
                            data[scope.options.searchName] = a;
                            getData(scope.options.urlArray[2], data, setThird);
                        }
                    }
                });
            }
            var first = 0;
            function setSecond(data){
                if(data.length){
                    scope.options.dataOptions.secondOption = data;
                    if(!first && status == 1) return;
                    scope.options.dataBack[1] = scope.options.dataOptions.secondOption[0].id;
                }else{
                    var data = {};
                    data[scope.options.dataOptionName] = scope.options.notFindNames[0];
                    data[scope.options.dataName] = -1;
                    scope.options.dataOptions.secondOption = [data];
                    scope.options.dataBack[1] = -1;
                }
                first++;
            }
            var second = 0;
            function setThird(data){
                if(data.length){
                    scope.options.dataOptions.thirdOption = data;
                    if(!second && status == 1) return;
                    scope.options.dataBack[2] = scope.options.dataOptions.thirdOption[0].id;
                }else{
                    var data = {};
                    data[scope.options.dataOptionName] = scope.options.notFindNames[1];
                    data[scope.options.dataName] = -1;
                    scope.options.dataOptions.thirdOption = [data];
                    scope.options.dataBack[2] = -1;
                }
                second++;
            }
            function getData(url, data, callback){
                $http.post(url, data)
                    .success(function(msg){
                        //对后台的处理方法
                        //wsh.successback(msg, '', false, function(){
                            callback.call(this, scope.options.backDataName ? msg.errmsg.data : msg.errmsg);
                        //})
                    })
            }
        }
    };
});
app.directive('onFinishRender', function($timeout){
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinish');
                });
            }
        }
    }
});
app.directive('line', function() {
    return {
        scope: {
            id: "@",
            params: "="
        },
        restrict: 'E',
        template: '<div style="height:250px;" class="canvas-wrap"></div>',
        replace: true,
        link: function($scope, element, attrs, controller) {
            var getCharts = function(){
                var option = {
                    // 提示框，鼠标悬浮交互时的信息提示
                    tooltip: {
                        trigger: 'axis'
                    },
                    // 横轴坐标轴
                    xAxis: [{
                        type: 'category',
                        boundaryGap : false,
                        data: $scope.params.item,
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#e5e5e5',
                                width: 2
                            }
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#666'
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: true
                        },
                    }],
                    // 纵轴坐标轴
                    yAxis: [{
                        type: 'value',
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#e5e5e5',
                                width: 2
                            }
                        },
                        axisLabel: {
                            show: true,
                            formatter: '{value}',
                            formatter: function(value){
                                // 当数值超过10万时，将单位格式化为万
                                if (value > 10000) {
                                    return value/10000 + '万';
                                }else{
                                    return value;
                                }
                            },
                            textStyle: {
                                color: '#666'
                            }
                        },
                        splitLine: {
                            show: true
                        },
                        axisTick: {
                            show: false
                        },
                        splitArea: {
                            show: true,
                            areaStyle: {
                                color: ['#fff', '#fbfbfb']
                            }
                        }
                    }],
                    grid: {
                        show: true,
                        left: '5%',
                        right: '2%',
                        top: '5%',
                        bottom: '10%'
                    },
                    // 数据内容数组
                    series: function(){
                        var serie=[];
                        for(var i=0;i<$scope.params.legend.length;i++){
                            var item = {
                                name : $scope.params.legend[i],
                                type: 'line',
                                areaStyle: {
                                    normal: {
                                        color: attrs.areacolor
                                    }
                                },
                                itemStyle : {
                                    normal : {
                                        color: attrs.itemcolor,
                                        lineStyle:{
                                            color: attrs.itemcolor
                                        }
                                    }
                                },
                                data: $scope.params.data[i]
                            };
                            serie.push(item);
                        }
                        return serie;
                    }()
                };
                var myChart = echarts.init(document.getElementById($scope.id),'macarons');
                myChart.setOption(option);
            }
            getCharts();

            $scope.$watch('params', function(){
                getCharts();
            })
        }
    };
});
//选择优惠券按钮(弹出框)
/*app.directive('selectCouponBtn',function(){
    return{
        restrict: 'E',
        scope:{
            coupon : '=',
            type : '='
        },
        template : '<md-button class="md-raised noupper"  ng-bind="coupon.title" style="width:160px;margin-left:0;margin-right:30px;" ng-class="{'+"coloe-ac"+':coupon.cardId}" >选择优惠券</md-button>',

        link:function($scope, element, atts){
            element.bind('click',function(){
                $scope.$emit('select.coupon.start',$scope.coupon, $scope.type)
            })
        }

    }
});*/



































