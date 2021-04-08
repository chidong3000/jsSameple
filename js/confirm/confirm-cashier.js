(function ($) {
    $(document).ready(function () {
        $('input[name="RegisterCode"]').keypress(function (e) {
            var key = e.which;
            if (key === 13) {
                $('#btn-search').click();
                return false;
            }
        });

        $(document).on("click", "#btn-search", function () {
            $("#msg-code-invalid").html("");
            $("#register-info").removeClass("display-none").addClass("display-none");
            $("#section-save").removeClass("display-none").addClass("display-none");
            bindData();
            validPrint(false);

            var $form = $("#frm-search-register");

            $form.validate({
                rules: {
                    "RegisterCode": {
                        required: true
                    }
                },
                messages: {
                    "RegisterCode": {
                        required: "Vui lòng nhập"
                    }
                }
            });

            if ($form.valid() === true) {
                $.ajax({
                    url: '/Confirm/GetPayAwaitByCode',
                    type: 'get',
                    dataType: 'json',
                    data: { code: $.trim($("input[name='RegisterCode']").val()) },
                    success: function (response) {
                        if (response && response.success === true) {
                            $("#register-info").removeClass("display-none");
                            $("#section-save").removeClass("display-none");

                            var data = response.data;
                            bindData(data);
                        } else {
                            $("#msg-code-invalid").html("").html(`<p class="text-danger"><strong>${response.message}</strong></p>`);
                        }
                    },
                    error: function (request, status, error) {
                        console.log(request.responseText);
                    }
                });
            }
        });

        $(document).on("click", "#btn-confirm", function() {
            $.confirm({
                title: 'Xác nhận?',
                content: 'Bạn xác nhận nộp tiền?',
                type: 'red',
                typeAnimated: true,
                buttons: {
                    tryAgain: {
                        text: 'Đồng ý',
                        btnClass: 'btn-red',
                        action: function () {
                            $.ajax({
                                url: '/Confirm/CashierConfirm',
                                type: 'post',
                                dataType: 'json',
                                data: { id: $("#section-save").attr("data-id") },
                                success: function (response) {
                                    if (response && response.success === true) {
                                        notifySuccess(response.message);
                                        validPrint(true);
                                    } else {
                                        notifyDanger(response.message);
                                        validPrint(false);
                                    }
                                }
                            });
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

        $(document).on("click", "#btn-print", function() {
            var id = $("#section-save").attr("data-id");
            printInvoicePayInto(id, "W");
        });
    });

    function bindData(data) {
        console.log(data);
        if (data) {
            $("#section-save").attr("data-id", data.regId);

            $("#txt-cst-name").val(data.custName);
            $("#txt-cst-phone").val(data.custPhone);
            $("#txt-cst-identity").val(data.custIdentity);
            $("#txt-bank").val(data.bankName);
            $("#cbo-account-type").val(data.accNoType);
            $("#txt-account-no").val(data.accountNo);

            $("#txt-peCode").val(data.custPeCode);
            $("#txt-inning").val(data.custPeIdx);
            $("#txt-name").val(data.custPeName);
            $("#txt-phone").val(data.custPePhone);
            $("#txt-typeName").val(data.custPeTypeName);
            $("#txt-address").val(data.custPeAddress);

            $("#cboProduct").val(data.productCode);
            $("#txtAmtAverage").val(formatNumber(data.paymentAmt));
            $("#cboPeriodType").val(data.periodType);
            $("#cboDiscountType").val(data.discountType);
            $("#txtDiscountRate").val(data.discountRate);
            $("#txtDiscountAmt").val(formatNumber(data.discountAmt));
            $("#txtDisburAmt").val(formatNumber(data.totalAmtDue));
            $("#lblDisburAmtWord").html(data.totalAmtDueWord);
        } else {
            $("#section-save").attr("data-id", "0");

            $("#txt-cst-name").val("");
            $("#txt-cst-phone").val("");
            $("#txt-cst-identity").val("");
            $("#txt-bank").val("");
            $("#cbo-account-type").val("");
            $("#txt-account-no").val("");

            $("#txt-peCode").val("");
            $("#txt-inning").val("");
            $("#txt-name").val("");
            $("#txt-phone").val("");
            $("#txt-typeName").val("");
            $("#txt-address").val("");

            $("#cboProduct").val("");
            $("#txtAmtAverage").val("");
            $("#cboPeriodType").val("");
            $("#cboDiscountType").val("");
            $("#txtDiscountRate").val("");
            $("#txtDiscountAmt").val("");
            $("#txtDisburAmt").val("");
            $("#lblDisburAmtWord").html("");
        }
    }

    function validPrint(flag) {
        if (flag && flag === true) {
            $("#btn-print").prop('disabled', false);
            $("#btn-confirm").prop('disabled', true);
        } else {
            $("#btn-print").prop('disabled', true);
            $("#btn-confirm").prop('disabled', false);
        }
    }
})(jQuery);