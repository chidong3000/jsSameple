(function ($) {
    var defaultSelect = "Vui lòng chọn";

    $(document).ready(function () {
        initDatetimepicker();
        bindSearchInfoPartial();

        $(document).on("click", "#btn-search", function (e) {
            e.preventDefault();
            bindGrid();
        });

        $(document).on("click", "#btn-report-discount", function (e) {
            e.preventDefault();
            exportFile();
        });

        $(document).on("click", ".grid-pager button", function (e) {
            e.preventDefault();
            var page = $(this).attr("data-page");
            bindGrid(page);
        });

        $(document).on("click", "#btn-print", function () {
            var id = $(this).data("id");
            var code = $(this).data("code");
            var type = $(this).data("type");
            if (type === "I") {
                printInvoicePayInto(id);
            } else {
                printInvoiceWithdraw(id);
            }
        });
    });

    function initDatetimepicker() {
        $('#dtpFromDate').datetimepicker({
            locale: 'vi',
            format: 'DD/MM/YYYY',
            defaultDate: moment().add(-7, 'days')
        });
        $('#dtpToDate').datetimepicker({
            locale: 'vi',
            format: 'DD/MM/YYYY',
            defaultDate: moment(),
            useCurrent: false
        });

        $("#dtpFromDate").on("dp.change", function (e) {
            $('#dtpToDate').data("DateTimePicker").minDate(e.date);
        });
        $("#dtpToDate").on("dp.change", function (e) {
            $('#dtpFromDate').data("DateTimePicker").maxDate(e.date);
        });
    }

    function checkDate() {
        if ($("#chkToday").is(':checked') === false) {
            if ($('#dtpFromDate').val() === "") {
                notifyDanger('Vui lòng nhập từ ngày và đến ngày');
                return false;
            }

            if ($('#dtpToDate').val() === "") {
                notifyDanger('Vui lòng nhập từ ngày và đến ngày');
                return false;
            }

            var fromDate = moment($('#dtpFromDate').val(), "DD/MM/YYYY");
            var toDate = moment($('#dtpToDate').val(), "DD/MM/YYYY");

            var duration = moment.duration(toDate.diff(fromDate));
            if (duration.asDays() < 0) {
                notifyDanger('Từ ngày không được nhỏ hơn đến ngày');
                return false;
            } else if (duration.asDays() > 60) {
                notifyDanger('Từ ngày và đến ngày không cách nhau 60 ngày');
                return false;
            }
        }

        return true;
    }

    function bindGrid(page) {
        var pageSize = $(".mvc-grid-pager-rows").val();
        if (!page) page = 1;
        if (!pageSize || parseInt(pageSize) === 0) pageSize = 10;
        var check = checkDate();
        if (check === true) {
            var param = {
                "areaCode": $('#cboBranchs').val(),
                "branchCode": $('#cboAreas').val(),
                "userId": $('#cboUsers').val(),
                "filter": $('#cboFilter').val(),
                "filterValue": $.trim($('#txtFilterValue').val()),
                "transType": $("#cboType").val(),
                "status": $("#cboStatus").val(),
                "fromDate": $('#dtpFromDate').val(),
                "toDate": $('#dtpToDate').val(),
                "productCode": $('#cboProduct').val(),
                "pageNo": page,
                "pageSize": pageSize,
                "isPaging": 1
            };

            $.ajax({
                url: '/Report/RptGeneralReg',
                type: 'get',
                dataType: 'html',
                data: param,
                success: function (data) {
                    $("#data-grid").html(data);
                }
            });
        }
    }

    function exportFile(page) {
        var check = checkDate();
        if (check === true) {
            var param = {
                "areaCode": $('#cboBranchs').val(),
                "branchCode": $('#cboAreas').val(),
                "userId": $('#cboUsers').val(),
                "filter": $('#cboFilter').val(),
                "filterValue": $.trim($('#txtFilterValue').val()),
                "transType": $("#cboType").val(),
                "status": $("#cboStatus").val(),
                "fromDate": $('#dtpFromDate').val(),
                "toDate": $('#dtpToDate').val(),
                //"productCode": $('#cboProduct').val(),
                "pageNo": 0,
                "pageSize": 0,
                "isPaging": 0
            };

            $.ajax({
                type: "POST",
                url: '/Report/ExportRptDiscount',
                data: param,
                xhrFields: {
                    responseType: 'blob' // to avoid binary data being mangled on charset conversion
                },
                success: function (blob, status, xhr) {
                    // check for a filename
                    var filename = "";
                    var disposition = xhr.getResponseHeader('Content-Disposition');
                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        var matches = filenameRegex.exec(disposition);
                        if (matches !== null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                    }

                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        var URL = window.URL || window.webkitURL;
                        var downloadUrl = URL.createObjectURL(blob);

                        if (filename) {
                            // use HTML5 a[download] attribute to specify filename
                            var a = document.createElement("a");
                            // safari doesn't support this yet
                            if (typeof a.download === 'undefined') {
                                window.location.href = downloadUrl;
                            } else {
                                a.href = downloadUrl;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                            }
                        } else {
                            window.location.href = downloadUrl;
                        }

                        setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                    }
                }
            });
        }
    }
})(jQuery);