$(document).ready(function() {
    // ajax_url_endpoint_prefix();
    // 
    // let path = "/static/images/";
    // let path = Flask.url_for('static', { 'filename': 'images' }) + '/';
    let path = ajaxURLprefix + "/static/images/";

    $('link[rel="shortcut icon"]').attr("href", path + MTO_INIT.iconImage);
    $('.meteo-logo').attr("src", path + MTO_INIT.metLogo);

    // $('link[rel="shortcut icon"]').attr("href", path + 'dst.png');
    // $('.meteo-logo').attr("src", path + 'dst.png');
});

function ajax_url_endpoint_prefix() {
    // work with GET request only
    $.ajaxSetup({
        beforeSend: function(jqXHR, settings) {
            settings.url = ajaxURLprefix + settings.url;
        }
    });
}

function create_endpoint_get(endpoint_name, blueprint = 'webapi') {
    var endpoint = '/' + endpoint_name;
    // var endpoint = Flask.url_for(blueprint + '.' + endpoint_name);
    return endpoint
}

function create_endpoint_post(endpoint_name, blueprint = 'webapi') {
    // var endpoint = '/' + endpoint_name;
    // var endpoint = Flask.url_for(blueprint + '.' + endpoint_name);
    var endpoint = ajaxURLprefix + '/' + endpoint_name;
    return endpoint
}

function spinnerOptions() {
    // http://spin.js.org/
    // leaflet spin css
    return {
        lines: 13, // The number of lines to draw
        length: 38, // The length of each line
        width: 17, // The line thickness
        radius: 45, // The radius of the inner circle
        scale: 1, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        speed: 1, // Rounds per second
        rotate: 0, // The rotation offset
        animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#ffffff', // CSS color or array of colors
        fadeColor: 'transparent', // CSS color or array of colors
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: '0 0 1px transparent', // Box-shadow for the lines
        zIndex: 2000000000, // The z-index (defaults to 2e9)
        className: 'spinner', // The CSS class to assign to the spinner
        position: 'absolute', // Element positioning
    };
}

function flashMessage(message, category) {
    let divFlash = $('<div>').addClass('alert alert-dismissible');
    if (category == 'error') {
        category = 'danger';
    }
    divFlash.addClass('alert-' + category);
    divFlash.attr('role', 'alert');
    divFlash.html(message);

    $('<button />', {
        class: 'btn-close',
        type: 'button',
        'data-bs-dismiss': 'alert',
        'aria-label': 'Close'
    }).appendTo(divFlash);

    $('.div-flash-alert').append(divFlash);
}

function createDownloadableLink(blob, file_name) {
    var URL = window.URL || window.webkitURL;
    var downloadUrl = URL.createObjectURL(blob);

    var downlink = document.createElement("a");
    downlink.href = downloadUrl;
    downlink.download = file_name;
    document.body.appendChild(downlink);
    downlink.click();
    document.body.removeChild(downlink);
}

function convertBase64ToArrayBuffer(base64_data) {
    var bin_string = atob(base64_data);
    var len = bin_string.length;
    var bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = bin_string.charCodeAt(i);
    }
    return bytes.buffer;
}

// 
function displayAjaxError(jqXHR, textStatus, errorThrown) {
    flashMessage(textStatus + ': ' + errorThrown, 'error');
    // open in new tab
    if (ajaxURLprefix === '') {
        var win = window.open();
        $(win.document.body).html(jqXHR.responseText);
    }
}

function hideModalDialog(id_modal) {
    var this_modal = document.getElementById(id_modal);
    var modal = bootstrap.Modal.getInstance(this_modal);
    if (modal !== null) {
        modal.hide();
    }
}

function disposeModalDialog(id_modal) {
    var this_modal = document.getElementById(id_modal);
    var modal = bootstrap.Modal.getInstance(this_modal);
    if (modal !== null) {
        modal.dispose();
    }
}

function arrayRemoveDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

function getAllSelectOptions(selectID) {
    var options = $("#" + selectID + " option").map(function() {
        var text = $(this).text().trim();
        var val = $(this).val().trim();
        return { 'value': val, 'text': text };
    });
    return options.get();
}

function getAllSelectOptions_pgCtl(key) {
    var options = [];
    for (var [k, v] of Object.entries(PAGE_CTRL[key])) {
        options.push({ 'value': k, 'text': v });
    }
    return options;
}

function format_date(date) {
    var d = date.getDate();
    if (d < 10) d = '0' + d;
    var m = date.getMonth() + 1;
    if (m < 10) m = '0' + m;
    var y = date.getFullYear();

    return [y, m, d].join('-');
}

function get_seq_dates_daily(start_date, end_date) {
    var tz = { timeZone: 'UTC' };
    var start = new Date(start_date);
    start = new Date(start.toLocaleString('en-US', tz));
    var end = new Date(end_date);
    end = new Date(end.toLocaleString('en-US', tz));
    var dates = [];
    while (start <= end) {
        dates.push(new Date(start));
        start.setDate(start.getDate() + 1);
    }

    return dates.map((x) => format_date(x));
}

function get_seq_dates_dekadal(start_date, end_date) {
    var tz = { timeZone: 'UTC' };
    var start = new Date(start_date);
    start = new Date(start.toLocaleString('en-US', tz));
    var end = new Date(end_date);
    end = new Date(end.toLocaleString('en-US', tz));
    var dates = [];
    while (start <= end) {
        dates.push(new Date(start));
        start.setDate(start.getDate() + 1);
    }
    dates = dates.map((x) => {
        var dk = x.getDate();
        if (dk > 3) {
            return;
        }
        var m = x.getMonth() + 1;
        if (m < 10) m = '0' + m;
        var y = x.getFullYear();
        return [y, m, dk].join('-');
    });

    return dates.filter(x => x !== undefined);
}

function get_seq_dates_monthly(start_date, end_date, step = 1) {
    var tz = { timeZone: 'UTC' };
    var start = new Date(start_date);
    start = new Date(start.toLocaleString('en-US', tz));
    var end = new Date(end_date);
    end = new Date(end.toLocaleString('en-US', tz));
    var dates = [];
    while (start <= end) {
        dates.push(new Date(start));
        start.setMonth(start.getMonth() + step);
    }
    dates = dates.map((x) => {
        var m = x.getMonth() + 1;
        if (m < 10) m = '0' + m;
        var y = x.getFullYear();
        return [y, m].join('-');
    });

    return dates;
}

function get_seq_dates_annual(start_year, end_year) {
    var start = Number(start_year);
    var end = Number(end_year);
    var years = [];
    for (var y = start; y <= end; y++) {
        years.push(y);
    }

    return years;
}

function seq_months_seasonal(start, end) {
    var seas = [];
    while (start <= end) {
        seas.push(new Date(start));
        start.setMonth(start.getMonth() + 12);
    }
    seas = seas.map((x) => {
        var m = x.getMonth() + 1;
        if (m < 10) m = '0' + m;
        var y = x.getFullYear();
        return [y, m].join('-');
    });

    return seas;
}

function get_seq_dates_seasonal(start_year, end_year, seas_start, seas_length) {
    var yr1 = Number(start_year);
    var yr2 = Number(end_year);
    var mon = Number(seas_start);
    var len = Number(seas_length);

    var tz = { timeZone: 'UTC' };
    var start1 = [yr1, mon].join('-');
    start1 = new Date(start1);
    start1 = new Date(start1.toLocaleString('en-US', tz));
    var start2 = [yr2, mon].join('-');
    start2 = new Date(start2);
    start2 = new Date(start2.toLocaleString('en-US', tz));
    var end1 = new Date(start1.valueOf());
    end1 = new Date(new Date(end1).setMonth(end1.getMonth() + len - 1));
    var end2 = new Date(start2.valueOf());
    end2 = new Date(new Date(end2).setMonth(end2.getMonth() + len - 1));

    var seas1 = seq_months_seasonal(start1, start2);
    var seas2 = seq_months_seasonal(end1, end2);
    var dates = [];
    for (var i = 0; i < seas1.length; i++) {
        var s = [seas1[i], seas2[i]].join('_');
        dates.push(s);
    }

    return dates;
}