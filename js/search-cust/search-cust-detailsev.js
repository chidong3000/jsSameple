(function ($) {
    var $key = $("#key");
    var postData = {};
    postData.regId = $key.attr("data-regid");
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
                $("#txt-cst-identity-typeName").val(data.customerIdentityTypeName);
                $("#txt-cst-identity-no").val(data.customerIdentityNo);
                $("#txt-tnv-description").val(data.description);
                $("#cst-createName").val(data.createName);
                $("#cst-createFullName").val(data.createFullName);
                $("#cst-statusName").val(data.statusName);
                // step-3
                $("#txt-dvkh-description").val(data.approveDesc);
                if (data.status === "WAITING") {
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


    $(document).ready(function () {
        $(document).on("change", "#isAgree", function () {
            $("#action").removeClass("display-none").addClass("display-none");
            var $this = $(this);
            if ($this.is(":checked"))
                $("#action").removeClass("display-none");
        });

        $(document).on('input', "#txt-cst-name", function () {
            var input = $(this);
            var start = input[0].selectionStart;
            $(this).val(function (_, val) {
                return val.toUpperCase();
            });
            input[0].selectionStart = input[0].selectionEnd = start;
        });

        $(document).on("click", "#action button", function () {
            var $this = $(this);
            postData.approveStatus = $this.attr("data-status");
            postData.approveDesc = $.trim($("#txt-dvkh-description").val());
            postData.isAgree = "1";
            $.ajax({
                url: '/SearchCust/CusUpdateApprove',
                type: 'post',
                dataType: 'json',
                data: postData,
                success: function (response) {
                    if (response && response.success === true) {
                        notifySuccess($this.attr("data-statusname"), '/SearchCust');
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

        });

    });

})(jQuery);