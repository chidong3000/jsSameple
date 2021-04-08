var uiLibrary = 'bootstrap4';
var $postData = $("#post-data");
var dialog1;
var grid;
var contractCancelRegPostData = {};
var dataCus;
$(document).ready(function () {
    $('input[name="FilterValue"]').keypress(function (e) {
        var key = e.which;
        if (key === 13) {
            $('#btn-search-cust').click();
            return false;
        }
        return true;
    });

    $('#btn-quit').on('click', function (e) {
        window.location.href = "Home";
    });

    $('#btn-search-cust').on('click', function (e) {
        ClearData();
        var filter = $('#cboFilter').val();
        var para = $('#txt-filter').val();
        if (filter === null || filter === '') {
            notifyDanger("Vui lòng chọn điều kiện cần tìm");
            return;
        }
        if (para === null || para === '') {
            notifyDanger("Vui lòng nhập điều kiện cần tìm");
            $('#txt-filter').focus();
            return;
        }
        if (filter === 'CMND' && !$.isNumeric(para)) {
            notifyDanger("Vui lòng nhập số cho CMND");
            return;
        }
        $('#pnlDetail').attr("hidden", true);
        $('#btnMaster').attr("hidden", true);
        $("#step-4").removeClass("display-none").addClass("display-none");

        e.preventDefault();
        bindCustomerList();
    });

    $(document).on("click", "#btn-get-otp", function () {
       // var customer = $("#overview").data("overview");
      //  var _cusCode = customer.CusRegOverview.cstRegId;  

        var _cusCode = dataCus.id;
        var _cusArea = dataCus.cusAreacode;
        var _cusBranch = dataCus.cusBranchcode; 

        var phone = $.trim($("#txt-cst-phone").val());
        var moneyInOutAmt = $.trim($("#money-out-amt").val());
        var outAmt = parseInt($('#money-out-amt').val().replace(/[^0-9-]+/g, ''));

        var allowed = parseInt($('#money-out-amt-allowed').val().replace(/[^0-9-]+/g, ''));
        var amt = parseInt($('#money-out-amt').val().replace(/[^0-9-]+/g, ''));
        var fee = parseInt($('#money-out-fee').val().replace(/[^0-9-]+/g, ''));
        if (allowed - amt - fee < 0) {
            notifyDanger('Số dư không đủ.');
            return false;
        }

        if (outAmt % 1000 !== 0 || outAmt < 10000) {
            notifyDanger('Số tiền rút tối thiểu là 10.000 và số tiền phải tròn nghìn.');
            $('#money-out-amt').focus();
            return false;
        }


        if (isEmpty(moneyInOutAmt) || convertToNum(moneyInOutAmt) <= 0) {
            $("#money-out-amt").focus();
            notifyDanger("Vui lòng nhập số tiền rút");
            return;
        }
        else {
            $.ajax({
                url: '/otp/RequestOtp',
                type: 'get',
                dataType: 'json',
                data: { phone: phone, customerCode: _cusCode,areaCode: _cusArea, branchCode: _cusBranch },
                success: function (response) {
                    if (response.success === false) {
                        //notifyDanger("Không thể gửi OTP");
                        notifyDanger(response.message);
                    }
                    else {
                        notifyInfo("Đã gửi OTP");
                    }
                },
                error: function (request, status, error) {
                    console.log(request.responseText);
                }
            });
        }
    });

    $(document).on("click", "#btn-save", function () {
        var _phone = $.trim($("#txtPhone").val());
        var _contractId = $.trim($("#txtRefNo").val());
        var _amtString = $.trim($("#txtAmountString").text());
        var _verifyCode = $.trim($("#txt-otp").val());
        var _moneyInOutAmt = $.trim($("#txtMoneyInOutAmt").val()).replace(/[^0-9-]+/g, '');

        _moneyInOutAmt = formatNumber(item.amount);

        var _amountAfter = $.trim($("#txtAmountAfter").val()).replace(/[^0-9-]+/g, '');
        var _amountAllow = $.trim($("#txtAllowAmount").val()).replace(/[^0-9-]+/g, '');
        var _peCode = $.trim($("#txtPeCode").val());
        var _productCode = $.trim($("#txtProduct").val());
        //customer
        var _custPhone = $.trim($("#txtFullName").val());
        var _custName = $.trim($("#txtPhone").val());
        var _custIdentify = $.trim($("#txtCmnd").val());
        var _custIdentifyType = $.trim($("#cbo-cst-identity-type").val());
        var _scheduleId = $.trim($("#txtScheduleId").val());
        //check otp
        if (isEmpty(_verifyCode)) {
            notifyDanger("Vui lòng nhập OTP");
            $('#txt-otp').focus();
            return;
        }
        if (isEmpty(_moneyInOutAmt)) {
            notifyDanger("Vui lòng nhập số tiền rút");
            $('#txtMoneyInOutAmt').focus();
            return;
        }
        if (_verifyCode.length > 8) {
            notifyDanger("Vui lòng nhập OTP tối đa 8 chử số");
            $("#txt-otp").focus();
            return;
        }
        $.ajax({
            url: '/otp/AuthOtp',
            type: 'get',
            dataType: 'json',
            data: { otpCode: _verifyCode, phone: _phone, contractNo: _contractId },
            success: function (response) {
                if (response.success === false) {

                    //if (_verifyCode !== '999999') {
                    //    notifyDanger("OTP không chính xác");
                    //    return;
                    //}
                    notifyDanger(response.message);
                    return;

                }
                var reqModel = {
                    phone: _phone,
                    refCode: _contractId,
                    peCode: _peCode,
                    productCode: _productCode,
                    totalAmtDue: _moneyInOutAmt,
                    allowAmt: _amountAllow,
                    feeAmt: '0',
                    availableAmt: _amountAfter,
                    totalAmtDueText: _amtString,
                    verifyCode: _verifyCode,
                    payementMethod: 'COD',
                    custPhone: _custName,
                    custName: _custPhone,
                    custIdentify: _custIdentify,
                    custIdentifyType: _custIdentifyType,
                    scheduleId: _scheduleId
                };
                $.ajax({
                    url: '/MoneyInOut/SaveMoneyInOut',
                    type: 'post',
                    dataType: 'json',
                    data: reqModel,

                    success: function (response) {
                        if (response.success === true) {
                            $('#txtResponeData').val(response.data);
                            $('#btn-save').prop('disabled', true);
                            $('#btn-print').prop('disabled', false);
                            $.alert({
                                title: 'Thông báo thành công',
                                content: "Rút tiền thành công",
                                type: 'green',
                                typeAnimated: true,
                                buttons: {
                                    ok: {
                                        text: 'Đồng ý',
                                        btnClass: 'btn-green',
                                        keys: ['enter', 'shift'],
                                        action: function () {
                                            // location.reload();

                                        }
                                    }
                                }
                            });
                        } else {
                            notifyDanger(response.message);
                        }
                    }
                });
            },
            error: function (request, status, error) {
                notifyDanger("Lỗi OTP: " + request.responseText);
                console.log(request.responseText);
            }
        });



    });

    $(document).on("click", "#btn-print", function () {
        if ($('#txtResponeData').val() !== '')
            printMoneyInOut($('#txtResponeData').val());
    });

    $(document).on("click", ".btn-select-customer", function (e) {
        var data = $(this).data();
        dataCus = data;
        contractCancelRegPostData.phone = data.phone;
        $('#txt-cst-name').val(data.name);
        $('#txt-cst-phone').val(data.phone);
        $('#cbo-cst-identity-type').val(data.identityType);
        $('#txt-cst-identity-no').val(data.identityNo);
        $("#step-2").show();
        $("#step-3").hide();
        $("#step-3-1").hide();
        $("#step-4").removeClass("display-none").addClass("display-none");
        bindCustomerOverview(data.id);
    });

    $(document).on("blur", "#money-in-amt", function (e) {
        var customer = $("#overview").data("overview");
        var minAmt = customer.CusBillOverview.totalAmtNotPay;
        //$("#money-in-amt-min").val(formatNumber(minAmt));
        ReadMoney($(this));
    });
    $(document).on("blur", "#money-out-amt", function (e) {
        var allowed = parseInt($('#money-out-amt-allowed').val().replace(/[^0-9-]+/g, ''));
        var amt = parseInt($('#money-out-amt').val().replace(/[^0-9-]+/g, ''));
        var fee = parseInt($('#money-out-fee').val().replace(/[^0-9-]+/g, ''));
        if (allowed - amt - fee < 0) {
            notifyDanger('Số dư không đủ.');
            return;
        }
        $("#money-out-amt-allowed-after").val(formatNumber(allowed - amt - fee));
        ReadMoney($(this));
    });

    $(document).on("click", "#btn-money-in", function (e) {
        $("#btn-money-out").prop('disabled', false);
        $("#btn-money-in").prop('disabled', true);

        var customer = $("#overview").data("overview");
        //var defaultAmt = customer.CusBillOverview.totalAmtNotPay;
        var totalAmtNotPay = parseInt(customer.CusBillOverview.totalAmtNotPay);
        var balKD = parseInt(customer.CusRegOverview.balKD);
        var balDMD = parseInt(customer.CusRegOverview.balDMD);

        var requiredAmt = 0;
        //if (balKD + balDMD < totalAmtNotPay) {
        //    requiredAmt = totalAmtNotPay - (balKD + balDMD);
        //}
        if (balKD  < totalAmtNotPay) {
            requiredAmt = totalAmtNotPay - balKD;
        }

        //$('#money-in-amt').val(formatNumber(defaultAmt));
        $('#money-in-amt-min').val(formatNumber(requiredAmt));
        $('#money-in-amt').val(0);
        //var moneyInAmt = AutoNumeric.getAutoNumericElement('#money-in-amt');
        //moneyInAmt.rawValue = defaultAmt;


        // comment - chờ rule nghiệp vụ chặn số tiền nộp tối đa start
        //if (requiredAmt <= 0) {
        //    notifyDanger('Không phát sinh tiền nợ đã phát sinh và chưa thanh toán');
        //    $("#btn-money-in-bill").prop('disabled', true);
        //    $("#btn-print-money-in-bill").prop('disabled', true);
        //} else {
        //    $("#btn-money-in-bill").prop('disabled', false);
        //    $("#btn-print-money-in-bill").prop('disabled', true);
        //    ReadMoney($('#money-in-amt'));
        //    $("#step-3-1").hide();
        //    $("#step-3").show();
        //}

        // rule cũ
        $("#btn-money-in-bill").prop('disabled', false);
        $("#btn-money-in-waiting").prop('disabled', false);

        $("#btn-print-money-in-bill").prop('disabled', true);
        ReadMoney($('#money-in-amt'));
        $("#step-3-1").hide();
        $("#step-3").show();


        // comment - chờ rule nghiệp vụ chặn số tiền nộp tối đa end
        loadBanks();

    });

    $(document).on("change", "#cboBankList", function () {
        setBankName();
    });

    $(document).on("click", "#btn-money-in-bill", function (e) {
        if (validateMoneyInForm()) {
            submitMoneyIn();
        }
    });

    $(document).on("click", "#btn-money-in-waiting", function (e) {
        if (validateMoneyInWaitingForm()) {
            submitMoneyInWaiting();
        }
    });

    $(document).on("click", "#btn-print-money-in-bill", function (e) {
        var id = $(this).data("id");
        if (id === null || id === "") {
            notifyWarning("Không có giao dịch để in.");
            return;
        }
        var overview = $("#overview").data('overview');
        var dmdKD = overview.CusRegOverview.balDMD;
        printWithdraw(id, "i", dmdKD);
    });

    $(document).on("click", "#btn-exit-money-in, #btn-exit-money-out, #btn-exit-contract-cancel", function (e) {
        //$("#step-3").hide();
        location.reload();
    });

    $(document).on("click", "#btn-money-out", function (e) {
        bindMoneyOut();
        $("#btn-money-out").prop('disabled', true);
        $("#btn-money-in").prop('disabled', false);
        $("#btn-money-out-bill").prop('disabled', false);
        $("#btn-print-money-out-bill").prop('disabled', true);
        ReadMoney($('#money-out-amt'));
        $("#step-3").hide();
        $("#step-3-1").show();
    });
    $(document).on("click", "#btn-money-out-bill", function (e) {
        if (validateMoneyOutForm()) {
            submitMoneyOut();
        }
    });
    $(document).on("click", "#btn-print-money-out-bill", function (e) {
        var id = $(this).data("id");
        if (id === null || id === "") {
            notifyWarning("Không có giao dịch để in.");
            return;
        }
        printWithdraw(id, "o");
    });

    //Contracts
    $(document).on("click", "#btn-contracts", function (e) {
        e.preventDefault();
        bindGrid(null, $("#contract-list"), '/MoneyInOut/ContractListPartial', "Khách hàng chưa có hợp đồng");
    });

    $(document).on("click", "#contract-list .grid-pager button", function (e) {
        e.preventDefault();
        var page = $(this).attr("data-page");
        bindGrid(page, $("#contract-list"), '/MoneyInOut/ContractListPartial', "Khách hàng chưa có hợp đồng");
    });
    //Order
    $(document).on("click", "#btn-orders", function (e) {
        e.preventDefault();
        bindGrid(null, $("#order-list"), '/MoneyInOut/BillListPartial', "Khách hàng chưa đăng ký");
    });

    $(document).on("click", "#order-list .grid-pager button", function (e) {
        e.preventDefault();
        var page = $(this).attr("data-page");
        bindGrid(page, $("#order-list"), '/MoneyInOut/BillListPartial', "Khách hàng chưa đăng ký");
    });

    // Chi tiết hủy hợp đồng
    $(document).on("click", "#contractList .btn-select-contract", function () {
        var $this = $(this);
        var _contractNo = $this.attr("data-contractno");
        var customer = $("#overview").data("overview");
        if (_contractNo !== '') {
            $.ajax({
                url: '/MoneyInOut/ContractCancelGet',
                type: 'get',
                dataType: 'json',
                data: { contractNo: _contractNo },
                success: function (response) {
                    if (response && response.success === true) {
                        var data = response.data.data;
                        contractCancelRegPostData.contractNo = data.contractNo ? data.contractNo : "";
                        contractCancelRegPostData.amt = data.amtRemain ? data.amtRemain : "0";
                        $("#contractNo-r").val(contractCancelRegPostData.contractNo);
                        $("#periodAmt-r").val(data.periodAmt ? formatNumber(data.periodAmt) : "0");
                        $("#periodRemain-r").val(data.periodRemain ? formatNumber(data.periodRemain) : "0");
                        $("#amtRemain-r").val(data.amtRemain ? formatNumber(data.amtRemain) : "0");
                        $("#commitAmt-r").val(data.commitAmt ? formatNumber(data.commitAmt) : "0");
                        $("#fee-r").val(data.fee ? formatNumber(data.fee) : "0");
                        $("#period-r").val(data.period ? formatNumber(data.period) : "0");
                        $("#discountAmt-r").val(data.discountAmt ? formatNumber(data.discountAmt) : "0");
                        ReadMoney($("#amtRemain-r"));
                        $("#txt-otp-cancel").val("");
                        $("#step-4").removeClass("display-none");
                    } else {
                        notifyDanger(response.message);
                    }
                    console.log(response.message);
                },
                error: function (request) {
                    console.log(request.responseText);
                }
            });
        } else {
            notifyDanger("Không có số hợp đồng");
        }
    });

    // Lấy OTP hủy hợp đồng
    $(document).on("click", "#btn-get-otp-cancel", function () {
        var _phone = contractCancelRegPostData.phone;
        var _contractNo = contractCancelRegPostData.contractNo;
        var customer = $("#overview").data("overview");
        var _cusCode = dataCus.id;     
        var _cusArea = dataCus.cusAreacode; 
        var _cusBranch = dataCus.cusBranchcode; 
        var _templateCode = "OTP_TTTDCKH_HUY";
        console.log(dataCus);
        $.ajax({
            url: '/otp/RequestOtp',
            type: 'get',
            dataType: 'json',
            data: { phone: _phone, contractNo: _contractNo, templateCode: _templateCode, customerCode: _cusCode, areaCode: _cusArea, branchCode: _cusBranch},
            success: function (response) {
                if (response.success === false) {
                    notifyDanger(response.message);
                }
                else {
                    notifyInfo("Đã gửi OTP");
                }
            },
            error: function (request, status, error) {
                console.log(request.responseText);
            }
        });
    });

    // Hủy hợp đồng
    $(document).on("click", "#btn-contract-cancel", function () {
        var _phone = contractCancelRegPostData.phone;
        var _contractNo = contractCancelRegPostData.contractNo;
        var _otpCode = $.trim($("#txt-otp-cancel").val());
        var _payType = $('#cbo-cst-pay-type').val();

        //check otp
        if (isEmpty(_otpCode)) {
            notifyDanger("Vui lòng nhập OTP");
            $('#txt-otp-cancel').focus();
            return;
        }
        if (_otpCode.length > 8) {
            notifyDanger("Vui lòng nhập OTP tối đa 8 chử số");
            $("#txt-otp-cancel").focus();
            return;
        }
        $.ajax({
            url: '/otp/AuthOtp',
            type: 'get',
            dataType: 'json',
            data: { otpCode: _otpCode, phone: _phone, contractNo: _contractNo },
            success: function (response) {
                if (response.success === false) {
                    notifyDanger(response.message);
                    return;
                }
                contractCancelRegPostData.verifyCode = _otpCode;
                contractCancelRegPostData.payType = _payType;
                $.ajax({
                    url: '/MoneyInOut/ContractCancelReg',
                    type: 'post',
                    dataType: 'json',
                    data: contractCancelRegPostData,

                    success: function (response) {
                        if (response.success === true) {
                            $("#txt-otp-cancel").val("");
                            $("#step-4").removeClass("display-none").addClass("display-none");
                            $("#btn-contracts").trigger('click');                            
                            notifySuccess(response.message);
                        } else {
                            notifyDanger(response.message);
                        }
                    }
                });
            },
            error: function (request, status, error) {
                notifyDanger("Lỗi OTP: " + request.responseText);
                console.log(request.responseText);
            }
        });

    });

});



function calculator(pe, amount, refNo, productCode, productName, scheduleId, isAllow) {
    //var rs = 100;
    //$('btn-print').attr('disabled', true);
    ClearData();
    if (isAllow === "0") {
        notifyDanger("Tài khoản ví không tồn tại");
        return;
    }

    if (formatNumber(amount) <= 0) {
        notifyDanger("Không đủ số dư để thực hiện giao dịch");
        return;
    }
    $('#txtMoneyInOutAmt').focus();
    $('#txtAllowAmount').val(formatNumber(amount));
    $('#txtFeeAmount').val(0);
    $('#txtAmountAfter').val();
    $('#txtRefNo').val(refNo);
    $('#txtPeCode').val(pe);
    $('#txtProduct').val(productCode);
    $('#txtProductName').val(productName);
    $('#txtScheduleId').val(scheduleId);
    $('#pnlDetail').removeAttr('hidden');
    $('#btnMaster').removeAttr('hidden');
    $(location).attr('href', '#pnlDetail');
}
function cal(val) {
    if (val.value.length > 12 || !$.isNumeric(val.value.replace(/[^0-9-]+/g, ''))) {
        notifyDanger('Số bạn nhập không hợp lệ');
        $('#txtMoneyInOutAmt').val('');
        $('#txtAmountAfter').val('');
        return;
    }
    var allowAmount = $('#txtAllowAmount').val().replace(/[^0-9-]+/g, '');
    if (allowAmount === null || allowAmount === '')
        allowAmount = 0;
    if (parseInt(val.value) < 10000) {
        notifyDanger('Vui lòng nhập số tiền lớn hơn 10.000 vnđ');
        $('#txtMoneyInOutAmt').val('');
        $('#txtAmountAfter').val('');
        return;
    }
    var fee = $('#txtFeeAmount').val();
    if (!fee)
        fee = 0;
    var rs = parseInt(allowAmount) - parseInt(val.value.replace(/[^0-9-]+/g, '')) - fee;
    if (rs < 0) {
        notifyDanger('Bạn không thể rút số tiền vượt quá hạn số dư');
        $('#txtMoneyInOutAmt').val('');
        $('#txtAmountAfter').val('');
        $('#txtAmountString').text('');
        return;
    }


    $('#txtAmountAfter').val(formatNumber(rs));
    ReadMoney(val.value);
}

function bindCustomerList(page) {
    backToStep1();

    var pageSize = $(".mvc-grid-pager-rows").val();
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    $('#lblNotExist').text('');
    $('#lblEdongNotExist').text('');

    var param = {
        'pageNo': page,
        'pageSize': pageSize,
        'filter': $('#cboFilter').val(),
        'para': $('#txt-filter').val()
    };

    $.ajax({
        url: '/MoneyInOut/GetCustomerInfo',
        type: 'post',
        dataType: 'html',
        data: param,
        success: function (data) {
            if (data.trim().length > 0) {
                $('#divlblNotExist').attr("hidden", true);
                $('#divlblEdongNotExist').attr("@ViewBag.Hidden", false);
                var afterHtml = $(data);
                $("#step-1").html(afterHtml);
                $("#step-1").show();
            }
            else {
                $('#divlblNotExist').removeAttr('hidden');
                $('#lblNotExist').text('Không tồn tại khách hàng nào');
                $('#cusInfo').html('');
                $("#step-1").empty();
                $('#btnMaster').attr("hidden", true);
            }

        }
    });
}

function bindCustomerOverview(id) {
    var param = {
        'cstRegId': id
    };

    $.ajax({
        url: '/MoneyInOut/CustomerOverviewPartial',
        type: 'post',
        dataType: 'html',
        data: param,
        success: function (data) {
            if (data.trim().length > 0) {
                $('#divlblNotExist').attr("hidden", true);
                $('#divlblEdongNotExist').attr("@ViewBag.Hidden", false);
                var afterHtml = $(data);
                $("#step-2-1").html(afterHtml);
                $("#step-2-1").show();
            }
            else {
                $('#divlblNotExist').removeAttr('hidden');
                $('#lblNotExist').text('Không có dữ liệu');
                $('#cusInfo').html('');
                $("#step-2-1").empty();
                $('#btnMaster').attr("hidden", true);
            }
        }
    });
}

function bindMoneyOut() {
    var customer = $("#overview").data("overview");
    var param = {
        cstRegId: customer.CusRegOverview.cstRegId,
        accountDMD: customer.CusRegOverview.accountDMD
    };

    $.ajax({
        url: '/MoneyInOut/MoneyOutInfo',
        type: 'post',
        dataType: 'json',
        data: param,
        success: function (data) {
            //console.log(data);
            if (data !== null) {
                var defaultAmt = 0;
                $('#divlblNotExist').attr("hidden", true);
                $('#divlblEdongNotExist').attr("@ViewBag.Hidden", false);
                $('#money-out-amt-allowed').val(formatNumber(data.balAmt));
                var outAmt = data.balAmt > defaultAmt ? defaultAmt : 0;
                $('#money-out-amt').val(formatNumber(outAmt));
                var moneyOutAmt = AutoNumeric.getAutoNumericElement('#money-out-amt');
                moneyOutAmt.rawValue = outAmt;

                $("#otp-value").val("");

                ReadMoney($('#money-out-amt'));
                $('#money-out-fee').val(formatNumber(data.feeAmt));
                var allowedAfter = data.balAmt - data.feeAmt - defaultAmt;
                $('#money-out-amt-allowed-after').val(formatNumber(allowedAfter > 0 ? allowedAfter : 0));

                $("#btn-money-out-bill").prop('disabled', false);
                $("#btn-print-money-out-bill").prop('disabled', true);
            }
            else {
                $('#divlblNotExist').removeAttr('hidden');
                $('#lblNotExist').text('Không có dữ liệu');
            }
        }
    });
}

function ReadMoney(inputAmt) {
    var amtFormat = 0;
    var amt = $(inputAmt).val();
    try {
        amtFormat = amt.replace(/[^0-9-]+/g, '');
    } catch (e) {
        amtFormat = 0;
    }
    $.ajax({
        url: '/MoneyInOut/ReadMoney',
        type: 'post',
        dataType: 'json',
        data: { 'amt': amt.replace(/[^0-9-]+/g, '') },
        success: function (data) {
            var rs = data;
            $('#' + $(inputAmt).attr('id') + "-string").text(rs);
            $(inputAmt).val(formatNumber(amtFormat));
        }
    });
}

function printWithdraw(id, type, beginAmt) {
    $.ajax({
        dataType: 'html',
        type: 'post',
        url: '/MoneyInOut/PrintWithdraw',
        data: { "id": id, "type": type, "beginAmt": beginAmt },
        success: function (response) {

            $("#data-withdraw-info").html("").html(response);
            $("#data-withdraw-info").print({
                //Use Global styles
                globalStyles: false,
                //Add link with attrbute media=print
                mediaPrint: false,
                //Custom stylesheet
                stylesheet: "/css/print-invoice.css",
                //Print in a hidden iframe
                iframe: false,
                //Don't print this
                noPrintSelector: ".avoid-this",
                //Add this at top
                prepend: "",
                //Add this on bottom
                append: "",
                //Log to console when printing is done via a deffered callback
                deferred: $.Deferred().done(function () {
                    location.reload();
                })
            });
        }
    });
}

function validateMoneyOutForm() {
    var allowed = parseInt($('#money-out-amt-allowed').val().replace(/[^0-9-]+/g, ''));
    var amt = parseInt($('#money-out-amt').val().replace(/[^0-9-]+/g, ''));
    var fee = parseInt($('#money-out-fee').val().replace(/[^0-9-]+/g, ''));
    if (allowed - amt - fee < 0) {
        notifyDanger('Số dư không đủ.');
        return false;
    }
    var outAmt = parseInt($('#money-out-amt').val().replace(/[^0-9-]+/g, ''));
    if (outAmt % 1000 !== 0 || outAmt < 10000) {
        notifyDanger('Số tiền rút tối thiểu là 10.000 và số tiền phải tròn nghìn.');
        $('#money-out-amt').focus();
        return false;
    }

    if ($.trim($("#otp-value").val()) === "") {
        notifyDanger('Vui lòng nhập mã xác thực');
        $('#otp-value').focus();
        return false;
    }

    return true;
}

function validateMoneyInForm() {
    if (parseInt($('#money-in-amt').val().replace(/[^0-9-]+/g, '')) <= 0) {
        notifyDanger('Vui lòng nhập số tiền');
        $('#money-in-amt').focus();
        return false;
    }
    var outAmt = parseInt($('#money-in-amt').val().replace(/[^0-9-]+/g, ''));
    if (outAmt % 1000 !== 0 || outAmt < 10000) {
        notifyDanger('Số tiền tối thiểu là 10.000 và số tiền phải tròn nghìn.');
        $('#money-in-amt').focus();
        return false;
    }

    // comment - chờ rule nghiệp vụ chặn số tiền nộp tối đa start
    //var customer = $("#overview").data("overview");
    //var totalAmtNotPay = parseInt(customer.CusBillOverview.totalAmtNotPay);

    //if (outAmt > totalAmtNotPay) {
    //    notifyDanger('Không được nộp quá số tiền nợ đã phát sinh và chưa thanh toán .');
    //    $('#money-in-amt').focus();
    //    return false;
    //}
    // comment - chờ rule nghiệp vụ chặn số tiền nộp tối đa end


    return true;
}

function validateMoneyInWaitingForm() {
    //if (parseInt($('#money-in-amt').val().replace(/[^0-9-]+/g, '')) <= 0) {
    //    notifyDanger('Vui lòng nhập số tiền');
    //    $('#money-in-amt').focus();
    //    return false;
    //}

    if ($('#money-in-amt').val() !== "" && $('#money-in-amt').val() !== "0") {
        var outAmt = parseInt($('#money-in-amt').val().replace(/[^0-9-]+/g, ''));
        if (outAmt % 1000 !== 0 || outAmt < 10000) {
            notifyDanger('Số tiền tối thiểu là 10.000 và số tiền phải tròn nghìn.');
            $('#money-in-amt').focus();
            return false;
        }
    }
    

    var bankCode = $('#cboBankList').val();
    if (bankCode === '') {
        notifyDanger('Vui lòng chọn ngân hàng');
        $('#cboBankList').focus();
        return false;
    }

    var bankAccNo = $("#txt-bank_acc-no").val();
    if (bankAccNo === '') {
        notifyDanger('Vui lòng chọn số tài khoản');
        $('#txt-bank_acc-no').focus();
        return false;
    }

    // comment - chờ rule nghiệp vụ chặn số tiền nộp tối đa start
    //var customer = $("#overview").data("overview");
    //var totalAmtNotPay = parseInt(customer.CusBillOverview.totalAmtNotPay);

    //if (outAmt > totalAmtNotPay) {
    //    notifyDanger('Không được nộp quá số tiền nợ đã phát sinh và chưa thanh toán .');
    //    $('#money-in-amt').focus();
    //    return false;
    //}
    // comment - chờ rule nghiệp vụ chặn số tiền nộp tối đa end


    return true;
}

function convertToNum(value) {
    return parseInt(value.replace(/[^0-9-]+/g, ''));
}

function ClearData() {

    $('#txtMoneyInOutAmt').val('');
    $('#txtAllowAmount').val('');
    $('#txtFeeAmount').val(0);
    $('#txtAmountAfter').val('');
    $('#txtRefNo').val('');
    $('#txtPeCode').val('');
    $('#txtProduct').val('');
    $('#txtProductName').val('');
    $('#txtAmountString').text('');
    $("#txt-otp").val('');
    $('#txtScheduleId').val('');
}

function backToStep1() {
    $("#step-1").hide();
    $("#step-2").hide();
    $("#step-2-1").hide();
    $("#step-3").hide();
    $("#step-3-1").hide();
}

function submitMoneyOut() {
    var overview = $("#overview").data('overview');
    var param = {
        customerCode: overview.CusRegOverview.cstRegId,
        phone: $("#txt-cst-phone").val(),
        allowAmt: convertToNum($("#money-out-amt-allowed").val()),
        feeAmt: convertToNum($("#money-out-fee").val()),
        totalAmtDue: convertToNum($("#money-out-amt").val()),
        availableAmt: convertToNum($("#money-out-amt-allowed-after").val()),
        sender: overview.CusRegOverview.accountDMD,
        verifyCode: $("#otp-value").val()
    };
    $.ajax({
        url: '/MoneyInOut/MoneyOut',
        type: 'post',
        dataType: 'json',
        data: param,
        success: function (respone) {
            if (respone.success) {
                $("#btn-money-out-bill").prop('disabled', true);
                $("#btn-print-money-out-bill").prop('disabled', false);
                $("#btn-print-money-out-bill").data("id", respone.data.regId);
                $("#otp-value").val("");
                notifySuccess("Rút tiền thành công.");
            } else {
                notifyDanger(respone.message);
            }

        },
        error: function (request, status, error) {
            console.log(request.responseText);
        }
    });
}

function submitMoneyIn() {
    var overview = $("#overview").data('overview');
    var param = {
        cstRegId: overview.CusRegOverview.cstRegId,
        receiver: overview.CusRegOverview.accountDMD,
        amt: convertToNum($("#money-in-amt").val()),
        transType: 'I',
        bankCode: null,
        bankAccNo: null
    };
    $.ajax({
        url: '/MoneyInOut/MoneyIn',
        type: 'post',
        dataType: 'json',
        data: param,
        success: function (respone) {
            if (respone.success) {
                $("#btn-money-in-bill").prop('disabled', true);
                $("#btn-money-in-waiting").prop('disabled', true);
                $("#btn-print-money-in-bill").data("id", respone.data.regId);
                $("#btn-print-money-in-bill").prop('disabled', false);
                //notifySuccess("Nộp tiền thành công thành công.");
                notifySuccess(respone.message);

            } else {
                notifyDanger(respone.message);
            }
        },
        error: function (request, status, error) {
            console.log(request.responseText);
        }
    });
}


function submitMoneyInWaiting() {
    var overview = $("#overview").data('overview');

    var amt = 0;
    if ($('#money-in-amt').val()==="" || parseInt($('#money-in-amt').val().replace(/[^0-9-]+/g, '')) < 0) {
        amt = 0;
    } else {
        amt = convertToNum($("#money-in-amt").val());
    }

    var param = {
        cstRegId: overview.CusRegOverview.cstRegId,
        receiver: overview.CusRegOverview.accountDMD,
        amt: amt,
        transType: 'W',
        bankCode: $('#cboBankList').val(),
        bankAccNo: $("#txt-bank_acc-no").val()
    };
    $.ajax({
        url: '/MoneyInOut/MoneyInWaiting',
        type: 'post',
        dataType: 'json',
        data: param,
        success: function (respone) {
            if (respone.success) {
                $("#btn-money-in-bill").prop('disabled', true);
                $("#btn-money-in-waiting").prop('disabled', true);
                //$("#btn-print-money-in-bill").data("id", respone.data.regId);
                $("#btn-print-money-in-bill").prop('disabled', true);
                //notifySuccess("Nộp tiền thành công thành công.");
                notifySuccess(respone.message);

            } else {
                notifyDanger(respone.message);
            }
        },
        error: function (request, status, error) {
            console.log(request.responseText);
        }
    });
}

function bindGrid(page, containerEl, url, message) {
    var pageSize = 5;
    if (!page) page = 1;
    var customer = $("#overview").data("overview");
    var param = {
        "pageNo": page,
        "pageSize": pageSize,
        "isPaging": 1,
        "cstRegId": customer.CusRegOverview.cstRegId
    };

    $.ajax({
        url: url,
        type: 'post',
        dataType: 'html',
        data: param,
        success: function (data) {
            if (data.trim().length > 0) {
                var afterHtml = $(data);
                containerEl.html(afterHtml);
                containerEl.show();
            }
            else {
                notifyInfo(message);
            }
        }
    });
}

function loadBanks() {
    $("#cboBankList").html("");
    $("#txt-bank_acc-no").val("");
    $.ajax({
        dataType: 'json',
        url: '/Dictionary/GetBanksEcp',
        data: { },
        success: function (response) {
            if (response && response.success === true) {
                var items = response.data;
                $("#cboBankList").append($("<option></option>").val("").html(defaultSelect));
                $.each(items,
                    function (i, item) {
                        //if ('VIETBANK' === item.bankCode) {
                        //    $("#cboBankList").append($(`<option data-name='${item.bankAccNo}'></option>`).val(item.bankCode)
                        //        .html(item.bankName)
                        //        .attr('selected', true));
                        //} else {
                        //    $("#cboBankList").append($(`<option data-name='${item.bankAccNo}'></option>`).val(item.bankCode)
                        //        .html(item.bankName));
                        //}
                        $("#cboBankList").append($(`<option data-name='${item.bankAccNo}'></option>`).val(item.bankCode)
                            .html(item.bankName));
                    });
                setBankName();
            }
        }
    });
}

function setBankName() {
    $("#txt-bank_acc-no").val($("#cboBankList option:selected").attr("data-name"));
}