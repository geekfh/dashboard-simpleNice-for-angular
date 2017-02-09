angular.module('poi.list').service('poi.list.service', ['$http', 'baseUrl', function($http, baseUrl){

    this.getList = function(params){
        return $http.get(baseUrl + 'poi', {params: params}).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };
    
    this.del = function(id){
        return $http.delete(baseUrl + 'poi/' + id).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };

    this.get = function(id){
        return $http.get(baseUrl + 'poi/' + id).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        });
    };

    this.update = function(poi, id){
        return $http.post(baseUrl + 'poi/' + id, poi, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function(res){
            if(res.data.code == -502){
                return window.location.href = 'index.html#/login';
            }
            return res.data;
        })
    };

}]);
