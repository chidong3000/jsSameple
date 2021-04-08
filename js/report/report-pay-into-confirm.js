(function ($) {
    var defaultSelect = "Vui lòng chọn";

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
                "transDateFrom": $('#dtpFromDate').val(),
                "transDateTo": $('#dtpToDate').val(),
                "productCode": $('#cboProduct').val(),
                "pageNo": page,
                "pageSize": pageSize,
                "isPaging": 1
            };

            $.ajax({
                url: '/Report/RptPayIntoConfirm',
                type: 'get',
                dataType: 'html',
                data: param,
                success: function (data) {
                    $("#data-grid").html(data);
                }
            });
        }
    }
})(jQuery);