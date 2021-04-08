(function ($) {
    var $key = $("#key");
    var postData = {};
    postData.cstRegId = $key.attr("data-cstregid");
    // Load page
    $.ajax({
        url: '/SearchCust/GetCusUpdateId',
        type: 'get',
        dataType: 'json',
        data: { regId: $key.attr("data-regid"), cstRegId: $key.attr("data-cstregid") },
        success: function (response) {
            if (response && response.success === true) {
                var data = response.data;
                // step-1
                $("#cst-name").val(data.customerNameOld);
                $("#cst-phone").val(data.customerPhoneOld);
                $("#cst-identity-typeName").val(data.customerIdentityTypeNameOld);
                $("#cst-identity-no").val(data.customerIdentityNoOld);
                // step-2
                $("#txt-cst-name").val(data.customerName);
                $("#txt-cst-phone").val(data.customerPhone);
                $("#cbo-cst-identity-type").val(data.customerIdentityType);
                $("#txt-cst-identity-no").val(data.customerIdentityNo);
                $("#txt-tnv-description").val(data.description);
                $("#cst-createName").val(data.createName);
                $("#cst-createFullName").val(data.createFullName);
                $("#cst-statusName").val(data.statusName);
                // step-3
                $("#dvkh-description").val(data.approveDesc);
                if (data.status !== "WAITING") {
                    $("#checked").removeClass("display-none");
                    $(".evn-edit").prop('disabled', false);
                }
            } else {
                notifyDanger(response.message);
            }
        },
        error: function (request) {
            console.log(request.responseText);
        }
    }).always(function () {
        // message
    });

    var $formCheckCustomer = $("#frm-check-customer");

    $(document).ready(function () {
        $formCheckCustomer.validate();

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

        $(document).on('input', "#txt-cst-name", function () {
            var input = $(this);
            var start = input[0].selectionStart;
            $(this).val(function (_, val) {
                return val.toUpperCase();
            });
            input[0].selectionStart = input[0].selectionEnd = start;
        });

        $(document).on("click", "#btn-update-cust", function () {
            //$("#cbo-cst-identity-type").change();
            //$("#txt-cst-name").rules('add', { required: true, messages: { required: "Vui lòng nhập" } });
            //$("#cbo-cst-identity-type").rules('add', { required: true, messages: { required: "Vui lòng chọn" } });
            //$("#txt-cst-identity-no").rules('add', { required: true, messages: { required: "Vui lòng nhập" } });
            $("#txt-cst-phone").rules('add', { required: true, validphone: true, messages: { required: "Vui lòng nhập" } });

            if ($formCheckCustomer.valid() === true) {
                postData.customerName = $.trim($("#txt-cst-name").val());
                postData.customerPhone = $.trim($("#txt-cst-phone").val());
                postData.customerIdentityType = $("#cbo-cst-identity-type").val();
                postData.customerIdentityTypeName = $("#cbo-cst-identity-type option:selected").text();
                postData.customerIdentityNo = $.trim($("#txt-cst-identity-no").val());
                postData.description = $.trim($("#txt-tnv-description").val());
                $.ajax({
                    url: '/SearchCust/UpdateCust',
                    type: 'post',
                    dataType: 'json',
                    data: postData,
                    success: function (response) {
                        if (response && response.success === true) {
                            notifySuccess('Gửi yêu cầu cập nhật thông tin thành công', '/SearchCust');
                        } else {
                            notifyDanger(response.message);
                        }
                    },
                    error: function (request) {
                        console.log(request.responseText);
                    }
                }).always(function () {
                    // step-3
                });
            }

        });

    });

})(jQuery);