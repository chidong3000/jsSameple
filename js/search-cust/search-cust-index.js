(function ($) {
    var postData = {};

    $(document).ready(function () {

        $('input[name="FilterValue"]').keypress(function (e) {
            var key = e.which;
            if (key === 13) {
                $('#btn-search-customer').click();
                return false;
            }
            return true;
        });

        $(document).on("click", "#btn-search-customer", function () {
            hideAllStep();

            var $form = $("#frm-search-customer");
            $form.validate({
                rules: {
                    "Filter": {
                        required: false
                    },
                    "FilterValue": {
                        required: false
                    },
                    "Status": {
                        required: false
                    }
                },
                messages: {
                    "Filter": {
                        required: "Vui lòng chọn"
                    },
                    "FilterValue": {
                        required: "Vui lòng nhập"
                    },
                    "Status": {
                        required: "Vui lòng chọn"
                    }
                }
            });

            postData.status = $("select[name='Status']").val();

            if ($form.valid() === true) {
                postData.filter = $("select[name='Filter']").val();
                postData.filterValue = $.trim($("input[name='FilterValue']").val());
                postData.status = $("select[name='Status']").val();
                $.ajax({
                    url: '/SearchCust/GetCusUpdateList',
                    type: 'post',
                    dataType: 'json',
                    data: postData,
                    success: function (response) {
                        if (response && response.success === true) {
                            var items = response.data;
                            bindCustomerList(items.data);

                            if (items.data.length > 0) {
                                $("#step-1").find(".msg").html("");
                            } else {
                                $("#step-1").find(".msg").html("").html('<p class="text-danger"><strong>Không có KH nào thỏa điều kiện tìm kiếm</strong></p>');
                            }
                        } else {
                            $("#step-1").find("table tbody").html("");
                            $("#step-1").find("table").removeClass("display-none").addClass("display-none");
                            $("#step-1").find(".msg").html("");
                            notifyDanger("Không tìm thấy dữ liệu");
                            console.log(response.message);
                            //notifyDanger($("select[name='Filter'] option:selected").text() + ' không hợp lệ');
                            //$("#step-1").find(".msg").html("").html(`<p class="text-danger"><strong>${response.message}</strong></p>`);
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
        $("#step-1").find("table").removeClass("display-none").addClass("display-none");
        $("#step-1").find(".msg").html("");
    }

    // Load danh sách khách hàng đăng ký
    function bindCustomerList(items) {
        var $step = $('#step-1');
        if (items && items.length > 0) {
            var pageLength = 8;
            var $table = myDataTable($step.find("table"), pageLength);
            $.each(items,
                function (i, item) {
                    var status = item.status ? item.status : "";
                    var regId = item.regId ? item.regId : "";
                    var cstRegId = item.cstRegId ? item.cstRegId : "";
                    var customerName = item.customerName ? item.customerName : "-----";
                    var customerPhone = item.customerPhone ? item.customerPhone : "-----";
                    var customerIdentityNo = item.customerIdentityNo ? item.customerIdentityNo : "-----";
                    var customerIdentityTypeName = item.customerIdentityTypeName ? item.customerIdentityTypeName : "-----";
                    var regDate = item.regDate ? formatDate(item.regDate) : "-----";
                    var updDate = item.updDate ? formatDate(item.updDate) : "-----";
                    var approveDate = item.approveDate ? formatDate(item.approveDate) : "-----";
                    var createName = item.createName ? item.createName : "-----";
                    var approveName = item.approveName ? item.approveName : "-----";
                    var descr = item.descr ? item.descr : "-----";
                    var statusName = item.statusName ? item.statusName : "-----";
                    var url = item.url ? item.url : "/";

                    var tr = `<tr>
                                <td class="text-center">${i + 1}</td>
                                <td class="text-center">${customerName}</td>
                                <td class="text-center">${customerIdentityNo}</td>
                                <td class="text-center">${customerPhone}</td>
                                <td class="text-center">${regDate}</td>
                                <td class="text-center">${updDate}</td>
                                <td class="text-center">${createName}</td>
                                <td class="text-center">${approveDate}</td>
                                <td class="text-center">${approveName}</td>
                                <td class="text-center">${statusName}</td>
                                <td class="text-center">
                                    <a href="${url}" class="btn btn-sm btn-secondary btn-select-customer"><i class="far fa-check-circle"></i> Chọn</a>
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

})(jQuery);