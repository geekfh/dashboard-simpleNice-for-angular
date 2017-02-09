app.service('ws', function($http, baseUrl, $parse, userInfo, $q, $alert, $mdDialog, $rootScope, $state){
    this.passCode = [-106, 45031, -109,-309, -310, -311, -207, -900]; // 45031-过滤库存不足时微信返回的提示;109-过滤开启微信派券时未开启消息与菜单权限
    this.successback = function(res, callback, errorback, boo){
        var length = arguments.length;
        if(typeof arguments[length - 1] == 'boolean' && arguments[length - 1]){
            boo = errorback;
        }
        if(res.code == -502){
            return window.location.href = 'index.html#/login';
        }
        if(this.passCode.indexOf(res.code) >= 0 || boo){
            res.object = res.object || {};
            if(typeof callback == 'function'){
                callback.call(this);
            }
            return;
        }
        if(res.code == '0'){
            if(typeof callback == 'function'){
                callback.call(this);
            }
        }else{
            $alert({msg: res.message});
            if(typeof errorback == 'function'){
                errorback.call(this);
            }
        }
    }
    this.ajaxDialog = function(title, url, params, string, isParams, callback, cancelback, errorback){
        $rootScope.delText = title || '';
        var confirm = $mdDialog.confirm({
            title: 'title',
            templateUrl: 'tpl/coupons/coupon_del_dialog.html'
        });

        $mdDialog.show(confirm).then(function() {
            var fun = string =='get' ? userInfo.get : userInfo.del;
            var obj = isParams ? {params: params} : params;
            fun(url, obj).then(function(res){
                if(typeof callback == 'function') callback.call(this);
            }).then(function(res){
                if(typeof errorback == 'function') errorback.call(this);
            })
        }, function() {
            if(typeof cancelback == 'function') cancelback.call(this);
        });
    }
    this.noAjaxDialog = function(title, callback, cancelback){
        $rootScope.delText = title || '';
        var confirm = $mdDialog.confirm({
            title: 'title',
            templateUrl: 'tpl/coupons/coupon_del_dialog.html'
        });
        $mdDialog.show(confirm).then(function() {
            if(typeof callback == 'function') callback.call(this);
        }, function(){
            if(typeof cancelback == 'function') cancelback.call(this);
        });
    }
    this.noAjaxDialogOneBtn = function(title, callback, cancelback){
        $rootScope.delText = title || '';
        var confirm = $mdDialog.confirm({
            title: 'title',
            templateUrl: 'tpl/coupons/coupon_del_dialog_oneBtn.html'
        });
        $mdDialog.show(confirm).then(function() {
            if(typeof callback == 'function') callback.call(this);
        }, function(){
            if(typeof cancelback == 'function') cancelback.call(this);
        });
    }
    this.fillEmpty = function(array, string){
        if(/\./.test(string)){

        }else{
            for(var i in array){
                if(!array[i][string]){
                    array[i][string] = '---';
                }
            }
        }
        return array;
    }
    //判断array数组中的string字段属性是否有等于val 的
    this.indexOf = function(val, array, string){
        if(!array.length) return false;
        var boo = false;
        for(var i in array){
            if(val == $parse(string)(array[i])){
                boo = i;
                continue;
            }
        }
        return boo;
    };
    //若string不传或为空，则unique去掉array数组中重复的值；若string不为空，则unique去掉array数组中string字段重复的值
    this.unique = function (array, string) {
        var ret = [];
        var o = {};
        var len = array.length;
        for (var i = 0; i < len; i++) {
            if (string) {
                var v = $parse(string)(array[i]);
            } else {
                var v = array[i];
                
            }
            if (!o[v]) {
                o[v] = 1;
                ret.push(array[i]);
            }
        }
        return ret;
    }
    this.isEmptyObj = function(obj){
        if(Object.keys(obj).length == 0) return true;
        else return false;
    }
    this.wipe = function(str){
        return str = str.replace(/^\[\"?/, '').replace(/\"?\]$/, '');
    }
    this.changeUndefined = function(obj){
        for(var i in obj){
            if(obj[i] === undefined) obj[i] = '';
        }
        return obj;
    }
    this.changeRes = function (res) {
        if(res.object && res.object.list && this.isArray(res.object.list)) return res;
        if(!res.object){
            res.object = {};
            res.object.list = [];
            res.object.totalRows = 0;
        }
        if(res.object && this.isArray(res.object)){
            if(res.object.length){
                var list = res.object;
                res.object = {};
                res.object.list = list;
                res.object.totalRows = (res.object.totalRows || res.object.rows) || res.totalRows;
            }else{
                res.object = {};
                res.object.list = [];
                res.object.totalRows = 0;
            }
        }
        if(res.object && this.isObject(res.object) && this.isEmptyObj(res.object)){
            res.object.list = [];
            res.object.totalRows = 0;
        }
        return res;
    }
    //转义  元素的innerHTML内容即为转义后的字符
    function htmlEncode(str){
        var ele = document.createElement('span');
        ele.appendChild( document.createTextNode( str ) );
        return ele.innerHTML;
    }
    //处理输入的换行
    this.newLine = function(str){
        var string;
        string = htmlEncode(str);
        return string = string.replace(/\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029)/g,"<br/>");
    }
    this.isArray = function(array){
        return Object.prototype.toString.call(array) === '[object Array]';
    }
    this.isObject = function(obj){
        return Object.prototype.toString.call(obj) === '[object Object]';
    }
    this.wipeNull = function(array){
        var arr = [];
        if(array.length){
            for(var i = 0, length = array.length; i < length; i++){
                if(array[i] !== null) arr.push(array[i]);
            }
        }
        return arr;
    }
    this.myBrowser = function () {
        var win = window, nav = win.navigator, doc = win.document, ieAX = win.ActiveXObject, ieMode = doc.documentMode, REG_APPLE = /^Apple/;
        var ieVer = _getIeVersion() || ieMode || 0, isIe = ieAX || ieMode, chromiumType = _getChromiumType();
        function _testExternal(reg, type) {//区分webkit核心主要通过external中的对象来判断，是否包含特殊的方法名称
            var external = win.external || {};
            for (var i in external) if (reg.test(type ? external[i] : i)) return true;
            return false;
        }
        function _getChromiumType() {
            if (isIe || typeof win.scrollMaxX !== 'undefined' || REG_APPLE.test(nav.vendor || '')) return '';//无法识别
            var _track = 'track' in document.createElement('track');
            var webstoreKeysLength = win.chrome && win.chrome.webstore ? Object.keys(win.chrome.webstore).length : 0;
            if (_testExternal(/^sogou/i, 0)) return 'sogou';
            if (_testExternal(/^liebao/i, 0)) return 'liebao';
            //==========以下方法不是external或者clientInformation特有的，可能其他浏览器后续版本会增加，如果判断失败也是无解了
            if (_testExternal(/^getguid/i, 0)) return 'qq';
            if (_testExternal(/^getnextreqid/i, 0)) return 'baidu';
            if (win.clientInformation && win.clientInformation.getBattery) return 'chrome';
            //==========
            if (_track) return webstoreKeysLength > 1 ? '360ee' : '360se';
            return '';
        }
        function _getIeVersion() {
            var v = 3, p = document.createElement('p'), all = p.getElementsByTagName('i');
            while (p.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]);
            return v > 4 ? v : 0;
        }
        return {
            isIE: (function () { return !!ieVer; })(),
            ieVersion: (function () { return ieVer; })(),
            isChrome: (function () { return chromiumType === 'chrome'; })(),
            is360se: (function () { return chromiumType === '360se'; })(),
            is360ee: (function () { return chromiumType === '360ee'; })(),
            isLiebao: (function () { return navigator.userAgent.indexOf('LBBROWSER') != -1; })(),
            isSogou: (function () { return chromiumType === 'sogou'; })(),
            isQQ: (function () { return navigator.userAgent.indexOf('QQBrowser') != -1; })(),
            isBaidu: (function () { return navigator.userAgent.indexOf('BIDUBrowser') != -1; })(),
            isFiefox: (function () { return navigator.userAgent.indexOf('Firefox') != -1 })(),//火狐
            isTheWorld: (function () { return navigator.userAgent.indexOf('TheWorld') != -1 })(),//世界之窗
            isUC: (function () { return navigator.userAgent.indexOf('UBrowser') != -1 })(),//UC
            isOpera: (function () { return !!window.opr })()//欧朋
        };
    }

    this.alert = $alert;
    this.parse = $parse;
    this.rootScope = $rootScope;
    this.userInfo = userInfo;
    this.mdDialog = $mdDialog;
    this.state = $state;
});
































