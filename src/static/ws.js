(function(){
	var ws = ws || {};
	ws.successback = function(res, callback, errorback){
		if(res.code == -502){
			return window.location.href = 'index.html#/login';
		}
		if(res.code == -106){
			res.object = res.object || {};
			if(typeof callback == 'function'){
				callback.call(this);
			}
		}
		//过滤库存不足时微信返回的提示
		if(res.code == 45031){
			res.object = res.object || {};
			if(typeof callback == 'function'){
				callback.call(this);
			}
		}
		if(res.code == '0'){
			if(typeof callback == 'function'){
				callback.call(this);
			}
		}else{
			if(ws.alert){
				ws.alert({msg: res.message});
			}
			if(typeof errorback == 'function'){
				errorback.call(this);
			}
		}
	}
	ws.ajaxDialog = function(title, url, params, string, isParams, callback, cancelback, errorback){
		if(!ws.mdDialog) return;
		ws.rootScope.delText = title || '';
		var confirm = ws.mdDialog.confirm({
			title: 'title',
			templateUrl: 'tpl/coupons/coupon_del_dialog.html'
		});

		ws.mdDialog.show(confirm).then(function() {
			var fun = string =='get' ? ws.userInfo.get : ws.userInfo.del;
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
	ws.noAjaxDialog = function(title, callback, cancelback){
		if(!ws.mdDialog) return;
		ws.rootScope.delText = title || '';
		var confirm = ws.mdDialog.confirm({
			title: 'title',
			templateUrl: 'tpl/coupons/coupon_del_dialog.html'
		});
		ws.mdDialog.show(confirm).then(function() {
			if(typeof callback == 'function') callback.call(this);
		}, function(){
			if(typeof cancelback == 'function') cancelback.call(this);
		});
	}
	ws.fillEmpty = function(array, string){
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
	ws.indexOf = function(val, array, string){
		if(!array.length) return false;
		var boo = false;
		for(var i in array){
			if(val == ws.parse(string)(array[i])){
				boo = i;
				continue;
			}
		}
		return boo;
	}
	ws.unique = function (array, string) {
		var ret = [];
		var o = {};
		var len = array.length;
		for (var i = 0; i < len; i++) {
			if (string) {
				var v = ws.parse(string)(array[i]);
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
	ws.isEmptyObj = function(obj){
		if(Object.keys(obj).length == 0) return true;
		else return false;
	}
	ws.wipe = function(str){
		return str = str.replace(/^\[\"?/, '').replace(/\"?\]$/, '');
	}
	ws.changeUndefined = function(obj){
		for(var i in obj){
			if(obj[i] === undefined) obj[i] = '';
		}
		return obj;
	}
	ws.changeRes = function (res) {
		if(res.object && res.object.list && ws.isArray(res.object.list)) return res;
		if(!res.object || ws.isArray(res.object)){
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
		}else{
			res.object.totalRows = (res.object.totalRows || res.object.rows) || res.totalRows;
		}
		return res;
	}
	ws.isArray = function(array){
		return Object.prototype.toString.call(array) === '[object Array]';
	}
	window.ws = ws;
})()