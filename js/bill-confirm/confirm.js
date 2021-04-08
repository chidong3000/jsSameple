(function ($) {
    $(document).ready(function () {
        $(document).on("click", "#btn-upload", function() {
            var $form = $("#frm-upload");

            $form.validate({
                rules: {
                    "FileUpload": {
                        required: true,
                        extension: "xlsx|xls|xlsm",
                        filesize: 10485760
                    }
                },
                messages: {
                    "FileUpload": {
                        required: "Vui lòng upload danh sách nợ hóa đơn",
                        extension: "Vui lòng chọn file có định dạng là excel",
                        filesize: "Dung lượng file phải nhỏ hơn 10M"
                    }
                }
            });

            if ($form.valid()) {
                var $formData = new FormData($form[0]);
                $.ajax({
                    url: '/BillConfirm/Upload',
                    type: 'post',
                    dataType: 'html',
                    data: $formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        $("#data-grid-header").html("").html(response);

                        $("#btn-confirm").prop('disabled', true);
                        //$('#data-grid table tbody tr').each(function (index, row) {
                        //    var status = $(row).data("status");
                        //    $("#btn-confirm").prop('disabled', true);
                        //    if (status === "OK1") {
                        //        $("#btn-confirm").prop('disabled', false);
                        //        return false;
                        //    }
                        //});
                    }
                });
            }
        });

        $(document).on("click", "#btn-check-upload", function (e) {
            e.preventDefault();
            bindGrid();
        });

        $(document).on("click", ".grid-pager button", function (e) {
            e.preventDefault();
            var page = $(this).attr("data-page");
            bindGrid(page);
        });

        $(document).on("click", "#btn-confirm", function() {
            $.confirm({
                title: 'Xác nhận?',
                content: 'Bạn có muốn lưu thông tin?',
                type: 'red',
                typeAnimated: true,
                buttons: {
                    tryAgain: {
                        text: 'Đồng ý',
                        btnClass: 'btn-red',
                        action: function () {
                            $.ajax({
                                url: '/BillConfirm/Save',
                                type: 'post',
                                dataType: 'json',
                                data: { id: $("#post-data").data("id") },
                                success: function (response) {
                                    console.log(response);
                                    if (response.success === true) {
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
    });

    function bindGrid(page) {
        var pageSize = $(".mvc-grid-pager-rows").val();
        if (!page) page = 1;
        if (!pageSize) pageSize = 10;
        var param = {
            "impId": $("#post-data").data("id"),
            "pageNo": page,
            "pageSize": pageSize,
            "toFile": 0
        };

        $.ajax({
            url: '/BillConfirm/UploadPaging',
            type: 'get',
            dataType: 'html',
            data: param,
            success: function (data) {
                console.log(data);
                $("#data-grid").html("").html(data);

                //$("#btn-confirm").prop('disabled', true);
                $('#data-grid table tbody tr').each(function (index, row) {
                    var status = $(row).data("status");
                    console.log("status==" + status);
                    $("#btn-confirm").prop('disabled', true);
                    if (status === "OK") {
                        $("#btn-confirm").prop('disabled', false);
                        return false;
                    }
                });
            }
        });
    }
})(jQuery);