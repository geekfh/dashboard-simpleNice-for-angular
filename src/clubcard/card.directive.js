app.directive('customField', ['$mdDialog', 'tplUrl', function ($mdDialog, tplUrl) {

    return {
        restrict: 'E',
        template: '<md-button ng-click="field.show($event)" style="margin-left: 87px" class="md-raised">设置选填</md-button>',
        scope: {},
        bindToController: {
            usedFields: '='
        },
        controller: function ($scope, $rootScope) {
            var vm = this ;
            // vm.usedFields = vm.usedFields || {selectFields: [], customFields: []};
            // console.log()
            if($rootScope.isEdit){
                if(vm.usedFields.selectFields.length){
                    angular.forEach(vm.usedFields.selectFields, function(it, i){
                        var str = it;
                        angular.forEach(selectedFields, function(item){
                            angular.forEach(item.sub, function(ii){
                                if(ii.v == str){
                                    vm.usedFields.selectFields[i] = ii;
                                }
                            })
                        })
                    })
                }
            }
            vm.show = function (ev) {
                $scope.$watch('vm.usedFields', function(){
                    $mdDialog.show({
                        templateUrl: tplUrl + 'tpl/clubcard/card/custom_field.html',
                        controller: ['$scope','$mdDialog','items', customFieldDialogCtrl],
                        controllerAs: 'dialog',
                        targetEvent: ev,
                        locals: {
                            items: vm.usedFields
                        },
                        clickOutsideToClose: true
                    }).then(function(data){
                        vm.usedFields.selectFields = data[0];
                        vm.usedFields.customFields = data[1];
                    });
                });

            };

        },
        controllerAs: 'field'
    }

}]);

function customFieldDialogCtrl ($scope, $mdDialog, items) {
    var vm = this;
    vm.fields = selectedFields;

    items = items || {};
    vm.selected = items.selectFields || [];
    vm.customFields = items.customFields || [];

    /**
     *  修改会员卡已有的 可选字段
     *  对比 fields
     *  把已有的设置为 不能点击状态
     */
    vm.fields.forEach(function(parent){
       parent.sub.forEach(function(field){
           vm.selected.forEach(function(it){
               if(it.v == field.v){
                   field.dis = true;
               }
           })
       })
    });

    vm.add = function (it) {
        if(vm.selected.length + vm.customFields.length >= 13) return ws.alert({msg: '已超出最大信息设置!'});
        if ( !it.dis ) {
            vm.selected.push(it);
            it.dis = true;
        }
    };


    vm.del = function (it) {
        it.dis = false;
        vm.selected = vm.selected.filter(function (item) {
            return item.i != it.i;
        });
    };


    vm.hide = function(data){
        $mdDialog.hide(data);
    };


    /**
     * 手动输入框
     */
    vm.inputShow = false;
    vm.showInput = function(){
        vm.inputShow = true;
    };
    vm.hideInput = function(){
        vm.inputShow = false;
    };
    vm.addCustom = function(val){
        if(!val) return ws.alert({msg: '请填写先填信息!'});
        if(!(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(val))) return ws.alert({msg: '输入内容不可以包含特殊字符！'});
        if(vm.customFields.indexOf(val) > -1 || selectedTextArray.indexOf(val) > -1) return ws.alert({msg: '内容已重复或和列表信息有冲突!'});
        vm.customFields.push(val);
        vm.inputShow = false;
    };
    vm.del2 = function (it, index) {
        vm.customFields.splice(index, 1);
    };

}
var selectedTextArray = ['生日', '身份证', '邮箱', '详细地址', '教育背景', '职业', '行业', '收入', '兴趣爱好'];
var selectedFields = [
    {
        title: '个人信息',
        sub: [
            // { i: 1, k: '姓名', v: 'USER_FORM_INFO_FLAG_NAME' },
            //{ i: 2, k: '性别', v: 'USER_FORM_INFO_FLAG_SEX' },
            { i: 3, k: '生日', v: 'USER_FORM_INFO_FLAG_BIRTHDAY' },
            { i: 4, k: '身份证', v: 'USER_FORM_INFO_FLAG_IDCARD' }
        ]
    },
    {
        title: '联系方式',
        sub: [
            // { i: 6, k: '手机号', v: 'USER_FORM_INFO_FLAG_MOBILE', dis: true },
            { i: 7, k: '邮箱', v: 'USER_FORM_INFO_FLAG_EMAIL' },
            { i: 8, k: '详细地址', v: 'USER_FORM_INFO_FLAG_DETAIL_LOCATION' }
        ]
    },
    {
        title: '教育与工作信息',
        sub: [
            { i: 9, k: '教育背景', v: 'USER_FORM_INFO_FLAG_EDUCATION_BACKGROUND' },
            { i: 10, k: '职业', v: 'USER_FORM_INFO_FLAG_CAREER' },
            { i: 11, k: '行业', v: 'USER_FORM_INFO_FLAG_INDUSTRY' },
            { i: 12, k: '收入', v: 'USER_FORM_INFO_FLAG_INCOME' }
        ]
    },
    {
        title: '其他信息',
        sub: [
            { i: 13, k: '兴趣爱好', v: 'USER_FORM_INFO_FLAG_HABIT' }
        ]
    }
];