(function ($) {
    $(document).ready(function () {
        $("#btn-confirm").prop('disabled', true);
        $("#btn-reject").prop('disabled', true);
        $(document).on("click", "#btn-search-bill", function (e) {
            e.preventDefault();
            $("#btn-confirm").prop('disabled', true);
            $("#btn-reject").prop('disabled', true);
            var id = $('#cboFileList').val();
            if (id === '') {
                notifyDanger("Vui lòng chọn file upload");
                return;
            }
            bindGrid();
        });

        $(document).on("click", ".grid-pager button", function (e) {
            e.preventDefault();
            var page = $(this).attr("data-page");
            bindGrid(page);
        });

        $(document).on("click", "#btn-confirm", function () {

            var id = $("#post-data").data("id");
            if (id === '') {
                notifyDanger("Không có dữ liệu");
                $("#btn-confirm").prop('disabled', true);
                return;
            }

            $.confirm({
                title: 'Xác nhận?',
                content: 'Bạn có muốn duyệt yêu cầu?',
                type: 'red',
                typeAnimated: true,
                buttons: {
                    tryAgain: {
                        text: 'Đồng ý',
                        btnClass: 'btn-red',
                        action: function () {
                            $.ajax({
                                url: '/BillCancel/Approve',
                                type: 'post',
                                dataType: 'json',
                                data: { type:1, id: $("#post-data").data("id"), note: $("#txt-notes").val()  },
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

        $(document).on("click", "#btn-reject", function () {

            var id = $("#post-data").data("id");
            var notes = $("#txt-notes").val();
            if (id === '') {
                notifyDanger("Không có dữ liệu");
                $("#btn-confirm").prop('disabled', true);
                return;
            }
            if (notes === '') {
                notifyDanger("Vui lòng nhập lý do từ chối");                
                $("#txt-notes").focus();
                return;
            }

            $.confirm({
                title: 'Xác nhận?',
                content: 'Bạn có muốn từ chối yêu cầu?',
                type: 'red',
                typeAnimated: true,
                buttons: {
                    tryAgain: {
                        text: 'Đồng ý',
                        btnClass: 'btn-red',
                        action: function () {
                            $.ajax({
                                url: '/BillCancel/Approve',
                                type: 'post',
                                dataType: 'json',
                                data: { type: 0, id: id, note: notes },
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

        var id = $('#cboFileList').val();
        if (id === '') {
            notifyDanger("Vui lòng chọn file upload");
            return;
        }
        var param = {
            "impId": id,
            "pageNo": page,
            "pageSize": pageSize,
            "toFile": 0
        };

        $.ajax({
            url: '/BillCancel/WaitingList',
            type: 'get',
            dataType: 'html',
            data: param,
            success: function (data) {
                console.log(data);
                $("#data-grid").html("").html(data);
                //$("#btn-confirm").prop('disabled', true);
                $('#data-grid table tbody tr').each(function (index, row) {
                    var status = $(row).data("status");
                    //$("#btn-confirm").prop('disabled', true);                    
                    //$("#btn-reject").prop('disabled', true);
                    if (status === "OK") {
                        $("#btn-confirm").prop('disabled', false);
                        $("#btn-reject").prop('disabled', false);
                        return false;
                    }                    
                });
            }
        });
    }
})(jQuery);