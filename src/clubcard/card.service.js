app.service('clubcard.card.service', ['$http', 'poi.list.service','baseUrl', function($http, poiListService, baseUrl){

    this.getMembercard = function(){
        return $http.get(baseUrl + 'memberCards').then(function(res){
           return res.data;
        });
    };

    this.addCard = function(card) {
        console.log(card);

        return $http.post(baseUrl + 'memberCards', card).then(function(res){
            return res.data;
        })
    };

    this.editCard = function(card){
        return $http.put(baseUrl + 'memberCards/' + card.cardId, card).then(function(res){
            return res.data;
        })
    };

    this.push = function(params){
        return $http.put(baseUrl + 'memberCards/status/' + params.ID, params).then(function(res){
            res.data;
        });
    };

    this.getPoi = function(){
        return poiListService.getList().then(function(res){
            return res;
        })
    }
}]);

