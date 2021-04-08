(function ($) {
    var defaultSelect = "Vui lòng chọn";
    var page = "RptCustomerOverview";
    if (typeof $("#pageName").val() !== "undefined") {
        page = $("#pageName").val();
    }
    var apiUrl = "/Report/" + page;

    $(document).ready(function () {
        initDatetimepicker();
        bindSearchInfoPartial();

        $(document).on("click", "#btn-search", function (e) {
            e.preventDefault();
            bindGrid();
        });

        $(document).on("click", ".grid-pager button", function (e) {
            e.preventDefault();
            var page = $(this).attr("data-page");
            bindGrid(page);
        });
    });

    function initDatetimepicker() {
        $('#dtpFromDate').datetimepicker({
            locale: 'vi',
            format: 'DD/MM/YYYY',
            //defaultDate: moment().add(-7, 'days')
            defaultDate: moment().add(-1, 'days')
        });
        $('#dtpToDate').datetimepicker({
            locale: 'vi',
            format: 'DD/MM/YYYY',
            //defaultDate: moment(),
            defaultDate: moment().add(-1, 'days'),
            useCurrent: false
        });
        $('#dtpToDate').data("DateTimePicker").maxDate(moment().add(-1, 'days'));

        //$("#dtpFromDate").on("dp.change", function (e) {
        //    $('#dtpToDate').data("DateTimePicker").minDate(e.date);
        //});
        //$("#dtpToDate").on("dp.change", function (e) {
        //    $('#dtpToDate').data("DateTimePicker").maxDate(e.date);
        //});
    }

    function checkDate() {
        if ($("#chkToday").is(':checked') === false) {
            if ($('#dtpToDate').val() === "") {
                notifyDanger('Vui lòng nhập đến ngày');
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
                "fromDate": $('#dtpFromDate').val(),
                "toDate": $('#dtpToDate').val(),
                "productCode": $('#cboProduct').val(),
                "status": $('#cboApprovedStatus').val(),                
                "pageNo": page,
                "pageSize": pageSize,
                "isPaging": 1
            }

            $.ajax({
                url: apiUrl,
                type: 'post',
                dataType: 'html',
                data: param,
                success: function (data) {
                    $("#data-grid").html(data);
                }
            });
        }
    }
})(jQuery);