app.service('clubcard.member.service', ['$http', 'baseUrl', function($http, baseUrl){

    this.getMembers = function(params){

        return $http.get(baseUrl +'memberCardUsers', {params: params}).then(function(res){
            return res.data;
        })
    };

    this.getMember = function(num){
        return $http.get(baseUrl + 'memberCardUsers/'+num).then(function(res){
            return res.data;
        })
    };

    this.changeMember = function(params){
        return $http.put(baseUrl + 'memberCardUsers/' + params.num, params).then(function(res){
            return res.data;
        })
    };

    this.getMemberRecord = function(num, params){
        return $http.get(baseUrl + 'memberCardUserRecord/' + num, {params: params}).then(function(res){
            return res.data;
        })
    }

}]);

