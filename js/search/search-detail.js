(function ($) {
    $(document).ready(function () {
        var $formBank = $("#frm-bank");
        $formBank.validate();

        $(document).on("click", "#btn-print-payinto", function () {
            var id = $(this).data("id");
            printInvoicePayInto(id);
        });

        $(document).on("click", "#btn-print-withdraw", function () {
            var id = $(this).data("id");
            printInvoiceWithdraw(id);
        });

        $(document).on('input', "#txt-bank-acc-no", function () {
            var input = $(this);
            var start = input[0].selectionStart;
            $(this).val(function (_, val) {
                return val.toUpperCase();
            });
            input[0].selectionStart = input[0].selectionEnd = start;
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

        $(document).on("click", "#btn-update", function () {
            var $this = $(this);
            if ($formBank.valid()) {
                var postData = {
                    "transType": $this.data("trans-type"),
                    "id": $this.data("id"),
                    "bankCode": $("#cbo-bank").val(),
                    "accNoType": $("#cbo-bank-acc-type").val(),
                    "accountNo": $.trim($("#txt-bank-acc-no").val()),
                    "updatedBy": ""
                };

                $.ajax({
                    url: '/Search/Update',
                    type: 'post',
                    dataType: 'json',
                    data: postData,
                    success: function (response) {
                        if (response && response.success === true) {
                            $.alert({
                                title: 'Thông báo thành công',
                                content: response.message,
                                type: 'green',
                                typeAnimated: true,
                                buttons: {
                                    ok: {
                                        text: 'Đồng ý',
                                        btnClass: 'btn-green',
                                        keys: ['enter', 'shift'],
                                        action: function () {
                                            location.reload();
                                        }
                                    }
                                }
                            });
                        } else {
                            notifyDanger(response.message);
                        }
                    }
                });
            } else {
                $("html, body").animate({ scrollTop: 0 }, "slow");
            }
        });
    });
})(jQuery);