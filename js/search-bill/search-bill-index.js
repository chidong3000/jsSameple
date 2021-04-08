(function ($) {
    var postData = {};
    var $formCheckCustomer = $("#frm-check-customer");
    var $formBank = $("#frm-bank");

    $(document).ready(function () {
        $formCheckCustomer.validate();
        $formBank.validate();
        bindCombobox();
        initDatetimepicker();

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

        $(document).on("change", "#cbo-bank", function () {
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

        $(document).on("click", ".btn-select-customer", function () {
            var $this = $(this);
            var customer = {
                id: $this.attr("data-id"),
                name: $this.attr("data-name"),
                phone: $this.attr("data-phone"),
                identityType: $this.attr("data-identity-type"),
                identityNo: $this.attr("data-identity-no")
            };
            //showButtonRegister(true);
            bindCustomer(customer);

            var id = $this.attr("data-id");
            bindCustomerRegisted(id);
        });

        $(document).on("click", "#step-4-2 .btn-select-bill", function () {
            // step-5-2
            $("#step-5").removeClass("display-none").addClass("display-none");
            $("#step-5-2").removeClass("display-none");

            initDatetimepicker();
            initEditDatetimepicker();
            var $this = $(this);
            var id = $this.attr("data-id");
            var regid = $this.attr("data-regid");
            if (id && id !== "0") {
                $.ajax({
                    url: '/SearchBill/GetSelectBill',
                    type: 'get',
                    dataType: 'json',
                    data: { id: regid },
                    success: function (response) {
                        if (response && response.success === true) {
                            var items = response.data;
                            if (items.length > 0) {
                                var data = items[0];
                                $("#txt-peCode-r").val(data.billCode);
                                $("#txt-inning-r").val(data.billIdx);
                                $("#txt-name-r").val(data.billName);
                                $("#txt-phone-r").val(data.billPhone);
                                $("#txt-address-r").val(data.billAddress);
                                $("#txt-typeName-r").val(data.custBillTypeName);
                                $("#txt-billPayTypeName-r").val(data.billPayTypeName);
                                $("#txt-billTypeName-r").val(data.billTypeName);
                                $("#txt-termName-r").val(data.termName);
                                $("#txt-paidTypeName-r").val(data.paidTypeName);
                                $("#txt-paidAmt-r").val(data.paidAmt ? formatNumber(data.paidAmt) : "");
                                $("#txt-billOwnerIdx-r").val(data.billOwnerIdx);
                                $("#txt-expiredDate-r").val(data.expiredDate);
                                $("#btn-update-bill button").attr({
                                    'data-id': id,
                                    'data-regid': regid,
                                    'data-expiredDate': data.expiredDate
                                });
                                $("#btn-update-bill button").removeClass("display-none");
                                $("#btn-update-bill button[data-status='" + data.status + "']").addClass("display-none");
                            } else {
                                $("#step-5-2").find(".msg").html("").html('<p class="text-danger"><strong>Không có thông tin KH</strong></p>');
                            }
                        }
                    },
                    error: function (request) {
                        console.log(request.responseText);
                    }
                });
            } else {
                $("#step-5-2").find(".msg").html("").html('<p class="text-danger"><strong>Không có thông tin KH</strong></p>');
            }
        });

        $(document).on("click", "#btn-update-bill button", function () {
            var $this = $(this);
            var id = $this.attr("data-id");
            postData.regId = $this.attr("data-regid");
            postData.status = $this.attr("data-status");
            postData.expiredDate = $("#txt-expiredDate-r").val();
            $.ajax({
                url: '/SearchBill/UpdateBill',
                type: 'post',
                dataType: 'json',
                data: postData,
                success: function (response) {
                    if (response && response.success === true) {
                        bindCustomerBill(id);
                        notifySuccess(response.message);
                    } else {
                        notifyDanger(response.message);
                    }
                }
            }).always(function () {
                // step-4-2
            });
        });

        $(document).on("change", "#paidType", function () {
            var $this = $(this);
            if ($this.val() === '' || $this.val() === '001') {
                $("#paidAmt").val('');
                $("#paidAmt").prop('disabled', true);
            } else {
                $("#paidAmt").prop('disabled', false);
            }
        });

        $(document).on("change", "#billType", function () {
            var $this = $(this);
            if ($this.val() === '100') {
                $("#termCode").val('0001M');
                $("#paidType").val('001');
                $("#termCode").prop('disabled', true);
                $("#paidType").prop('disabled', true);
            } else {
                $("#termCode").val('');
                $("#paidType").val('');
                $("#termCode").prop('disabled', false);
                $("#paidType").prop('disabled', false);
            }
            $("#paidType").change();
        });

        $(document).on("click", "#btn-register-bill", function () {
            clearStep5();
            $("#step-5-2").removeClass("display-none").addClass("display-none");
            $("#step-5").removeClass("display-none");
            $("#btn-check-evn").removeClass("display-none");
            $('#chkAddbill').prop('checked', false); 
            $("#txt-inning").prop('readonly', true);
            $("#txt-name").prop('readonly', true);
            $("#txt-phone").prop('readonly', true);
            $("#txt-typeName").prop('readonly', true);
            $("#txt-address").prop('readonly', true);
            $("#billOwnerIdx").prop('readonly', true);
            initDatetimepicker();

        });

        $(document).on("click", "#btn-check-evn", function () {
            //clearStep5();

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
                var evnCode = $.trim($("#txt-peCode").val());
                var bool = true;
                $("#step-4-2 table tbody tr").each(function () {
                    var $this = $(this);
                    if ($this.attr("data-peCode") === evnCode) {
                        notifyDanger('Hóa đơn đã tồn tại vui lòng chọn từ danh sách hóa đơn');
                        bool = false;
                        return false;
                    }
                    else
                        return true;
                });

                if (bool) {
                    $.ajax({
                        url: '/PayInto/CheckEvn',
                        type: 'get',
                        dataType: 'json',
                        data: { identity: $.trim($("#txt-cst-identity-no").val()), evnCode: evnCode },
                        success: function (response) {
                            if (response && response.success === true) {
                                var data = response.data;
                                bindEvn(data);
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
            }
            return false;
        });

        $(document).on("click", "#btn-save-bill", function () {
            var id = $(this).attr("data-id");
            var $form = $("#form-reg-bill");
            $form.validate({
                rules: {
                    "BillPayType": {
                        required: true
                    },
                    "BillType": {
                        required: true
                    },
                    "TermCode": {
                        required: true
                    },
                    "PaidType": {
                        required: true
                    },
                    "PaidAmt": {
                        required: true
                    }
                },
                messages: {
                    "BillPayType": {
                        required: "Vui lòng chọn"
                    },
                    "BillType": {
                        required: "Vui lòng chọn"
                    },
                    "TermCode": {
                        required: "Vui lòng chọn"
                    },
                    "PaidType": {
                        required: "Vui lòng chọn"
                    },
                    "PaidAmt": {
                        required: "Vui lòng nhập"
                    }
                }
            });
            
            if ($form.valid() === true) {
                postData.cstRegId = id;                
                postData.bill.billPayType = $.trim($("#billPayType").val());
                postData.bill.billType = $.trim($("#billType").val());
                postData.bill.termCode = $.trim($("#termCode").val());
                postData.bill.billOwnerIdx = $.trim($("#billOwnerIdx").val());
                postData.bill.paidType = $.trim($("#paidType").val());               
                var nPaidAmt = AutoNumeric.getAutoNumericElement('#paidAmt');
                postData.bill.paidAmt = nPaidAmt.rawValue;
                //var expiredDate = moment($('#dtpExpiredDate').val(), "MM/YYYY");                
                postData.bill.expiredDate = $('#dtpExpiredDate').val();

                if ($("#chkAddbill").prop('checked') == true) {
                    var checkdate = $("#txt-inning").val();
                    if (checkdate < 1 || checkdate > 31) {
                        notifyDanger("Ngày kiểm tra hóa đơn phải nhập giá trị từ 1 đến 31");
                        return false;
                    }
                    postData.bill.billCode = $.trim($("#txt-peCode").val());
                    postData.bill.billIdx = $.trim($("#txt-inning").val());
                    postData.bill.custBillType = $.trim($("#txt-typeName").val());
                    postData.bill.custBillTypeName = $.trim($("#txt-typeName").val());
                    postData.bill.billName = $.trim($("#txt-name").val());
                    postData.bill.billAddress = $.trim($("#txt-address").val());
                    postData.bill.billPhone = $.trim($("#txt-phone").val());
                }               
                
                $.ajax({
                    url: '/SearchBill/RegisterBill',
                    type: 'post',
                    dataType: 'json',
                    data: postData,
                    success: function (response) {
                        if (response && response.success === true) {
                            clearStep5();
                            bindCustomerBill(id);
                            notifySuccess(response.message);
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

        $(document).on("change", "#txt-paymentAmt, #cboPeriodType, #cboDiscountType, input[name='DiscountPay']", function () {
            clearDataStep7();
        });

        $(document).on("click", "#chkAddbill", function () {
            if ($(this).is(":checked")) {
                $(".evn-info").removeClass("display-none");
                $("#txt-inning").removeAttr("readonly");
                $("#txt-name").removeAttr("readonly");
                $("#txt-phone").removeAttr("readonly");
                $("#txt-typeName").removeAttr("readonly");
                $("#txt-address").removeAttr("readonly");
                $("#billOwnerIdx").removeAttr("readonly");     
                
                $("#txt-peCode").val("");
                $("#txt-inning").val("");
                $("#txt-name").val("");
                $("#txt-phone").val("");
                $("#txt-typeName").val("Tư gia");
                $("#txt-address").val("");
                $("#billOwnerIdx").val("");

                postData.bill = {};
                postData.bill.billCode = "";
                postData.bill.billOwner = "";
                postData.bill.billIdx = "";
                postData.bill.custBillType = "";
                postData.bill.custBillTypeName = "";
                postData.bill.billName = "";
                postData.bill.billAddress = "";
                postData.bill.billPhone = "";
                $("#btn-check-evn").removeClass("display-none").addClass("display-none");
                
            } else {
                $("#txt-peCode").val("");
                $("#txt-inning").val("");
                $("#txt-name").val("");
                $("#txt-phone").val("");
                $("#txt-typeName").val("");
                $("#txt-address").val("");
                $("#billOwnerIdx").val("");
                
                $("#txt-inning").prop('readonly', true);
                $("#txt-name").prop('readonly', true);
                $("#txt-phone").prop('readonly', true);
                $("#txt-typeName").prop('readonly', true);
                $("#txt-address").prop('readonly', true);
                $("#billOwnerIdx").prop('readonly', true);
                $(".evn-info").removeClass("display-none").addClass("display-none");
                $("#btn-check-evn").removeClass("display-none");

            }
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
        var billCode = $.trim($("#txt-peCode").val());
        clearStep5();
        $("#txt-peCode").val(billCode);
        if (data) {
            $("#txt-inning").val(data.inning);
            $("#txt-name").val(data.name);
            $("#txt-phone").val(data.phoneByProvider);
            $("#txt-typeName").val(data.cstPETypeName);
            $("#txt-address").val(data.address);
            $("#billOwnerIdx").val(data.inning);

            postData.bill = {};
            postData.bill.billCode = billCode;
            postData.bill.billOwner = data.envName;
            postData.bill.billIdx = data.inning;
            postData.bill.custBillType = data.cstPEType;
            postData.bill.custBillTypeName = data.cstPETypeName;
            postData.bill.billName = data.name;
            postData.bill.billAddress = data.address;
            postData.bill.billPhone = data.phoneByProvider;

            $(".evn-info").removeClass("display-none");

            var details = data.details;
            var debits = data.debit;
        } else {
            $("#txt-inning").val("");
            $("#txt-name").val("");
            $("#txt-phone").val("");
            $("#txt-typeName").val("");
            $("#txt-address").val("");
            $("#billOwnerIdx").val("");

            postData.bill = {};
            postData.bill.billCode = "";
            postData.bill.billOwner = "";
            postData.bill.billIdx = "";
            postData.bill.custBillType = "";
            postData.bill.custBillTypeName = "";
            postData.bill.billName = "";
            postData.bill.billAddress = "";
            postData.bill.billPhone = "";

            $(".evn-info").removeClass("display-none").addClass("display-none");
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
            $("#billType").val('100');
            $("#termCode").val('0001M');
            $("#paidType").val('001');
            $("#termCode").prop('disabled', true);
            $("#paidType").prop('disabled', true);
            $(this).find("div.evn-info").removeClass("display-none").addClass("display-none");
            $(this).find("#paidAmt").prop('disabled', true);
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
                                        data-identity-no='${identityNo}'>
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
                                    //var tr = `<tr>
                                    //            <td class="text-center">${i + 1}</td>
                                    //            <td class="text-left">${productName}</td>
                                    //            <td class="text-left">${peCode}</td>
                                    //            <td class="text-left">${peName}</td>
                                    //            <td class="text-left">${peAddress}</td>
                                    //            <td class="text-center">${registerDate}</td>
                                    //            <td class="text-right">${amount}</td>
                                    //            <td class="text-center">${periodName}</td>
                                    //            <td class="text-right">${periodAmount}</td>
                                    //            <td class="text-center">${refNo}</td>
                                    //        </tr>`;

                                    var tr = `<tr>
                                                <td class="text-center">${i + 1}</td>
                                                <td class="text-left">${productName}</td>
                                                <td class="text-center">${refNo}</td>
                                                <td class="text-center">${registerDate}</td>
                                                <td class="text-right">${amount}</td>
                                                <td class="text-center">${periodName}</td>
                                                <td class="text-right">${periodAmount}</td>
                                                
                                            </tr>`;

                                    $table.row.add($(tr)).draw();
                                });
                            var rowPaging = $step.find(".dataTables_wrapper .row .dataTables_paginate").parent().parent();
                            rowPaging.removeClass("display-none");
                            if (items.length <= pageLength) rowPaging.addClass("display-none");
                            // step-4-2
                            bindCustomerBill(id);
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

    // Load danh sách đăng ký hóa đơn
    function bindCustomerBill(id) {
        var $step = $('#step-4-2');
        $step.find("table tbody").html("");
        $step.removeClass("display-none");
        $step.find(".msg").html("");
        $("#step-5").removeClass("display-none").addClass("display-none");
        $("#step-5-2").removeClass("display-none").addClass("display-none");
        $("#btn-save-bill").attr({
            'data-id': id
        });
        if (id && id !== "0") {
            $.ajax({
                url: '/SearchBill/GetCustomerBill',
                type: 'get',
                dataType: 'json',
                data: { id: id },
                success: function (response) {
                    if (response && response.success === true) {
                        var items = response.data;
                        if (items.length > 0) {
                            var pageLength = 5;
                            var $table = myDataTable($step.find("table"), pageLength);
                            $.each(items,
                                function (i, item) {
                                    var regId = item.regId ? item.regId : "";
                                    var billTypeName = item.billTypeName ? item.billTypeName : "";
                                    var billPayTypeName = item.billPayTypeName ? item.billPayTypeName : "";
                                    var termName = item.termName ? item.termName : "";
                                    var billCode = item.billCode ? item.billCode : "";
                                    var regDate = formatDate(item.regDate);
                                    var billOwner = item.billOwner ? item.billOwner : "";
                                    var status = item.status ? item.status : "";

                                    var tr = `<tr data-peCode='${billCode}'>
                                                <td class="text-center">${i + 1}</td>
                                                <td class="text-center">${billTypeName}</td>
                                                <td class="text-center">${billPayTypeName}</td>
                                                <td class="text-center">${termName}</td>
                                                <td class="text-center">${billCode}</td>
                                                <td class="text-center">${billOwner}</td>
                                                <td class="text-center">${regDate}</td>
                                                <td class="text-center">${status}</td>
                                                <td class="text-center">
                                                    <button class="btn btn-sm btn-secondary btn-select-bill" title="Chi tiết"
                                                        data-id='${id}'
                                                        data-regid='${regId}'>
                                                    <i class="far fa-check-circle"></i> Chi tiết</button>
                                                </td>
                                            </tr>`;
                                    $table.row.add($(tr)).draw();
                                });
                            //$table.page(1).draw(false);
                            var rowPaging = $step.find(".dataTables_wrapper .row .dataTables_paginate").parent().parent();
                            rowPaging.removeClass("display-none");
                            if (items.length <= pageLength) rowPaging.addClass("display-none");

                        } else {
                            $step.find(".msg").html("").html('<p class="text-danger"><strong>Không có hóa đơn</strong></p>');
                        }
                    }
                },
                error: function (request) {
                    console.log(request.responseText);
                }
            });
        } else {
            $step.find(".msg").html("").html('<p class="text-danger"><strong>Không có hóa đơn</strong></p>');
        }
    }

    function initDatetimepicker() {

        $('#dtpExpiredDate').datetimepicker({
            locale: 'vi',
            format: 'MM/YYYY',
            //defaultDate: moment().startOf('month')
            defaultDate: moment().add(6, 'months')
        });

        $('#txt-expiredDate-r').datetimepicker({
            locale: 'vi',
            format: 'MM/YYYY',
            //defaultDate: moment().startOf('month')
            defaultDate: moment().add(6, 'months')
        });
    }

    function initEditDatetimepicker() {
        $('#txt-expiredDate-r').datetimepicker({
            locale: 'vi',
            format: 'MM/YYYY',
            defaultDate: moment().add(6, 'months')
        });

        $("#txt-expiredDate-r").on("dp.change", function (e) {
            //$('#txt-expiredDate-r').data("DateTimePicker").minDate(e.date);
        });
    }




})(jQuery);