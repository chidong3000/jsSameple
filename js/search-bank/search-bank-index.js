(function ($) {
    var postData = {};
    var $formCheckCustomer = $("#frm-check-customer");
    var $formBank = $("#frm-bank");

    $(document).ready(function () {
        $formCheckCustomer.validate();
        $formBank.validate();
        bindCombobox();

        $.validator.addMethod(
            "regex",
            function (value, element, regexp) {
                return this.optional(element) || regexp.test(value);
            },
            "Please check your input."
        );

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

        $(document).on("click", "#btn-search-customer", function () {
            hideAllStep();
            clearAllValueStep();

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
                identityNo: $this.attr("data-identity-no"),
                isOutBank: $this.attr("data-isOutBank")
            };

            //showButtonRegister(true);
            bindCustomer(customer);

            var id = $this.attr("data-id");
            // step-4
            bindCustomerRegisted(id);
            // step-4-2
            bindCustomerBank(id);
			
        });

        $(document).on('input', "#bankAccountNo", function () {
            var input = $(this);
            var start = input[0].selectionStart;
            $(this).val(function (_, val) {
                return val.toUpperCase();
            });
            input[0].selectionStart = input[0].selectionEnd = start;
        });

        $(document).on("click", "#step-4-2 .btn-select-bank", function () {
            // step-5
            $("#step-5").removeClass("display-none");
            $("#btn-update-bank").removeClass("display-none");
            var $this = $(this);
            var id = $this.attr("data-id");
            var cstBankId = $this.attr("data-cstBankId");
            var bankCode = $this.attr("data-bankCode");
            var bankAccType = $this.attr("data-bankAccType");
            var accountNo = $this.attr("data-accountNo");
            var status = $this.attr("data-status");
            var isDefault = $this.attr("data-isDefault");
            if (id && id !== "0") {
                $("#btn-save-bank").attr({
                    'data-id': id,
                    'data-cstBankId': cstBankId,
                    'data-status': status,
                    'data-isDefault': isDefault
                });
                $("#btn-update-bank button").attr({
                    'data-id': id,
                    'data-cstBankId': cstBankId
                });
                $("#bankCode").val(bankCode);
                $("#bankAccType").val(bankAccType);
                $("#bankAccountNo").val(accountNo);
                $("#btn-update-bank button").removeClass("display-none");
                $("#btn-update-bank button[data-status='" + status + "']").addClass("display-none");
            } else {
                $("#step-5").find(".msg").html("").html('<p class="text-danger"><strong>Không có thông tin ngân hàng</strong></p>');
            }
        });

        $(document).on("click", "#step-4-2 .rdo-isDefault", function () {
            var $this = $(this);
            var id = $this.attr("data-id");
            var cstBankId = $this.attr("data-cstBankId");
            var bankCode = $this.attr("data-bankCode");
            var bankAccType = $this.attr("data-bankAccType");
            var accountNo = $this.attr("data-accountNo");
            var status = $this.attr("data-status");

            postData.cstRegId = id;
            postData.bank = {};
            postData.bank.bankCode = bankCode;
            postData.bank.bankAccType = bankAccType;
            postData.bank.accountNo = accountNo;
            postData.bank.cstBankId = cstBankId;
            postData.bank.status = status;
            postData.bank.isDefault = "1";

            $.ajax({
                url: '/SearchBank/RegisterSearchBank',
                type: 'post',
                dataType: 'json',
                data: postData,
                success: function (response) {
                    if (response && response.success === true) {
                        clearStep5();
                        bindCustomerBank(id);
                        notifySuccess("Cập nhật tài khoản ngân hàng mặc định thành công");
                    } else {
                        notifyDanger(response.message);
                    }
                }
            }).always(function () {
                // step-4-2
            });
        });

        $(document).on("click", "#btn-update-bank button", function () {
            var $this = $(this);
            var id = $this.attr("data-id");
            var cstBankId = $this.attr("data-cstBankId");
            var status = $this.attr("data-status");
            var isDefault = $this.attr("data-isDefault");
            var $form = $("#form-reg-bank");
            $form.validate({
                rules: {
                    "BankCode": {
                        required: true
                    },
                    "BankAccType": {
                        required: true
                    },
                    "BankAccountNo": {
                        required: true,
                        regex: /^[A-Z0-9]{16,25}$/
                    }
                },
                messages: {
                    "BankCode": {
                        required: "Vui lòng chọn"
                    },
                    "BankAccType": {
                        required: "Vui lòng chọn"
                    },
                    "BankAccountNo": {
                        required: "Vui lòng nhập",
                        regex: "Vui lòng nhập đúng định dạng"
                    }
                }
            });

            if ($form.valid() === true) {
                postData.cstRegId = id;
                postData.isOutBank = ($("#isOutBank").is(":checked") ? "1" : "0");
                postData.bank = {};
                postData.bank.bankCode = $.trim($("#bankCode").val());
                postData.bank.bankAccType = $.trim($("#bankAccType").val());
                postData.bank.accountNo = $.trim($("#bankAccountNo").val());
                postData.bank.cstBankId = cstBankId;
                postData.bank.status = status;
                postData.bank.isDefault = isDefault;

                $.ajax({
                    url: '/SearchBank/RegisterSearchBank',
                    type: 'post',
                    dataType: 'json',
                    data: postData,
                    success: function (response) {
                        if (response && response.success === true) {
                            clearStep5();
                            bindCustomerBank(id);
                            var noti = response.message;
                            if (status == "A")
                                noti = "Đăng ký lại tài khoản thành công";
                            if (status == "P")
                                noti = "Ngừng sử dụng tài khoản thành công";
                            notifySuccess(noti);
                        } else {
                            notifyDanger(response.message);
                        }
                    }
                }).always(function () {
                    // step-4-2
                });
                return true;
            }
            return false;
        });

        $(document).on("click", "#btn-register-bank", function () {
            clearStep5();
            $("#step-5-2").addClass("display-none");
            $("#step-5").removeClass("display-none");
            $("#btn-save-bank").attr({
                'data-cstBankId': "",
                'data-status': "",
                'data-isDefault': ""
            });
            $("#btn-update-bank").addClass("display-none");
        });

        $(document).on("click", "#btn-save-bank", function () {
            var $this = $(this);
            var id = $this.attr("data-id");
            var cstBankId = $this.attr("data-cstBankId");
            var status = $this.attr("data-status");
            var isDefault = $this.attr("data-isDefault");
            var $form = $("#form-reg-bank");
            $form.validate({
                rules: {
                    "BankCode": {
                        required: true
                    },
                    "BankAccType": {
                        required: true
                    },
                    "BankAccountNo": {
                        required: true,
                        regex: /^[A-Z0-9]{16,25}$/
                    }
                },
                messages: {
                    "BankCode": {
                        required: "Vui lòng chọn"
                    },
                    "BankAccType": {
                        required: "Vui lòng chọn"
                    },
                    "BankAccountNo": {
                        required: "Vui lòng nhập",
                        regex: "Vui lòng nhập đúng định dạng"
                    }
                }
            });

            if ($form.valid() === true) {
                postData.cstRegId = id;
                postData.isOutBank = ($("#isOutBank").is(":checked") ? "1" : "0");
                postData.bank = {};
                postData.bank.bankCode = $.trim($("#bankCode").val());
                postData.bank.bankAccType = $.trim($("#bankAccType").val());
                postData.bank.accountNo = $.trim($("#bankAccountNo").val());
                postData.bank.cstBankId = cstBankId;
                postData.bank.status = status;
                postData.bank.isDefault = isDefault;

                $.ajax({
                    url: '/SearchBank/RegisterSearchBank',
                    type: 'post',
                    dataType: 'json',
                    data: postData,
                    success: function (response) {
                        if (response && response.success === true) {
                            clearStep5();
                            bindCustomerBank(id);
                            notifySuccess("Lưu thành công");
                        } else {
                            notifyDanger(response.message);
                        }
                    }
                }).always(function () {
                    // step-4-2
                });
                return true;
            }
            return false;
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

        $(document).on("change", "#txt-paymentAmt, #cboPeriodType, #cboDiscountType, input[name='DiscountPay']", function() {
            clearDataStep7();
        });
    });

    function bindCustomer(customer) {
        $("#txt-cst-name").val(customer.name);
        $("#txt-cst-phone").val(customer.phone);
        $("#cbo-cst-identity-type").val(customer.identityType);
        $("#txt-cst-identity-no").val(customer.identityNo);

        $("#btn-register-bank").attr("data-cst-id", customer.id);
        $("#btn-register-service").attr("data-cst-id", customer.id);
        postData.cstregId = customer.id;

        disableCustomer(true);
        $("#btn-check-customer").removeClass("display-none").addClass("display-none");

        $("#step-2").removeClass("display-none");
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

        $("#step-4-2").removeClass("display-none").addClass("display-none");
        $("#step-4-2").find(".msg").html("");

        $("#step-5").removeClass("display-none").addClass("display-none");
        $("#step-5").find(".msg").html("");
        $("#step-5").each(function () {
            $(this).find("div.evn-info").removeClass("display-none").addClass("display-none");
        });

        $("#step-5-2").removeClass("display-none").addClass("display-none");
        $("#step-5-2").find(".msg").html("");

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

    function clearStep5() {
        $("#step-5").each(function () {
            $(this).find("input").val("");
            $(this).find("label.lbl-data").html("");
            $(this).find("select").find('option:eq(0)').prop('selected', true);
            $(this).find("div.evn-info").removeClass("display-none").addClass("display-none");
        });
    }

    function clearStep7() {
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

    // Load danh sách khách hàng đăng ký
    function bindCustomerList(items) {
        var $step = $('#step-1');
        if (items && items.length > 0) {
            var pageLength = 2;
            var $table = myDataTable($step.find("table"), pageLength);
            $.each(items,
                function (i, item) {
                    var id = item.cstRegId;
                    var name = item.customerName ? item.customerName : "";
                    var phone = item.customerPhone ? item.customerPhone : "";
                    var identityType = item.customerIdentityType ? item.customerIdentityType : "";
                    var identityTypeName = item.customerIdentityTypeName ? item.customerIdentityTypeName : "";
                    var identityNo = item.customerIdentityNo ? item.customerIdentityNo : "";
                    var isOutBank = item.isOutBank ? item.isOutBank : "";

                    var tr = `<tr>
                                <td class="text-center">${i + 1}</td>
                                <td class="text-left">${name}</td>
                                <td class="text-left">${identityTypeName}</td>
                                <td class="text-center">${identityNo}</td>
                                <td class="text-center">${phone}</td>
                                <td class="text-center">${formatDate(item.regDate)}</td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-secondary btn-select-customer" title="Chọn"
                                        data-id='${id}'
                                        data-name='${name}'
                                        data-phone='${phone}'
                                        data-identity-type='${identityType}'
                                        data-identity-no='${identityNo}'
                                        data-isOutBank='${isOutBank}'>
                                    <i class="far fa-check-circle"></i> Chọn</button>
                                </td>
                            </tr>`;
                    $table.row.add($(tr)).draw();
                });
            $step.find("table").removeClass("display-none");
            var rowPaging = $step.find(".dataTables_wrapper .row .dataTables_paginate").parent().parent();
            rowPaging.removeClass("display-none");
            if (items.length <= pageLength) rowPaging.addClass("display-none");
        } else {
            $step.find("table").removeClass("display-none").addClass("display-none");
            $step.find("table tbody").html("");
        }
    }

    // Load danh sách hợp đồng
    function bindCustomerRegisted(id) {
        // step-4
        var $step = $('#step-4');
        $step.find("table tbody").html("");
        $step.removeClass("display-none");
        $step.find(".msg").html("");
        $("#step-4-2").removeClass("display-none").addClass("display-none");
        disableCustomer(true);
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
                            var pageLength = 3;
                            var $table = myDataTable($step.find("table"), pageLength);
                            $.each(items,
                                function (i, item) {
                                    var productName = item.productName ? item.productName : "";
                                    var peCode = item.peCode ? item.peCode : "";
                                    var peName = item.peName ? item.peName : "";
                                    var peAddress = item.peAddress ? item.peAddress : "";
                                    var registerDate = formatDate(item.registerDate);
                                    var amount = formatNumber(item.amount);
                                    var periodName = item.periodName ? item.periodName : "";
                                    var periodAmount = formatNumber(item.periodAmount);
                                    var refNo = item.refNo ? item.refNo : "";
                                    var tr = `<tr>
                                                <td class="text-center">${i + 1}</td>
                                                <td class="text-left">${productName}</td>
                                                <td class="text-left">${peCode}</td>
                                                <td class="text-left">${peName}</td>
                                                <td class="text-left">${peAddress}</td>
                                                <td class="text-center">${registerDate}</td>
                                                <td class="text-right">${amount}</td>
                                                <td class="text-center">${periodName}</td>
                                                <td class="text-right">${periodAmount}</td>
                                                <td class="text-center">${refNo}</td>
                                            </tr>`;
                                    $table.row.add($(tr)).draw();
                                });
                            var rowPaging = $step.find(".dataTables_wrapper .row .dataTables_paginate").parent().parent();
                            rowPaging.removeClass("display-none");
                            if (items.length <= pageLength) rowPaging.addClass("display-none");
                            // step-4-2
                            //bindCustomerBank(id);
                        } else {
                            $step.find(".msg").html("").html('<p class="text-danger"><strong>Khách hàng hiện chưa có hợp đồng</strong></p>');
                        }
                    }
                },
                error: function (request) {
                    console.log(request.responseText);
                }
            });
        } else {
            $step.find(".msg").html("").html('<p class="text-danger"><strong>Khách hàng hiện chưa có hợp đồng</strong></p>');
        }
    }

    // Load danh sách đăng ký ngân hàng
    function bindCustomerBank(id) {
        var $step = $('#step-4-2');
        $step.find("table tbody").html("");
        $step.removeClass("display-none");
        $step.find(".msg").html("");
        $("#step-5").removeClass("display-none").addClass("display-none");
        $("#step-5-2").removeClass("display-none").addClass("display-none");
        $("#btn-save-bank, #btn-update-bank button").attr({
            'data-id': id
        });
        if (id && id !== "0") {
            $.ajax({
                url: '/SearchBank/GetCustomerSearchBank',
                type: 'get',
                dataType: 'json',
                data: { id: id },
                success: function(response) {
                    if (response && response.success === true) {
                        var items = response.data;
                        if (items.length > 0) {
                            var pageLength = 5;
                            var $table = myDataTable($step.find("table"), pageLength);
                            $.each(items,
                                function(i, item) {
                                    var cstBankId = item.cstBankId ? item.cstBankId : "";
                                    var bankCode = item.bankCode ? item.bankCode : "";
                                    var bankName = item.bankName ? item.bankName : "";
                                    var bankAccTypeName = item.bankAccTypeName ? item.bankAccTypeName : "";
                                    var bankAccType = item.bankAccType ? item.bankAccType : "";
                                    var accountNo = item.bankAccType ? item.accountNo : "";
                                    var regDate = formatDate(item.regDate);
                                    var status = item.status ? item.status : "";
                                    var statusName = item.statusName ? item.statusName : "";
                                    var isDefault = item.isDefault ? item.isDefault : "";
                                    var checked = (isDefault === '1' ? "checked" : "");
                                    var setDisabled = "";
                                    if (status === "P")
                                        setDisabled = "disabled";

                                    var tr = `<tr>
                                                <td class="text-center">${i + 1}</td>
                                                <td class="text-center">${bankCode}</td>
                                                <td class="text-center">${bankName}</td>
                                                <td class="text-center">${bankAccTypeName}</td>
                                                <td class="text-center">${accountNo}</td>
                                                <td class="text-center">${regDate}</td>
                                                <td class="text-center">${statusName}</td>
                                                <td class="text-center">
                                                    <input type="radio" class="rdo-isDefault"
                                                        data-id='${id}'
                                                        data-cstBankId='${cstBankId}'
                                                        data-cstBankId='${cstBankId}'
                                                        data-bankCode='${bankCode}'
                                                        data-bankAccType='${bankAccType}'
                                                        data-accountNo='${accountNo}'
                                                        data-status='${status}'
                                                        data-isDefault='${isDefault}'
                                                    ${checked} ${setDisabled}>
                                                </td>
                                                <td class="text-center">
                                                    <button class="btn btn-sm btn-secondary btn-select-bank" title="Chi tiết"
                                                        data-id='${id}'
                                                        data-cstBankId='${cstBankId}'
                                                        data-bankCode='${bankCode}'
                                                        data-bankAccType='${bankAccType}'
                                                        data-accountNo='${accountNo}'
                                                        data-status='${status}'
                                                        data-isDefault='${isDefault}'>
                                                    <i class="far fa-check-circle"></i> Chi tiết</button>
                                                </td>
                                            </tr>`;
                                    $table.row.add($(tr)).draw();
                                });
                            var rowPaging = $step.find(".dataTables_wrapper .row .dataTables_paginate").parent().parent();
                            rowPaging.removeClass("display-none");
                            if (items.length <= pageLength) rowPaging.addClass("display-none");

                        } else {
                            $step.find(".msg").html("").html('<p class="text-danger"><strong>Không có ngân hàng</strong></p>');
                        }
                    }
                },
                error: function(request) {
                    console.log(request.responseText);
                }
            });
        } else {
            $step.find(".msg").html("").html('<p class="text-danger"><strong>Không có ngân hàng</strong></p>');
        }
    }
})(jQuery);