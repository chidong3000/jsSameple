(function ($) {
    var postData = {};
    var $formCheckCustomer = $("#frm-check-customer");
    var $formBank = $("#frm-bank");

    $(document).ready(function () {
        $formCheckCustomer.validate();
        $formBank.validate();
        bindCombobox();

        $('input[name="FilterValue"]').keypress(function (e) {
            var key = e.which;
            if (key === 13) {
                $('#btn-search-customer').click();
                return false;
            }
            return true;
        });

        $(document).on("change", "#cboFilter", function () {
            var value = $(this).val();
            $("#frm-search-customer").validate();

            $('#cboFilter').rules('remove', 'required');
            $('#cboFilter').rules('add', { required: true, messages: { required: "Vui lòng chọn" } });

            if (value === "CMND") {
                $('#txt-filter').rules('remove', 'validIdCitizen');
                $('#txt-filter').rules('remove', 'validPassport');
                $('#txt-filter').rules('remove', 'validEvn');

                $('#txt-filter').rules('add',
                    {
                        required: true,
                        validIdCard: true,
                        messages: {
                            required: "Vui lòng nhập"
                        }
                    });
            } else if (value === "CCCD") {
                $('#txt-filter').rules('remove', 'validIdCard');
                $('#txt-filter').rules('remove', 'validPassport');
                $('#txt-filter').rules('remove', 'validEvn');

                $('#txt-filter').rules('add',
                    {
                        required: true,
                        validIdCitizen: true,
                        messages: {
                            required: "Vui lòng nhập"
                        }
                    });
            } else if (value === "PASSPORT") {
                $('#txt-filter').rules('remove', 'validIdCard');
                $('#txt-filter').rules('remove', 'validIdCitizen');
                $('#txt-filter').rules('remove', 'validEvn');

                $('#txt-filter').rules('add',
                    {
                        required: true,
                        validPassport: true,
                        messages: {
                            required: "Vui lòng nhập"
                        }
                    });
            } else if (value === "EVN") {
                $('#txt-filter').rules('remove', 'validIdCard');
                $('#txt-filter').rules('remove', 'validIdCitizen');
                $('#txt-filter').rules('remove', 'validPassport');

                $('#txt-filter').rules('add',
                    {
                        required: true,
                        validEvn: true,
                        messages: {
                            required: "Vui lòng nhập"
                        }
                    });
            } else {
                $('#txt-filter').rules('remove', 'validIdCard');
                $('#txt-filter').rules('remove', 'validIdCitizen');
                $('#txt-filter').rules('remove', 'validPassport');
                $('#txt-filter').rules('remove', 'validEvn');

                $('#txt-filter').rules('add',
                    {
                        required: true,
                        messages: {
                            required: "Vui lòng nhập"
                        }
                    });
            }
        });

        $(document).on("change", "#cbo-cst-identity-type", function () {
            var value = $(this).val();
            var $thisCombo = $(this);
            var $thisInput = $("#txt-cst-identity-no");

            $thisCombo.rules('remove', 'required');
            $thisCombo.rules('add', { required: true, messages: { required: "Vui lòng chọn" } });

            if (value === "CMND") {
                $thisInput.rules('remove', 'validIdCitizen');
                $thisInput.rules('remove', 'validPassport');
                $thisInput.rules('remove', 'validEvn');

                $thisInput.rules('add',
                    {
                        required: true,
                        validIdCard: true,
                        messages: {
                            required: "Vui lòng nhập"
                        }
                    });
            } else if (value === "CCCD") {
                $thisInput.rules('remove', 'validIdCard');
                $thisInput.rules('remove', 'validPassport');
                $thisInput.rules('remove', 'validEvn');

                $thisInput.rules('add',
                    {
                        required: true,
                        validIdCitizen: true,
                        messages: {
                            required: "Vui lòng nhập"
                        }
                    });
            } else if (value === "PASSPORT") {
                $thisInput.rules('remove', 'validIdCard');
                $thisInput.rules('remove', 'validIdCitizen');
                $thisInput.rules('remove', 'validEvn');

                $thisInput.rules('add',
                    {
                        required: true,
                        validPassport: true,
                        messages: {
                            required: "Vui lòng nhập"
                        }
                    });
            } else {
                $thisInput.rules('remove', 'validIdCard');
                $thisInput.rules('remove', 'validIdCitizen');
                $thisInput.rules('remove', 'validPassport');
                $thisInput.rules('remove', 'validEvn');

                $thisInput.rules('add',
                    {
                        required: true,
                        messages: {
                            required: "Vui lòng nhập"
                        }
                    });
            }
        });

        $(document).on("change", "#cbo-bank", function() {
            var value = $(this).val();
            var $accountType = $("#cbo-bank-acc-type");
            var $accountNo = $("#txt-bank-acc-no");

            if (isEmpty(value) === true) {
                $accountType.rules('remove', 'required');
                $accountNo.rules('remove', 'required');
            } else {
                $accountType.rules('remove', 'required');
                $accountType.rules('add', { required: true, messages: { required: "Vui lòng chọn" } });

                $accountNo.rules('remove', 'required');
                $accountNo.rules('add', { required: true, messages: { required: "Vui lòng nhập" } });
            }
        });

        $(document).on("change", "#cboProduct", function () {
            var value = $(this).val();
            bindPeriodType(value);
            clearStep7();
        });

        $(document).on("change", "#cboProduct", function () {
            var value = $(this).val();
            bindPeriodType(value);
            clearStep7();
        });

        $(document).on("change", "#cboGiftList", function () {
            setPromoName();
        });

        $(document).on("click", "#btn-search-customer", function () {
            hideAllStep();
            clearAllValueStep();
            $('#chkpenone').prop('checked', false); // Unchecks it
            var $form = $("#frm-search-customer");
            $form.validate({
                rules: {
                    "Filter": {
                        required: true
                    },
                    "FilterValue": {
                        required: true
                    }
                },
                messages: {
                    "Filter": {
                        required: "Vui lòng chọn"
                    },
                    "FilterValue": {
                        required: "Vui lòng nhập"
                    }
                }
            });

            if ($form.valid() === true) {
                $("#btn-register-customer").removeClass("display-none");
                $.ajax({
                    url: '/PayInto/GetCustomerList',
                    type: 'get',
                    dataType: 'json',
                    data: { filter: $("select[name='Filter']").val(), filterValue: $.trim($("input[name='FilterValue']").val()) },
                    success: function (response) {
                        if (response && response.success === true) {
                            var items = response.data;
                            bindCustomerList(items);

                            if (items.length > 0) {
                                $("#step-1").find(".msg").html("");
                            } else {
                                $("#step-1").find(".msg").html("").html('<p class="text-danger"><strong>Không có KH nào thỏa điều kiện tìm kiếm</strong></p>');
                            }
                        } else {
                            $("#step-1").find("table tbody").html("");
                            $("#step-1").find("table").removeClass("display-none").addClass("display-none");

                            $("#step-1").find(".msg").html("").html(`<p class="text-danger"><strong>${response.message}</strong></p>`);
                        }
                    },
                    error: function (request) {
                        console.log(request.responseText);
                    }
                });
                return true;
            }
            return false;
        });

        $(document).on("click", ".btn-select-customer", function() {
            var $this = $(this);
            var customer = {
                id: $this.attr("data-id"),
                name: $this.attr("data-name"),
                phone: $this.attr("data-phone"),
                identityType: $this.attr("data-identity-type"),
                identityNo: $this.attr("data-identity-no")
            };

            showButtonRegister(true);
            bindCustomer(customer);
        });

        $(document).on("click", "#btn-check-customer", function () {
            $("#step-2").find(".msg").html("");
            showButtonRegister(false);

            $("#txt-cst-name").rules('add', { required: true, messages: { required: "Vui lòng nhập" } });
            $("#txt-cst-phone").rules('add', { required: true, validphone: true, messages: { required: "Vui lòng nhập" } });
            $("#cbo-cst-identity-type").rules('add', { required: true, messages: { required: "Vui lòng chọn" } });
            $("#txt-cst-identity-no").rules('add', { required: true, messages: { required: "Vui lòng nhập" } });

            if ($formCheckCustomer.valid() === true) {
                $.ajax({
                    url: '/PayInto/CheckCustomer',
                    type: 'get',
                    dataType: 'json',
                    data: { phone: $.trim($("#txt-cst-phone").val()), identityNo: $.trim($("#txt-cst-identity-no").val()) },
                    success: function (response) {
                        if (response && response.success === true) {
                            var data = response.data;
                            var items = data.items;
                            var isRegister = data.isRegister;

                            bindCustomerList(items);

                            if (items.length > 0 && isRegister === false) {
                                $("#step-2").find(".msg").html("").html('<p class="text-danger"><strong>KH đã tồn tại trong hệ thống. ' +
                                    'Vui lòng chọn KH từ danh sách KH hiện có</strong></p>');

                                disableCustomer(true);
                            } else {
                                $("#step-2").find(".msg").html("").html('<p class="text-success"><strong>Thông tin KH đăng ký mới hợp lệ</strong></p>');
                                showButtonRegister(true);
                            }

                            $("#btn-check-customer").removeClass("display-none").addClass("display-none");
                        } else {
                            notifyDanger(response.message);
                        }

                        var customer = {
                            id: "",
                            name: $.trim($("#txt-cst-name").val()),
                            phone: $.trim($("#txt-cst-phone").val()),
                            identityType: $.trim($("#cbo-cst-identity-type").val()),
                            identityNo: $.trim($("#txt-cst-identity-no").val()) 
                        };
                        bindCustomer(customer);
                    },
                    error: function (request) {
                        console.log(request.responseText);
                    }
                });
            }
        });

        $(document).on("click", "#btn-register-customer", function () {
            $("#cboFilter").val("");
            $("#txt-filter").val("");
            $("#totalBillReg").text("0");
            hideAllStep();
            clearAllValueStep();
            showButtonRegister(false);

            var customer = {
                id: "",
                name: "",
                phone: "",
                identityType: "",
                identityNo: ""
            };
            bindCustomer(customer);
        });

        $(document).on("click", "#btn-register-bank", function () {
            disableCustomer(true);
            var $this = $(this);
            $.ajax({
                url: '/PayInto/GetCustomerBank',
                type: 'get',
                dataType: 'json',
                data: { id: $this.attr("data-cst-id") },
                success: function(response) {
                    if (response && response.success === true) {
                        $("#step-3").removeClass("display-none");

                        var items = response.data;
                        if (items.length > 0) {
                            var html = "";
                            $.each(items, function(i, item) {
                                var id = item.cstBankId;
                                var bankCode = item.bankCode ? item.bankCode : "";
                                var bankName = item.bankName ? item.bankName : "";
                                var bankAccType = item.bankAccType ? item.bankAccType : "";
                                var bankAccTypeName = item.bankAccTypeName ? item.bankAccTypeName : "";
                                var accountNo = item.accountNo ? item.accountNo : "";

                                html += `<tr>
                                            <td class="text-center">${i + 1}</td>
                                            <td class="text-center">${bankCode}</td>
                                            <td class="text-left">${bankName}</td>
                                            <td class="text-center">${bankAccTypeName}</td>
                                            <td class="text-center">${accountNo}</td>
                                            <td class="text-center">
                                                <button class="btn btn-sm btn-secondary btn-select-bank" title="Chọn"
                                                    data-id='${id}' data-code='${bankCode}' data-name='${bankName}' data-acc-type='${bankAccType}' data-acc-no='${accountNo}'>
                                                    <i class="far fa-check-circle"></i> Chọn</button>
                                            </td>
                                        </tr>`;
                            });

                            $("#step-3").find("table").removeClass("display-none");
                            $("#step-3").find("table tbody").html("").html(html);
                        } else {
                            $("#step-3").find("table").removeClass("display-none").addClass("display-none");
                            $("#step-3").find("table tbody").html("");
                        }
                    } else {
                        notifyDanger(response.message);
                    }
                },
                error: function(request) {
                    console.log(request.responseText);
                }
            });
        });

        $(document).on("click", ".btn-select-bank", function() {
            var $this = $(this);
            var bank = {
                id: $this.attr("data-id"),
                bankCode: $this.attr("data-code"),
                bankName: $this.attr("data-name"),
                bankAccType: $this.attr("data-acc-type"),
                accountNo: $this.attr("data-acc-no")
            };
            bindBank(bank);
        });

        $(document).on("click", "#btn-bank-refresh", function() {
            bindBank();
        });

        $(document).on('input', "#txt-bank-acc-no, #txt-cst-name", function () {
            var input = $(this);
            var start = input[0].selectionStart;
            $(this).val(function (_, val) {
                return val.toUpperCase();
            });
            input[0].selectionStart = input[0].selectionEnd = start;
        });

        $(document).on("click", "#btn-register-service", function () {
            $("#step-4").find("table tbody").html("");
            $("#step-4").removeClass("display-none").addClass("display-none");
            $("#step-5").removeClass("display-none");   
            $("#oppenone").removeClass("display-none");   
            disableCustomer(true);

            var $this = $(this);
            var id = $this.attr("data-cst-id");
            if (id && id !== "0") {
                $.ajax({
                    url: '/PayInto/GetCustomerRegisted',
                    type: 'get',
                    dataType: 'json',
                    data: { id: id },
                    success: function (response) {
                        if (response && response.success === true) {
                            var items = response.data;
                            if (items.length > 0) {
                                var html = "";
                                $.each(items,
                                    function(i, item) {
                                        var productName = item.productName ? item.productName : "";
                                        var peCode = item.peCode ? item.peCode : "";
                                        var peName = item.peName ? item.peName : "";
                                        var peAddress = item.peAddress ? item.peAddress : "";
                                        var registerDate = formatDate(item.registerDate);
                                        var amount = formatNumber(item.amount);
                                        var periodName = item.periodName ? item.periodName : "";
                                        var periodAmount = formatNumber(item.periodAmount);
                                        var refNo = item.refNo ? item.refNo : "";

                                        html += `<tr>
                                            <td class="text-center">${i + 1}</td>
                                            <td class="text-left">${productName}</td>
                                            <td class="text-center">${peCode}</td>
                                            <td class="text-left">${peName}</td>
                                            <td class="text-left">${peAddress}</td>
                                            <td class="text-center">${registerDate}</td>
                                            <td class="text-right">${amount}</td>
                                            <td class="text-center">${periodName}</td>
                                            <td class="text-right">${periodAmount}</td>
                                            <td class="text-center">${refNo}</td>
                                        </tr>`;
                                    });

                                $("#step-4").find("table tbody").html("").html(html);
                                $("#step-4").removeClass("display-none");
                            } else {
                                $("#step-2").find(".msg").html("").html('<p class="text-danger"><strong>Khách hàng hiện chưa tham gia dịch vụ</strong></p>');
                            }
                        }
                    },
                    error: function(request) {
                        console.log(request.responseText);
                    }
                });
            } else {
                $("#step-2").find(".msg").html("").html('<p class="text-danger"><strong>Khách hàng hiện chưa tham gia dịch vụ</strong></p>');
            }
        });

        $(document).on("click", "#btn-check-evn", function () {
            clearStep7();           
            var $form = $("#frm-check-evn");
            $form.validate({
                rules: {
                    "PeCode": {
                        required: true
                    }
                },
                messages: {
                    "PeCode": {
                        required: "Vui lòng nhập"
                    }
                }
            });            
            if ($form.valid() === true) {
                $.ajax({
                    url: '/PayInto/CheckEvn',
                    type: 'get',
                    dataType: 'json',
                    data: { identity: $.trim($("#txt-cst-identity-no").val()), evnCode: $.trim($("#txt-peCode").val()) },
                    success: function (response) {
                        if (response && response.success === true) {
                            var data = response.data;
                            var details = data.details;
                            var flag = true;

                            bindEvn(data);

                            if (details.length > 0) {
                                $.map(details, function (val) {
                                    if (val.isRegister === false) flag = false;
                                });

                                if (flag === false) {
                                    $("#step-6").find(".msg").html("").html('<p class="text-danger"><strong>Mã điện đã được đăng ký tham gia CKSD-ĐBTT tại ECPAY</strong></p>');
                                }
                            }

                            if (flag === false) {
                                $("#step-5").find(".msg").html("").html('<p class="text-danger"><strong>Mã điện không đủ điều kiện đăng ký CKSD-ĐBTT tại ECPAY</strong></p>');
                                $("#step-7").removeClass("display-none").addClass("display-none");
                            } else {
                                $("#step-6").removeClass("display-none").addClass("display-none");
                                $("#step-6-1").removeClass("display-none").addClass("display-none");
                                $("#step-5").find(".msg").html("");
                                $("#step-7").removeClass("display-none");
                            }
                        } else {
                            notifyDanger(response.message);
                        }
                    },
                    error: function (request) {
                        console.log(request.responseText);
                    }
                });
                return true;
            }
            return false;
        });

        $(document).on("click", "#btn-calculator", function () {
            var $form = $("#form-payinto");
            $form.validate({
                rules: {
                    "Product": {
                        required: true
                    },
                    "PaymentAmt": {
                        required: true
                    },
                    "PeriodType": {
                        required: true
                    },
                    "DiscountType": {
                        required: true
                    },
                    "DiscountPay": {
                        required: true
                    }
                },
                messages: {
                    "Product": {
                        required: "Vui lòng chọn"
                    },
                    "PaymentAmt": {
                        required: "Vui lòng nhập"
                    },
                    "PeriodType": {
                        required: "Vui lòng chọn"
                    },
                    "DiscountType": {
                        required: "Vui lòng chọn"
                    },
                    "DiscountPay": {
                        required: "Vui lòng chọn"
                    }
                }
            });                       

            if ($form.valid() === true) {
                var nPaymentAmt = AutoNumeric.getAutoNumericElement('#txt-paymentAmt');
                var paymentAmt = nPaymentAmt.rawValue;
                if (paymentAmt < 50000 || paymentAmt % 10000 !== 0) {
                    notifyDanger("Số tiền không hợp lệ. Số tiền tối thiểu: 50.000 vnd và là bội số của 10.000");
                    return false;
                } else {
                    var params = {
                        "productId": $("#cboProduct").val(),
                        "paymentAmt": nPaymentAmt.rawValue,
                        "periodType": $("#cboPeriodType").val(),
                        "discountType": $("#cboDiscountType").val(),
                        "discountPayType": $("input[name='DiscountPay']:checked").attr("data-value")
                    };
                    $.ajax({
                        url: '/PayInto/CalcAmount',
                        type: 'post',
                        dataType: 'json',
                        data: params,
                        success: function (response) {
                            if (response && response.success === true) {
                                var data = response.data;
                                $("input[name='DiscountRate']").val(data.discountRate);
                                $("input[name='DiscountAmt']").val(formatNumber(data.discountAmt));
                                $("input[name='AmtAverage']").val(formatNumber(data.amtAverage));
                                $("input[name='TotalAmtDue']").val(formatNumber(data.totalAmtDue));
                                $("label[name='TotalAmtDueWord']").html(data.totalAmtDueWord);
                                $("input[name='DisburAmt']").val(formatNumber(data.disburAmt));
                                $("label[name='DisburAmtWord']").html(data.disburAmtWord);

                                postData.productId = $("#cboProduct").val();
                                postData.paymentType = "";
                                postData.paymentAmt = nPaymentAmt.rawValue;
                                postData.periodType = $("#cboPeriodType").val();
                                postData.discountType = $("#cboDiscountType").val();
                                postData.discountPayType = $("input[name='DiscountPay']:checked").attr("data-value");
                                postData.discountRate = data.discountRate;
                                postData.amtAverage = data.amtAverage;
                                postData.discountAmt = data.discountAmt;
                                postData.totalAmtDue = data.totalAmtDue;
                                postData.disburAmt = data.disburAmt;

                                $("#btn-payinto").removeClass("display-none");
                                
                                $("#btn-print").removeClass("display-none").addClass("display-none");
                                var discountpayType = $("input[name='DiscountPay']:checked").attr("data-value");
                                if (discountpayType === 'QT') {                                    
                                    $("#btn-paywaiting").removeClass("display-none").addClass("display-none");
                                } else {         
                                    $("#btn-paywaiting").removeClass("display-none");
                                    if ($("#chkpenone").prop('checked') == true) {                                                 
                                        $("#btn-paywaiting").removeClass("display-none").addClass("display-none");
                                    }
                                    else {                                          
                                        $("#btn-payinto").removeClass("display-none");
                                        $("#btn-paywaiting").removeClass("display-none");
                                    }
                                }

                            } else {
                                $("#btn-payinto").removeClass("display-none").addClass("display-none");
                                $("#btn-paywaiting").removeClass("display-none").addClass("display-none");
                                $("#btn-print").removeClass("display-none").addClass("display-none");
                                notifyDanger(response.message);
                            }
                        }
                    });
                    return true;
                }
            }
            return false;
        });

        $(document).on("click", "#btn-payinto", function () {
            var $this = $(this);
            var transType = $this.attr("data-trans-type");

            doRegister(transType);
        });

        $(document).on("click", "#btn-paywaiting", function () {
            var $this = $(this);
            var transType = $this.attr("data-trans-type");

            doRegister(transType);
        });

        $(document).on("click", "#btn-print", function () {
            var $this = $(this);
            var id = $this.attr("data-id");
            var transType = $this.attr("data-trans-type");
            printInvoice(transType, id);
        });

        $(document).on("click", "#btn-refresh", function () {
            $.confirm({
                title: 'Xác nhận?',
                content: 'Bạn muốn làm mới?',
                type: 'red',
                typeAnimated: true,
                buttons: {
                    tryAgain: {
                        text: 'Đồng ý',
                        btnClass: 'btn-red',
                        action: function () {
                            location.reload();
                        }
                    },
                    close: {
                        text: 'Hủy',
                        action: function () {
                        }
                    }
                }
            });
        });

        $(document).on("change", "#txt-paymentAmt, #cboPeriodType, #cboDiscountType, input[name='DiscountPay']", function () {           
            clearDataStep7();
        });

        $(document).on("click", "#chkpenone", function () {            
            if ($(this).is(":checked")) {
                $("#step-7").removeClass("display-none");
                $("#oppenone").removeClass("display-none").addClass("display-none");
                $(".evn-info").removeClass("display-none").addClass("display-none");                                
                $("#btn-paywaiting").removeClass("display-none").addClass("display-none");

                $("#txt-inning").val("");
                $("#txt-name").val("");
                $("#txt-phone").val("");
                $("#txt-typeName").val("");
                $("#txt-address").val("");
                $("#txt-peCode").val("");

                postData.custPeCode = "";
                postData.custPeIdx = "";
                postData.custPeType = "";
                postData.custPeName = "";
                postData.custPeAddress = "";
                postData.custPePhone = "";
            } else {
                $("#step-7").removeClass("display-none").addClass("display-none");
                $("#oppenone").removeClass("display-none");                
                $("#btn-payinto").removeClass("display-none").addClass("display-none");                               
            }
        });        
        
    });    

    function bindCustomerList(items) {
        if (items && items.length > 0) {
            var customerList = "";
            var totalbill = "";
            $.each(items,
                function (i, item) {
                    var id = item.cstRegId;
                    var name = item.customerName ? item.customerName : "";
                    var phone = item.customerPhone ? item.customerPhone : "";
                    var identityType = item.customerIdentityType ? item.customerIdentityType : "";
                    var identityTypeName = item.customerIdentityTypeName ? item.customerIdentityTypeName : "";
                    var identityNo = item.customerIdentityNo ? item.customerIdentityNo : "";
                    totalbill = item.totalBill ? item.totalBill : "0";
                    customerList += `<tr>
                                                <td class="text-center">${i + 1}</td>
                                                <td class="text-left">${name}</td>
                                                <td class="text-left">${identityTypeName}</td>
                                                <td class="text-center">${identityNo}</td>
                                                <td class="text-center">${phone}</td>
                                                <td class="text-center">${formatDate(item.regDate)}</td>
                                                <td class="text-center">
                                                    <button class="btn btn-sm btn-secondary btn-select-customer" title="Chọn"
                                                        data-id='${id}' data-name='${name}' data-phone='${phone}' data-identity-type='${identityType}' data-identity-no='${identityNo}'>
                                                        <i class="far fa-check-circle"></i> Chọn</button>
                                                </td>
                                            </tr>`;
                });
            $("#step-1").find("table tbody").html("").html(customerList);
            $("#step-1").find("table").removeClass("display-none");
            $("#totalBillReg").text(totalbill);
        } else {
            $("#step-1").find("table").removeClass("display-none").addClass("display-none");
            $("#step-1").find("table tbody").html("");
        }
    }

    function bindCustomer(customer) {
        $("#txt-cst-name").val(customer.name);
        $("#txt-cst-phone").val(customer.phone);
        $("#cbo-cst-identity-type").val(customer.identityType);
        $("#txt-cst-identity-no").val(customer.identityNo);

        $("#btn-register-bank").attr("data-cst-id", customer.id);
        $("#btn-register-service").attr("data-cst-id", customer.id);
        postData.cstregId = customer.id;

        if (customer && customer.id) {
            disableCustomer(true);
            $("#btn-check-customer").removeClass("display-none").addClass("display-none");
        } else {
            disableCustomer(false);
            $("#btn-check-customer").removeClass("display-none");
        }

        $("#step-2").removeClass("display-none");
    }

    function bindBank(bank) {
        if (bank && bank.id) {
            $("#hd-cst-bank-id").val(bank.id);
            $("#cbo-bank").val(bank.bankCode);
            $("#cbo-bank-acc-type").val(bank.bankAccType);
            $("#txt-bank-acc-no").val(bank.accountNo);
        } else {
            $("#hd-cst-bank-id").val("");
            $("#cbo-bank").val("");
            $("#cbo-bank-acc-type").val($("#cbo-bank-acc-type option:first").val());
            $("#txt-bank-acc-no").val("");
        }
    }

    function bindEvn(data) {
        if (data) {
            $("#txt-inning").val(data.inning);
            $("#txt-name").val(data.name);
            $("#txt-phone").val(data.phoneByProvider);
            $("#txt-typeName").val(data.cstPETypeName);
            $("#txt-address").val(data.address);

            postData.custPeCode = $.trim($("#txt-peCode").val());
            postData.custPeIdx = data.inning;
            postData.custPeType = data.cstPEType;
            postData.custPeName = data.name;
            postData.custPeAddress = data.address;
            postData.custPePhone = data.phoneByProvider;
            $(".evn-info").removeClass("display-none");
            var details = data.details;
            var debits = data.debit;

            if (details.length > 0) {
                var evnRegisted = "";
                $.each(details,
                    function(i, item) {
                        evnRegisted += `<tr>
                                            <td class="text-center">${i + 1}</td>
                                            <td class="text-left">${item.peCode ? item.peCode : ""}</td>
                                            <td class="text-left">${item.name ? item.name : ""}</td>
                                            <td class="text-left">${item.cstName ? item.cstName : ""}</td>
                                            <td class="text-left">${item.phoneNo ? item.phoneNo : ""}</td>
                                            <td class="text-left">${item.identify ? item.identify : ""}</td>
                                        </tr>`;
                    });
                $("#step-6 table tbody").html("").html(evnRegisted);
                $("#step-7").removeClass("display-none");
            } else {
                $("#step-6 table tbody").html("");
                $("#step-6").removeClass("display-none").addClass("display-none");
            }

            if (debits.length > 0) {
                var evnDebits = "";
                $.each(debits,
                    function(i, item) {
                        evnDebits += `<tr>
                                                <td class="text-center">${i + 1}</td>
                                                <td class="text-left">${item.peCode ? item.peCode : ""}</td>
                                                <td class="text-left">${item.name ? item.name : ""}</td>
                                                <td class="text-left">${item.address ? item.address : ""}</td>
                                                <td class="text-left">${item.period ? item.period : ""}</td>
                                                <td class="text-left">${item.debitType ? item.debitType : ""}</td>
                                                <td class="text-right">${formatNumber(item.debitAmt)}</td>
                                                <td class="text-center">${item.status ? item.status : ""}</td>
                                            </tr>`;
                    });
                $("#step-6-1 table tbody").html("").html(evnDebits);
                $("#step-6-1").removeClass("display-none");
            } else {
                $("#step-6-1 table tbody").html("");
                $("#step-6-1").removeClass("display-none").addClass("display-none");
            }
        } else {
            $("#txt-inning").val("");
            $("#txt-name").val("");
            $("#txt-phone").val("");
            $("#txt-typeName").val("");
            $("#txt-address").val("");

            postData.custPeCode = $.trim($("#txt-peCode").val());
            postData.custPeIdx = "";
            postData.custPeType = "";
            postData.custPeName = "";
            postData.custPeAddress = "";
            postData.custPePhone = "";

            $(".evn-info").removeClass("display-none").addClass("display-none");

            $("#step-6 table tbody").html("");
            $("#step-6").removeClass("display-none").addClass("display-none");

            $("#step-6-1 table tbody").html("");
            $("#step-6-1").removeClass("display-none").addClass("display-none");
        }
    }

    function showButtonRegister(flag) {
        if (flag && flag === true) {
            $("#btn-register-bank").removeClass("display-none");
            $("#btn-register-service").removeClass("display-none");
        } else {
            $("#btn-register-bank").removeClass("display-none").addClass("display-none");
            $("#btn-register-service").removeClass("display-none").addClass("display-none");
        }
    }

    function disableCustomer(flag) {
        if (!flag) {
            flag = false;
        }

        $("#btn-check-customer").removeClass("display-none").addClass("display-none");
        $("#txt-cst-name").prop('disabled', flag);
        $("#txt-cst-phone").prop('disabled', flag);
        $("#cbo-cst-identity-type").prop('disabled', flag);
        $("#txt-cst-identity-no").prop('disabled', flag);
    }

    function hideAllStep() {
        $("#step-1").find("table").removeClass("display-none").addClass("display-none");
        $("#step-1").find(".msg").html("");
        $("#step-1").each(function () {
            $(this).find("input").val("");
        });

        $("#step-2").removeClass("display-none").addClass("display-none");
        $("#step-2").find(".msg").html("");

        $("#step-3").removeClass("display-none").addClass("display-none");
        $("#step-3").find(".msg").html("");

        $("#step-4").removeClass("display-none").addClass("display-none");
        $("#step-4").find(".msg").html("");

        $("#step-5").removeClass("display-none").addClass("display-none");
        $("#step-5").find(".msg").html("");
        $("#step-5").each(function () {
            $(this).find("div.evn-info").removeClass("display-none").addClass("display-none");
        });

        $("#step-6").removeClass("display-none").addClass("display-none");
        $("#step-6").find(".msg").html("");

        $("#step-6-1").removeClass("display-none").addClass("display-none");

        $("#step-7").removeClass("display-none").addClass("display-none");
    }

    function clearAllValueStep() {
        $("#step-1, #step-2, #step-3, #step-4, #step-5, #step-6, #step-7, #step-8").each(function () {
            $(this).find("input").val("");
            $(this).find("label.lbl-data").html("");
            $(this).find("select").find('option:eq(0)').prop('selected', true);
        });
    }

    function clearStep7() {
        bindGiftList();       
        var discountpayType = $("input[name='DiscountPay']:checked").attr("data-value");
        if (discountpayType === 'QT') {
            $("#cboGiftList").removeClass("display-none");            
        } else {
            $("#cboGiftList").removeClass("display-none").addClass("display-none");
        }
        $("#step-7").each(function () {
            $(this).find("input").val("");
            $(this).find("label.lbl-data").html("");
            $(this).find("select").find('option:eq(0)').prop('selected', true);
        });

        $("#btn-payinto").removeClass("display-none").addClass("display-none");
        $("#btn-paywaiting").removeClass("display-none").addClass("display-none");
        $("#btn-print").removeClass("display-none").addClass("display-none");
    }

    function clearDataStep7() {
        var discountpayType = $("input[name='DiscountPay']:checked").attr("data-value");
        if (discountpayType === 'QT') {
            $("#cboGiftList").removeClass("display-none");
        } else {
            $("#cboGiftList").removeClass("display-none").addClass("display-none");
        }

        $("#step-7").each(function () {
            $(this).find("input.lbl-data").val("");
            $(this).find("label.lbl-data").html("");
        });

        $("#btn-payinto").removeClass("display-none").addClass("display-none");
        $("#btn-paywaiting").removeClass("display-none").addClass("display-none");
        $("#btn-print").removeClass("display-none").addClass("display-none");
    }

    function bindCombobox() {
        var id = $("#cboProduct").val();
        bindPeriodType(id);
        //bindGiftList(id);
    }

    function bindPeriodType(id) {
        var $thisCombobox = $("#cboPeriodType");
        $thisCombobox.html("");
        if (isEmpty(id) === false) {
            $.ajax({
                dataType: 'json',
                url: '/Dictionary/GetTermByProductId',
                data: { productId: id },
                success: function (response) {
                    if (response && response.success === true) {
                        var items = response.data;
                        $thisCombobox.append($("<option></option>").val("").html(defaultSelect));
                        $.each(items, function (i, item) {
                            $thisCombobox.append($("<option></option>").val(item.code).html(item.name));
                        });
                        bindDiscountType(id);
                    }
                }
            });
        }
    }

    function bindDiscountType(id) {
        var $thisCombobox = $("#cboDiscountType");
        $thisCombobox.html("");
        if (isEmpty(id) === false) {
            $.ajax({
                dataType: 'json',
                url: '/Dictionary/GetDiscountTypeByProductId',
                data: { productId: id },
                success: function (response) {
                    if (response && response.success === true) {
                        var items = response.data;
                        $.each(items, function (i, item) {
                            $thisCombobox.append($("<option></option>").val(item.code).html(item.name));
                        });
                    }
                }
            });
        }
    }

    function bindGiftList() {
        $("#cboGiftList").html("");
        $("#txt-promoCode").val("");
        $.ajax({
            dataType: 'json',
            url: '/Dictionary/GetGifts',
            data: {},
            success: function (response) {
                if (response && response.success === true) {
                    var items = response.data;
                    $("#cboGiftList").append($("<option></option>").val("").html(defaultSelect));
                    $.each(items,
                        function (i, item) {                            
                            $("#cboGiftList").append($(`<option data-name='${item.promoCode}'></option>`).val(item.giftCode)
                                .html(item.giftName));
                        });
                    setPromoName();
                }
            }
        });
    }

    function setPromoName() {
        $("#txt-promoCode").val($("#cboGiftList option:selected").attr("data-name"));
    }	

    function printInvoice(transType, id) {
        $.ajax({
            dataType: 'html',
            type: 'get',
            url: '/PayInto/PrintInvoicePayInto',
            data: { transType: transType, id: id },
            success: function (response) {
                $("#data-invoice").html("").html(response);

                $("#data-invoice").print({
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
                    deferred: $.Deferred().done(function () { location.reload(); })
                });
            }
        });
    }

    function doRegister(transType) {
        postData.transType = transType;
        postData.cstBankId = $("#hd-cst-bank-id").val();
        postData.bankCode = $("#cbo-bank").val();
        postData.accNoType = $("#cbo-bank-acc-type").val();
        postData.accountNo = $.trim($("#txt-bank-acc-no").val());

        postData.custName = $.trim($("#txt-cst-name").val());
        postData.custPhone = $.trim($("#txt-cst-phone").val());
        postData.custIdentityType = $("#cbo-cst-identity-type").val();
        postData.custIdentify = $.trim($("#txt-cst-identity-no").val());
        postData.giftCode = $("#cboGiftList").val();
        postData.promoCode = $("#txt-promoCode").val();
        var discountPayType = $("input[name='DiscountPay']:checked").attr("data-value");
        if (discountPayType === "QT" && postData.giftCode === "" ) {
            notifyDanger("Vui lòng chọn quà tặng");
            return false;
        }
        if ($formBank.valid() === true) {
            var beforeAmt = postData.paymentAmt;
            var nPaymentAmt = AutoNumeric.getAutoNumericElement('#txt-paymentAmt');
            var paymentAmt = nPaymentAmt.rawValue;
            if (Number(beforeAmt) === Number(paymentAmt)) {
                $.ajax({
                    url: '/PayInto/Register',
                    type: 'post',
                    dataType: 'json',
                    data: postData,
                    success: function (response) {
                        if (response && response.success === true) {
                            $("#btn-print").attr("data-id", response.data.result);

                            if (transType === "I")
                                $("#btn-print").removeClass("display-none");
                            else
                                $("#btn-print").removeClass("display-none").addClass("display-none");

                            $("#btn-payinto").removeClass("display-none").addClass("display-none");
                            $("#btn-paywaiting").removeClass("display-none").addClass("display-none");
                            notifySuccess(response.message);
                        } else {
                            notifyDanger(response.message);
                        }
                    }
                });
            } else {
                notifyDanger("Số tiền cần tính toán không hợp lệ. Vui lòng tính toán lại");
            }
        } else {
            $('html, body').animate({
                scrollTop: $("#step-3").offset().top - 60
            }, 500);
        }
    }
})(jQuery);
