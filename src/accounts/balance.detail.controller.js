app.controller('balanceDetailController', function (NgTableParams, $scope, userInfo, $date, $stateParams) {
    $scope.date = {};
    $scope.queryParams = {};
    $scope.queryParams.settleDate = $stateParams.settleDate;
    $scope.queryParams.mchtNo = $stateParams.mchtNo;
    $scope.queryParams.chaCode = $stateParams.chaCode;
    $scope.queryParams.settleMcht = $stateParams.settleMcht;
    $scope.queryParams.mchtTraceNo = $stateParams.mchtTraceNo;
    $scope.mchtName = $stateParams.mchtName;
    if($stateParams.ifFailed == 'true'){
        $scope.ifFailed = true;
    }

    /*var res = {
        code : 0,
        message : String,
        object : {
            errlist : [ //异常交易
                {
                    txTime : '2016-07-20 13:30',
                    txType : '类型',
                    cycle : '一周年',
                    vocheNo : '02254421541122541',
                    errReason : '丑',
                    acNo : '第几号',
                    nextDo : 'xikajdk',
                    txAmt : '20120'
                }
            ],
            repairInfo : { //资金截留
                repairAmt : '201918',
                repairdeAmt : '201918',
                repairingAmt : '201918',
                unFreezeSum : '201918',
                unFreezeingAmt : '201918',
                unRepairAmt : '201918'
            },
            settleDtl : [ //结算详情
                {
                    errAmt : String, // 异常金额
                    errOkAmt : String, //异常确认金额
                    feeAmt : String, // 手续费
                    freeAmt : String, //优惠金额
                    mchtNo : String, // 商户号
                    repairAmt : String, // 截留金额
                    settleAmt : String, //结算金额
                    settleDate : String, //结算日期
                    txAmt : String, // 交易本金
                    unrepairAmt : String, // 截留解冻金额
                    uperrAmt : String // 上周期结算失败
                }
            ]
        }
    }*/
    //测试参数
/*    $scope.queryParams.settleDate = '20160629';
    $scope.queryParams.mchtNo = '017440395003425';*/
    userInfo.get('mchtBill/settleDetails/get.json', $scope.queryParams, true).then(function(res){
        //结算详情
        $scope.txAmt = res.object.settleDtl[0].txAmt;
        $scope.feeAmt = res.object.settleDtl[0].feeAmt;
        $scope.freeAmt = res.object.settleDtl[0].freeAmt;
        $scope.errAmt = res.object.settleDtl[0].errAmt;
        $scope.errOkAmt = res.object.settleDtl[0].errOkAmt;
        $scope.repairAmt = res.object.settleDtl[0].repairAmt;
        $scope.unrepairAmt = res.object.settleDtl[0].unrepairAmt;
        $scope.uperrAmt = res.object.settleDtl[0].uperrAmt;
        $scope.settleAmt = res.object.settleDtl[0].settleAmt;
        $scope.origFeeAmt = res.object.settleDtl[0].origFeeAmt;
        //异常交易
        if(res.object.errList.length){
            /*alert('存在异常交易')*/
            $scope.ifErrList = true;
            if($scope.ngTable){
                $scope.ngTable.reload();
            }else {
                $scope.ngTable = new NgTableParams(
                    {page : 1, count : 10},
                    {
                        getData : function(params){
                            params.settings().counts.length = 0;//将分页显示隐藏
                            if(res.object.errList){
                                $scope.noData = false;
                                return res.object.errList;
                            } else {
                                /*$scope.noData = res.message || '暂无数据';*/
                                $scope.noData = '暂无数据';
                                return [];
                            }
                        }
                    }
                );
            }
        }
        //资金截留
        if(!ws.isEmptyObj(res.object.repairInfo)){
            /*alert('存在资金截留')*/
            $scope.ifRepairInfo = true;
            if($scope.ngTable_02){
                $scope.ngTable_02.reload();
            }else {
                $scope.ngTable_02 = new NgTableParams(
                    {page : 1, count : 10},
                    {
                        getData : function(params){
                            params.settings().counts.length = 0;//将分页显示隐藏
                            if(res.object.repairInfo){
                                $scope.noData = false;
                                var arrInfo = [];
                                arrInfo[0] = res.object.repairInfo;
                                return arrInfo;
                            } else {
                                $scope.noData = '暂无数据';
                                return [];
                            }
                        }
                    }
                );
            }
        }
     })
});