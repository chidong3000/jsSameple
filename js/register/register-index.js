(function ($) {
    var postData = {};
    var $formCheckCustomer = $("#frm-check-customer");
    var $formBank = $("#frm-bank");

    $(document).ready(function () {
        $formCheckCustomer.validate();

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

        $(document).on("click", "#btn-search-customer", function () {
            hideAllStep();

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
    });

    function hideAllStep() {
        $("#step-1, #step-2, #step-3, #step-4, #step-5, #step-6, #step-6-1, #step-7").each(function () {
            $(this).find("input").val("");
            $(this).find("label.lbl-data").html("");
            $(this).find("select").find('option:eq(0)').prop('selected', true);
            $(this).find(".msg").html("");
            $(this).find("div.evn-info").removeClass("display-none").addClass("display-none");
            $(this).find("table").removeClass("display-none").addClass("display-none");
        });

        //$("#step-1").find("table").removeClass("display-none").addClass("display-none");
        //$("#step-1").find(".msg").html("");
        //$("#step-1").each(function () {
        //    $(this).find("input").val("");
        //});

        //$("#step-2").removeClass("display-none").addClass("display-none");
        //$("#step-2").find(".msg").html("");

        //$("#step-3").removeClass("display-none").addClass("display-none");
        //$("#step-3").find(".msg").html("");

        //$("#step-4").removeClass("display-none").addClass("display-none");
        //$("#step-4").find(".msg").html("");

        //$("#step-5").removeClass("display-none").addClass("display-none");
        //$("#step-5").find(".msg").html("");
        //$("#step-5").each(function () {
        //    $(this).find("div.evn-info").removeClass("display-none").addClass("display-none");
        //});

        //$("#step-6").removeClass("display-none").addClass("display-none");
        //$("#step-6").find(".msg").html("");

        //$("#step-6-1").removeClass("display-none").addClass("display-none");

        //$("#step-7").removeClass("display-none").addClass("display-none");
        //$("#step-7").find(".msg").html("");

        $("#step-8").find("#btn-payinto, #btn-paywaiting, #btn-print").removeClass("display-none").addClass("display-none");
    }

    function bindCustomerList(items) {
        if (items && items.length > 0) {
            var customerList = "";
            $.each(items,
                function (i, item) {
                    var id = item.cstRegId;
                    var name = item.customerName ? item.customerName : "";
                    var phone = item.customerPhone ? item.customerPhone : "";
                    var identityType = item.customerIdentityType ? item.customerIdentityType : "";
                    var identityTypeName = item.customerIdentityTypeName ? item.customerIdentityTypeName : "";
                    var identityNo = item.customerIdentityNo ? item.customerIdentityNo : "";

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
        } else {
            $("#step-1").find("table").removeClass("display-none").addClass("display-none");
            $("#step-1").find("table tbody").html("");
        }
    }
})(jQuery);