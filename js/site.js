var defaultSelect = "-- Vui lòng chọn --";

$(document).ready(function () {
    $(document).ajaxError(function (e, xhr, settings) {
        if (xhr.status === 401) {
            location.reload();
        } else {
            unblockUI();
        }
    });

    $(document).ajaxStart(function () { blockUI(); });

    $(document).ajaxStop(function () { unblockUI(); });

    var header = $(".start-style");
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();

        if (scroll >= 10) {
            header.removeClass('start-style').addClass("scroll-on");
        } else {
            header.removeClass("scroll-on").addClass('start-style');
        }
    });

    $('body.hero-anime').removeClass('hero-anime');

    $('.navbar-nav .nav-link').filter(function () {
        var controller = location.pathname.split("/")[1];
        if (controller === "") return this.href === location.href;
        else return this.href.indexOf(controller) !== -1;
    }).parent().addClass('active').siblings().removeClass('active');

    $('.navbar-nav .nav-link').click(function () {
        $('.navbar-nav .nav-item').removeClass('active');
        $(this).closest("li").addClass('active');
    });

    $(document).on('click', '.card-header span.clickable', function () {
        var $this = $(this);
        if (!$this.hasClass('card-collapsed')) {
            $this.parents('.card').find('.card-body').slideUp();
            $this.addClass('card-collapsed');
            $this.find('i').removeClass('fas fa-chevron-down').addClass('fas fa-chevron-up');
        } else {
            $this.parents('.card').find('.card-body').slideDown();
            $this.removeClass('card-collapsed');
            $this.find('i').removeClass('fas fa-chevron-up').addClass('fas fa-chevron-down');
        }
    });

    $(".use-select2").select2({
        selectOnClose: true
    });

    $('input[type="file"]').change(function (e) {
        var fileName = e.target.files[0].name;
        $(e.target).siblings('.custom-file-label').html(fileName);
    });

    $(document).on("click", ".btn-download", function () {
        blockUI();
        var filename = $(this).attr("data-filename");
        if (filename) {
            var oReq = new XMLHttpRequest();
            oReq.open("get", `/Dictionary/Download?fileName=${filename}`, true);
            oReq.responseType = "blob";
            oReq.onload = function () {
                var blob = oReq.response;
                var imgSrc = URL.createObjectURL(blob);
                unblockUI();
                $(".modal-content-image").prop("src", imgSrc);
                $('#modal-image').modal('show');
            };
            oReq.send(null);
        }
    });

    $('.readonly input[type="text"]:not(.non-readonly)').attr("disabled", true);
    $('.readonly input[type="radio"]:not(.non-readonly)').attr("disabled", true);
    $('.readonly input[type="checkbox"]:not(.non-readonly)').attr("disabled", true);
    $(".readonly select:not(.non-readonly)").attr("disabled", true);
    $(".readonly textarea:not(.non-readonly)").attr("disabled", true);
    $(".readonly span.text-danger").hide();

    initAutonumeric();
});

function bindSearchInfoPartial() {
    //loadAreas();

    $(document).on("change", "#cboAreas", function () {
        loadBranchs();
        loadUsers();
    });

    $(document).on("change", "#cboBranchs", function () {
        loadUsers();
    });

    $(document).on("change", "#cboUsers", function () {
        setUserName();
    });
}

function loadAreas() {
    $("#cboAreas").html("");
    $.ajax({
        dataType: 'json',
        url: '/Dictionary/GetAreas',
        success: function (response) {
            if (response && response.success === true) {
                var items = response.data;
                $("#cboAreas").append($("<option></option>").val("").html(defaultSelect));
                $.each(items,
                    function (i, item) {
                        if (window.currentAreaId === item.code) {
                            $("#cboAreas").append($("<option></option>").val(item.code).html(item.name).attr('selected', true));
                        } else {
                            $("#cboAreas").append($("<option></option>").val(item.code).html(item.name));
                        }
                    });
                loadBranchs();
            }
        }
    });
}

function loadBranchs() {
    $("#cboBranchs").html("");
    var id = $("#cboAreas").val();
    if (isEmpty(id) === false) {
        $.ajax({
            dataType: 'json',
            url: '/Dictionary/GetBranchs',
            data: { areaId: id },
            success: function (response) {
                if (response && response.success === true) {
                    var items = response.data;
                    $("#cboBranchs").append($("<option></option>").val("").html(defaultSelect));
                    $.each(items,
                        function (i, item) {
                            if (window.currentBranchId === item.code) {
                                $("#cboBranchs").append($("<option></option>").val(item.code).html(item.name)
                                    .attr('selected', true));
                            } else {
                                $("#cboBranchs").append($("<option></option>").val(item.code).html(item.name));
                            }
                        });
                    loadUsers();
                }
            }
        });
    }
}

function loadUsers() {
    $("#cboUsers").html("");
    $("#txtUser").val("");

    var branchId = $("#cboBranchs").val();
    var areaId = $("#cboAreas").val();
    var managerId = "";
    if (isEmpty(branchId) === false && isEmpty(areaId) === false) {
        $.ajax({
            dataType: 'json',
            url: '/Dictionary/GetUsers',
            data: { branchId: branchId, areaId: areaId, managerId: managerId },
            success: function (response) {
                if (response && response.success === true) {
                    var items = response.data;
                    $("#cboUsers").append($("<option></option>").val("").html(defaultSelect));
                    $.each(items,
                        function (i, item) {
                            if (window.currentUserId === item.code) {
                                $("#cboUsers").append($(`<option data-name='${item.name}'></option>`).val(item.code)
                                    .html(item.userName)
                                    .attr('selected', true));
                            } else {
                                $("#cboUsers").append($(`<option data-name='${item.name}'></option>`).val(item.code)
                                    .html(item.userName));
                            }
                        });
                    setUserName();
                }
            }
        });
    }
}

function setUserName() {
    $("#txtUser").val($("#cboUsers option:selected").attr("data-name"));
}

function isEmpty(property) {
    return property === null || property === "" || typeof property === "undefined";
}

function notifySuccess(msg, url='') {
    $.alert({
        title: 'Thông báo thành công',
        content: msg,
        type: 'green',
        typeAnimated: true,
        buttons: {
            ok: {
                text: 'Đồng ý',
                btnClass: 'btn-green',
                keys: ['enter', 'shift'],
                action: function () {
                    if (url!=="")
                        $(location).attr('href', url);
                }
            }
        }
    });
}

function notifyDanger(msg) {
    $.alert({
        title: 'Cảnh báo',
        content: msg,
        type: 'red',
        typeAnimated: true,
        buttons: {
            ok: {
                text: 'Đồng ý',
                btnClass: 'btn-red',
                keys: ['enter', 'shift'],
                action: function () { }
            }
        }
    });
}

function notifyInfo(msg) {
    $.alert({
        title: 'Thông báo',
        content: msg,
        type: 'blue',
        typeAnimated: true,
        buttons: {
            ok: {
                text: 'Đồng ý',
                btnClass: 'btn-blue',
                keys: ['enter', 'shift'],
                action: function () { }
            }
        }
    });
}

function notifyWarning(msg) {
    $.alert({
        title: 'Cảnh báo',
        content: msg,
        type: 'orange',
        typeAnimated: true,
        buttons: {
            ok: {
                text: 'Đồng ý',
                btnClass: 'btn-orange',
                keys: ['enter', 'shift'],
                action: function () { }
            }
        }
    });
}

function blockUI() {
    $.blockUI({
        message: "Đang xử lý...",
        css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .5,
            color: '#fff'
        }
    });
}

function unblockUI() {
    $.unblockUI();
}

function formatNumber(value) {
    var out = value ? value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") : "0";
    return out;
}

function formatDate(value) {
    if (moment(value, 'YYYYMMDD', true).isValid()) {
        return moment(value, "YYYYMMDD").format('DD/MM/YYYY');
    }
    return "";
}

function formatDateTime(value) {
    if (moment(value, 'YYYYMMDDHHmmss', true).isValid()) {
        return moment(value, "YYYYMMDDHHmmss").format('DD/MM/YYYY HH:mm:ss');
    }
    return "";
}

/**
 * custom jquery validate
 */
var errorClass = 'is-invalid';
var validClass = 'is-valid';
jQuery.validator.setDefaults({
    onkeyup: false,
    highlight: function (element) {
        var elem = $(element);
        var $item;
        if (elem.closest(".item-validate")) {
            $item = elem.closest(".item-validate");
            $item.removeClass(validClass);
            $item.addClass(errorClass);
        } else {
            elem.removeClass(validClass);
            elem.addClass(errorClass);
        }
    },
    unhighlight: function (element) {
        var elem = $(element);
        if (elem.closest(".item-validate")) {
            var $item = elem.closest(".item-validate");
            $item.removeClass(errorClass);
            $item.addClass(validClass);
        } else {
            elem.removeClass(errorClass);
            elem.addClass(validClass);
        }
    },
    errorElement: 'div',
    errorClass: 'invalid-tooltip',
    errorPlacement: function (error, element) {
        if (element.parent('.input-group-prepend').length) {
            $(element).siblings(".invalid-feedback").append(error);
        } else if (element.hasClass("use-select2")) {
            error.insertAfter(element.parent().find(".select2-selection"));
        } else if (element.hasClass("custom-control-input")) {
            error.insertAfter($(".item-box div").last());
        } else {
            error.insertAfter(element);
        }
    }
});

$.validator.addMethod('validphone', function (value, element) {
    return this.optional(element) || /((09|03|07|08|05)+([0-9]{8})\b)/g.test(value);
}, "Vui lòng nhập số điện thoại hợp lệ");

$.validator.addMethod('validTelephone', function (value, element) {
    return this.optional(element) || /^[\+]?[(]?[0-9]{3,4}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(value);
}, "Vui lòng nhập số điện thoại hợp lệ");

$.validator.addMethod('filesize', function (value, element, param) {
    return this.optional(element) || element.files[0].size <= param;
});

$.validator.addMethod('validIdCard', function (value, element) {
    return this.optional(element) || /^[0-9]{9}$/.test(value);
}, "Vui lòng nhập số CMND hợp lệ");

$.validator.addMethod('validIdCitizen', function (value, element) {
    return this.optional(element) || /^[0-9]{12}$/.test(value);
}, "Vui lòng nhập số CCCD hợp lệ");

$.validator.addMethod('validPassport', function (value, element) {
    return this.optional(element) || /([A-Z]+([0-9]{7})\b)/g.test(value);
}, "Vui lòng nhập số thẻ Passport hợp lệ");

$.validator.addMethod('validEvn', function (value, element) {
    //return this.optional(element) || /^[0-9]{9}$/.test(value);
    return true;
}, "Vui lòng nhập mã KH EVN hợp lệ");

$.validator.addMethod('validAccountNumber', function (value, element) {
    return this.optional(element) || /^[0-9A-Z]{16}$/.test(value);
}, "Vui lòng nhập số tài khoản hợp lệ");

$.validator.addMethod('validCardNumber', function (value, element) {
    return this.optional(element) || /^[0-9]{16}$/.test(value);
}, "Vui lòng nhập số thẻ hợp lệ");


$.fn.select2.defaults.set("theme", "bootstrap");

var arrayNumber = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function readDozens(number, full) {
    var value = "";
    var dozens = Math.floor(number / 10);
    var unit = number % 10;
    if (dozens > 1) {
        value = " " + arrayNumber[dozens] + " mươi";
        if (unit === 1) {
            value += " mốt";
        }
    } else if (dozens === 1) {
        value = " mười";
        if (unit === 1) {
            value += " một";
        }
    } else if (full && unit > 0) {
        value = " lẻ";
    }
    if (unit === 5 && dozens > 1) {
        value += " lăm";
    } else if (unit > 1 || (unit === 1 && dozens === 0)) {
        value += " " + arrayNumber[unit];
    }
    return value;
}

function readBlock(number, full) {
    var value;
    var hundred = Math.floor(number / 100);
    number = number % 100;
    if (full || hundred > 0) {
        value = " " + arrayNumber[hundred] + " trăm";
        value += readDozens(number, true);
    } else {
        value = readDozens(number, false);
    }
    return value;
}

function readMillions(number, full) {
    var value = "";
    var million = Math.floor(number / 1000000);
    number = number % 1000000;
    if (million > 0) {
        value = readBlock(million, full) + " triệu";
        full = true;
    }
    var thousand = Math.floor(number / 1000);
    number = number % 1000;
    if (thousand > 0) {
        value += readBlock(thousand, full) + " nghìn";
        full = true;
    }
    if (number > 0) {
        value += readBlock(number, full);
    }
    return value;
}

function parseNumberToWord(number) {
    if (number === 0) return arrayNumber[0] + " đồng";
    var value = "", suffixes = "";
    do {
        var billion = number % 1000000000;
        number = Math.floor(number / 1000000000);
        if (number > 0) {
            value = readMillions(billion, true) + suffixes + value;
        } else {
            value = readMillions(billion, false) + suffixes + value;
        }
        suffixes = " tỷ";
    } while (number > 0);
    value = value + " đồng";
    return value;
}

function GetDistricts($cboCity, $cboDistrict) {
    $cboDistrict.html("");
    var id = $cboCity.val();
    if (isEmpty(id) === false) {
        $.ajax({
            dataType: 'json',
            url: '/Dictionary/GetDistricts',
            data: { city: id },
            success: function (response) {
                if (response && response.success === true) {
                    var items = response.data;
                    $cboDistrict.append($("<option></option>").val("").html(defaultSelect));
                    $.each(items,
                        function (i, item) {
                            if (window.currentBranchId === item.code) {
                                $cboDistrict.append($("<option></option>").val(item.code).html(item.name)
                                    .attr('selected', true));
                            } else {
                                $cboDistrict.append($("<option></option>").val(item.code).html(item.name));
                            }
                        });
                }
            }
        });
    }
}

function validatePhone(phone) {
    var phoneno = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (phone.match(phoneno)) {
        return true;
    }
    else {
        return false;
    }
}

function validateOTP(phone) {
    var phoneno = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (phone.match(phoneno)) {
        return true;
    }
    else {
        return false;
    }
}

function validIdentity(cmnd) {
    var parten = /^[0-9]{9}$/;
    if (cmnd.match(parten)) {
        return true;
    }
    else {
        return false;
    }
}

function serializeData(name, items) {
    var a = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                a.push({ name: name + '[' + i + '].' + key + '', value: item[key] });
            }
        }
    }
    return a;
}


/* begin multiple steps */

var currentFs, nextFs, previousFs;
var opacity;
var current = 1;
var steps = $("fieldset").length;

function setProgressBar(curStep) {
    var percent = parseFloat(100 / steps) * curStep;
    percent = percent.toFixed();
    $(".progress-bar").css("width", percent + "%");
}

function nextStep($step) {
    currentFs = $step.parent();
    nextFs = $step.parent().next();

    $("#progressbar li").eq($("fieldset").index(nextFs)).addClass("active");
    nextFs.show();
    currentFs.animate({ opacity: 0 }, {
        step: function (now) {
            opacity = 1 - now;
            currentFs.css({
                'display': 'none',
                'position': 'relative'
            });
            nextFs.css({ 'opacity': opacity });
        },
        duration: 500
    });
    setProgressBar(++current);
}

function previousStep($step) {
    currentFs = $step.parent();
    previousFs = $step.parent().prev();
    $("#progressbar li").eq($("fieldset").index(currentFs)).removeClass("active");

    previousFs.show();
    currentFs.animate({ opacity: 0 }, {
        step: function (now) {
            opacity = 1 - now;

            currentFs.css({
                'display': 'none',
                'position': 'relative'
            });
            previousFs.css({ 'opacity': opacity });
        },
        duration: 500
    });
    setProgressBar(--current);
}

/* end multiple steps */

/* begin auto numeric */

var autoNumericOptions = {
    digitGroupSeparator: ".",
    decimalCharacter: ",",
    decimalCharacterAlternative: ",",
    decimalPlaces: 0,
    minimumValue: 1
};

function initAutonumeric() {
    AutoNumeric.multiple('.autonumeric-integer', autoNumericOptions);
}

/* end auto numeric */

function bindDivisionUnitDept() {
    $(document).on("change", "#cboDivision", function () {
        loadUnit();
        loadDepartment();
    });

    $(document).on("change", "#cboUnit", function () {
        loadDepartment();
    });
}

function loadDivision() {
    var $thisCombobox = $("#cboDivision");
    $thisCombobox.html("");
    $.ajax({
        dataType: 'json',
        url: '/Dictionary/GetDivision',
        success: function (response) {
            if (response && response.success === true) {
                var items = response.data;
                $thisCombobox.append($("<option></option>").val("").html(defaultSelect));
                $.each(items,
                    function (i, item) {
                        if (window.currentAreaId === item.code) {
                            $thisCombobox.append($("<option></option>").val(item.code).html(item.name).attr('selected', true));
                        } else {
                            $thisCombobox.append($("<option></option>").val(item.code).html(item.name));
                        }
                    });
                loadUnit();
                loadDepartment();
            }
        }
    });
}

function loadUnit() {
    var $thisCombobox = $("#cboUnit");
    var $parentCombobox = $("#cboDivision");

    $thisCombobox.html("");
    var id = $parentCombobox.val();
    if (isEmpty(id) === false) {
        $.ajax({
            dataType: 'json',
            url: '/Dictionary/GetUnit',
            data: { divisionId: id },
            success: function (response) {
                if (response && response.success === true) {
                    var items = response.data;
                    $thisCombobox.append($("<option></option>").val("").html(defaultSelect));
                    $.each(items,
                        function (i, item) {
                            if (window.currentBranchId === item.code) {
                                $thisCombobox.append($("<option></option>").val(item.code).html(item.name)
                                    .attr('selected', true));
                            } else {
                                $thisCombobox.append($("<option></option>").val(item.code).html(item.name));
                            }
                        });
                    loadDepartment();
                }
            }
        });
    }
}

function loadDepartment() {
    var $thisCombobox = $("#cboDepartment");
    var $parentCombobox = $("#cboUnit");
    var $divisionCombobox = $("#cboDivision");

    $thisCombobox.html("");
    var $unitId = $parentCombobox.val();
    var $divisionId = $divisionCombobox.val();

    if (isEmpty($unitId) === false) {
        $.ajax({
            dataType: 'json',
            url: '/Dictionary/GetDepartment',
            data: { divisionId: $divisionId, unitId: $unitId },
            success: function (response) {
                if (response && response.success === true) {
                    var items = response.data;
                    $thisCombobox.append($("<option></option>").val("").html(defaultSelect));
                    $.each(items,
                        function (i, item) {
                            if (window.currentBranchId === item.code) {
                                $thisCombobox.append($("<option></option>").val(item.code).html(item.name)
                                    .attr('selected', true));
                            } else {
                                $thisCombobox.append($("<option></option>").val(item.code).html(item.name));
                            }
                        });
                }
            }
        });
    }
}

function printInvoicePayInto(id, transType) {
    $.ajax({
        dataType: 'html',
        type: 'get',
        url: '/PayInto/PrintInvoicePayInto',
        data: { transType: transType, id: id },
        success: function (response) {
            $("#data-invoice").html("").html(response);

            $("#data-invoice").print({
                //Use Global styles
                globalStyles: false,
                //Add link with attrbute media=print
                mediaPrint: false,
                //Custom stylesheet
                stylesheet: "/css/print-invoice.css",
                //Print in a hidden iframe
                iframe: false,
                //Don't print this
                noPrintSelector: ".avoid-this",
                //Add this at top
                prepend: "",
                //Add this on bottom
                append: "",
                //Log to console when printing is done via a deffered callback
                deferred: $.Deferred().done(function () { location.reload(); })
            });
        }
    });
}

function printInvoiceWithdraw(id) {
    $.ajax({
        dataType: 'html',
        type: 'post',
        url: '/Withdraw/PrintWithdraw',
        data: { "id": id },
        success: function (response) {
            $("#data-withdraw-info").html("").html(response);

            $("#data-withdraw-info").print({
                //Use Global styles
                globalStyles: false,
                //Add link with attrbute media=print
                mediaPrint: false,
                //Custom stylesheet
                stylesheet: "/css/print-invoice.css",
                //Print in a hidden iframe
                iframe: false,
                //Don't print this
                noPrintSelector: ".avoid-this",
                //Add this at top
                prepend: "",
                //Add this on bottom
                append: "",
                //Log to console when printing is done via a deffered callback
                deferred: $.Deferred().done(function () { location.reload(); })
            });
        }
    });
}

function myDataTable($tableId, length = 10) {
    //$tableId.DataTable().destroy();
    return $tableId.DataTable({
        //serverSide: true,
        //dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        pageLength: length,
        paging: true,
        info: true,
        retrieve: true,
        lengthChange: false,
        searching: false,
        ordering: false,
        autoWidth: false,
        pagingType: 'full_numbers',
        language: {
            info: 'Đang xem _PAGE_/_PAGES_',
            paginate: {
                first: '«',
                previous: '‹',
                next: '›',
                last: '»'
            }
        }
    }).rows().remove().draw();
}