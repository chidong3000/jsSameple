var uiLibrary = 'bootstrap4';
var $postData = $("#post-data");
var dialog1;
var grid;
$(document).ready(function () {
    $('#btn-quit').on('click', function (e) {
        window.location.href = "Home";
    });

    $('#btn-search-cust').on('click', function (e) {
        ClearData();
        var filter = $('#cboFilter').val();
        var para = $('#txt-filter').val();
        if (para === null ||para ==='') {
            notifyDanger("Vui lòng điều kiện cần tìm");
            $('#txt-filter').focus(); 
            return;
        }
        if (filter === 'CMND' && !$.isNumeric(para)) {
            notifyDanger("Vui lòng nhập số cho CMND");
            return;
        }
        $('#pnlDetail').attr("hidden", true);
        $('#btnMaster').attr("hidden", true);
        
        e.preventDefault();
        bindGrid();
    });
    $(document).on("click", "#btn-otp", function () {
        var name = $.trim($("#txtFullName").val());
        var phone = $.trim($("#txtPhone").val());
        var peCode = $.trim($("#txtPeCode").val());
        var contractNo = $.trim($("#txtRefNo").val());
        var withdrawAmt = $.trim($("#txtWithdrawAmt").val());
        
        if (isEmpty(phone)) {
            
            notifyDanger("Vui lòng nhập số điện thoại");
            return;
        }
        else if (isEmpty(withdrawAmt) || convertToNum(withdrawAmt) <= 0) {
            $("#txtWithdrawAmt").focus();
            notifyDanger("Vui lòng nhập số tiền rút");
            return;
        }
        else if (validatePhone(phone) === false) {
            notifyDanger("Vui lòng nhập số điện thoại hợp lệ");
            return;
        } else {
            $.ajax({
                url: '/otp/RequestOtp',
                type: 'get',
                dataType: 'json',
                data: { custPeCode: peCode, phone: phone, contractNo: contractNo },
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
        var _withdrawAmt = $.trim($("#txtWithdrawAmt").val()).replace(/[^0-9-]+/g, '');
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
        if (isEmpty(_verifyCode))
        {
            notifyDanger("Vui lòng nhập OTP");
            $('#txt-otp').focus();
            return;
        }
        if (isEmpty(_withdrawAmt)) {
            notifyDanger("Vui lòng nhập số tiền rút");
            $('#txtWithdrawAmt').focus();
            return;
        }
        if (isEmpty(_verifyCode.length>8)) {
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
                    totalAmtDue: _withdrawAmt,
                    allowAmt: _amountAllow,
                    feeAmt: '0',
                    availableAmt: _amountAfter,
                    totalAmtDueText: _amtString,
                    verifyCode: _verifyCode,
                    payementMethod:'COD',
                    custPhone:_custName,
                    custName: _custPhone ,
                    custIdentify: _custIdentify,
                    custIdentifyType: _custIdentifyType,
                    scheduleId: _scheduleId
                };
                $.ajax({
                    url: '/Withdraw/SaveWithdraw',
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
                notifyDanger("Lỗi OTP:" + request.responseText);
                console.log(request.responseText);
            }
        });


        
    });
    $(document).on("click", "#btn-print", function () {
        if ($('#txtResponeData').val()!=='')
            printWithdraw($('#txtResponeData').val());
    });

});
//function getCustomerInfo(filter,para) {
//    source = '/Withdraw/GetCustomerInfo?filter=' + filter + '&para=' + para;
//    var grid, onSuccessFunc = function (response) {
//        //alert('The result contains ' + response.records.length + ' records.');

//        grid.render(response.peList);
//        BindCustomerInfo(response.customerInfo);
       
//    };
//    grid = $('#grid-customer').grid({
//        primaryKey: 'peCode',
//        dataSource: { url: source, data: {}, success: onSuccessFunc },

//        uiLibrary: 'bootstrap4',
//        notFoundText: 'Không có dữ liệu phù hợp.',
//        fontSize: '12px',
//        headerRowHeight: 'autogrow',

//        columns: [
            
//            { field: 'peCode', title: 'Mã KHEVN', width: '5%' },
//            { field: 'peName', title: 'Họ tên KH EVN', width: '10%', headerCssClass: 'grid-header-primary' },
//            { field: 'peAddress', title: 'Địa chỉ KH EVN', width: '10%', headerCssClass: 'grid-header-primary' },
//            { field: 'registerDate', sortable: true, title: 'Ngày đăng ký', dataType: 'string', width: '10%', headerCssClass: 'grid-header-primary' },
//            { field: 'periodAmount', sortable: true, title: 'Số tiền', width: '10%', headerCssClass: 'grid-header-primary' },
            
//            { field: 'periodName', sortable: true, title: 'Kỳ hạn', width: '10%', headerCssClass: 'grid-header-primary' },
//            { field: 'periodAmount', sortable: true, title: 'Số tiền 01 kỳ', width: '10%', headerCssClass: 'grid-header-primary' },
//            { field: 'periodPaidNumber', sortable: true, title: 'Số kỳ đã chi', width: '10%', headerCssClass: 'grid-header-primary' },
//            { field: 'periodRequireNumber', sortable: true, title: 'Số kỳ còn lại', width: '10%', headerCssClass: 'grid-header-primary' },
//            { field: 'allowAmount', sortable: true, title: 'Số tiền được rút', width: '10%', headerCssClass: 'grid-header-primary' },
//            //{ title: '', field: 'Lock', width: "5%", tooltip: 'Khóa/Mở khóa', events: { 'click': Lock }, renderer: lockRenderer, headerCssClass: 'grid-header-primary' },
//            { tmpl: 'Rút tiền', field: 'edit', title: 'Thao tác', width: '10%', tooltip: 'Chọn', headerCssClass: 'grid-header-primary', events: { 'click': Edit } }
            

//        ],
//        pager: { enable: true, limit: 10, sizes: [10, 20, 50, 100] }
//    });
//}
//function BindCustomerInfo(data) {
//    if (data !== null) {
//        $('#txtFullName').val(data.customerName);
//        $('#txtPhone').val(data.customerPhone);
//        $('#txtCmnd').val(data.customerIdentityNo);
//    }
//}
//function Edit(e) {
//    var rs = e.data.record;
//    var peCode = e.data.id;
//    var allowAmount = rs.allowAmount;
//    var fee = '';
//    $('#txtAllowAmount').val(allowAmount);
//    $('#txtFeeAmount').val( fee);
    
//    $('#pnlDetail').removeAttr('hidden');
//    $('#btnMaster').removeAttr('hidden');
    


//}
function calculator(pe, amount, refNo,productCode,productName,scheduleId,isAllow) {
    //var rs = 100;
    //$('btn-print').attr('disabled', true);
    ClearData();
    if (isAllow === "0") {
        notifyDanger("Tài khoản ví không tồn tại");
        return;
    }
    var withdrawamt = parseInt(amount);
    if (withdrawamt <= 0) {
        notifyDanger("Không đủ số dư để thực hiện giao dịch");
        return;
    }
    $('#txtWithdrawAmt').focus();
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
        $('#txtWithdrawAmt').val('');
        $('#txtAmountAfter').val('');
        return;
    }
    var allowAmount = $('#txtAllowAmount').val().replace(/[^0-9-]+/g, '');
    if (allowAmount === null || allowAmount==='')
        allowAmount = 0;
    if (parseInt(val.value) < 10000) {
        notifyDanger('Vui lòng nhập số tiền lớn hơn 10.000 vnđ');
        $('#txtWithdrawAmt').val('');
        $('#txtAmountAfter').val('');
        return;
    }
    var fee = $('#txtFeeAmount').val();
    if (!fee)
        fee = 0;
    var rs = parseInt(allowAmount) - parseInt(val.value.replace(/[^0-9-]+/g, '')) - fee;
    if (rs < 0) {
        notifyDanger('Bạn không thể rút số tiền vượt quá hạn số dư');
        $('#txtWithdrawAmt').val('');
        $('#txtAmountAfter').val('');
        $('#txtAmountString').text('');
         return;
    }
    
        
    $('#txtAmountAfter').val(formatNumber(rs));
    ReadMoney(val.value);
}


function bindGrid(page) {
    
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
            url: '/Withdraw/GetCustomerInfo',
            type: 'post',
            dataType: 'html',
            data: param,
            success: function (data) {
                if (data.trim().length > 0) {
                    $('#divlblNotExist').attr("hidden", true);
                    $('#divlblEdongNotExist').attr("@ViewBag.Hidden", false);
                    var spanElement = $(data).find('div#pnlCustomer').get(0);
                    $('#cusInfo').html($(spanElement.innerHTML));
                    var afterHtml = $(data);
                    afterHtml.find('div#pnlCustomer').remove();
                    $("#data-grid").html(afterHtml);
                }

                else {
                    $('#divlblNotExist').removeAttr('hidden');
                    $('#lblNotExist').text('Không tồn tại hợp đồng được phép rút tiền');
                    $('#cusInfo').html('');
                    $("#data-grid").empty();
                    $('#btnMaster').attr("hidden", true);
                }
                    
            }
        });
    
}
function ReadMoney(amt) {
    var amtFormat = 0;
    try {
        amtFormat = $('#txtWithdrawAmt').val().replace(/[^0-9-]+/g, '');
    } catch (e) {
        amtFormat = 0;
    }
    
    
    $.ajax({
        url: '/Withdraw/ReadMoney',
        type: 'post',
        dataType: 'json',
        data: { 'amt': amt.replace(/[^0-9-]+/g, '') },
        success: function (data) {
            var rs = data;
            $('#txtAmountString').text(rs);
            $('#txtWithdrawAmt').val(formatNumber(amtFormat));
        }
    });
}
function printWithdraw(id) {
    $.ajax({
        dataType: 'html',
        type: 'post',
        url: '/Withdraw/PrintWithdraw',
        data: { "id": id },
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
function validateForm() {
    if (parseInt($('#txtWithdrawAmt').val().replace(/[^0-9-]+/g, '')) <= 0) {
        notifyDanger('Bạn vui lòng nhập số tiền rút'); 
        $('#txtWithdrawAmt').focus();
        return; 
    }
    return true;
}
function convertToNum(value) {
    return parseInt(value.replace(/[^0-9-]+/g, ''));
}
function ClearData() {

    $('#txtWithdrawAmt').val('');
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