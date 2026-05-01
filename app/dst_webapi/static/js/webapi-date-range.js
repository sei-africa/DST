function calendar_set_daydekmon(hcontainerId, calendarID) {
    var dataset = $('#dataset option:selected').val();
    var tempRes = $('#temporal-resolution option:selected').val();
    var variable = $('#variable option:selected').val();

    var start_date = PAGE_CTRL.dataInfo[dataset][tempRes][variable].temporal_coverage.start;
    var end_date = PAGE_CTRL.dataInfo[dataset][tempRes][variable].temporal_coverage.end;

    if (tempRes === 'monthly') {
        cl_type = 'year-month-picker';
        cl_format = 'YYYY-MM';
        start_date = start_date + '-16';
        end_date = end_date + '-16';
    } else {
        cl_type = 'default';
        cl_format = 'YYYY-MM-DD';
        if (tempRes === 'dekadal') {
            start_date = calendar_format_dekad_range(start_date);
            end_date = calendar_format_dekad_range(end_date);
        }
    }

    var init_date = end_date;
    if (hcontainerId === 'start-date') {
        var tmp_date = new Date(end_date);
        tmp_date.setMonth(tmp_date.getMonth() - 1);
        init_date = format_date(tmp_date);
        if (tempRes === 'dekadal') {
            init_date = calendar_format_dekad(init_date);
        }
    }

    $('<input>', { type: 'text', id: calendarID })
        .addClass('form-control')
        .appendTo($('#' + hcontainerId));
    var inputDateID = document.getElementById(calendarID);
    var calendar_date = jSuites.calendar(inputDateID, {
        type: cl_type,
        value: init_date,
        fullscreen: false,
        readonly: false,
        format: cl_format,
        validRange: [start_date, end_date],
        onopen: function() {
            $('.jcalendar-update').hide();
        },
        onclose: function(el) {
            if (tempRes === 'dekadal') {
                var this_date = $(el).val();
                var dek_date = calendar_format_dekad(this_date);
                $(el).val(dek_date);
            }
        }
    });
    inputDateID.addEventListener('change', function() {
        if (tempRes === 'dekadal') {
            var this_date = calendar_date.getValue();
            var dek_date = calendar_format_dekad(this_date);
            calendar_date.setValue(dek_date);
        }
    });
}

function calendar_set_year(hcontainerId, calendarID) {
    var dataset = $('#dataset option:selected').val();
    var tempRes = $('#temporal-resolution option:selected').val();
    var variable = $('#variable option:selected').val();

    var start_yr = PAGE_CTRL.dataInfo[dataset][tempRes][variable].temporal_coverage.start;
    var end_yr = PAGE_CTRL.dataInfo[dataset][tempRes][variable].temporal_coverage.end;

    if (tempRes === 'seasonal') {
        start_yr = Number(start_yr.split('-')[0]);
        end_yr = Number(end_yr.split('-')[0]);
    } else {
        start_yr = Number(start_yr);
        end_yr = Number(end_yr);
    }

    var init_yr = end_yr;
    if (hcontainerId === 'start-date') init_yr = end_yr - 1;

    var select = $('<select>')
        .attr('id', calendarID)
        .addClass('form-select')
        .appendTo($('#' + hcontainerId));

    for (var yr = start_yr; yr <= end_yr; ++yr) {
        select.append(
            $('<option>').text(yr).val(yr)
        );
    }
    select.val(init_yr);
}

function calendar_season_start(hcontainerId, calendarID) {
    var select = $('<select>')
        .attr('id', calendarID)
        .addClass('form-select')
        .appendTo($('#' + hcontainerId));

    var months = calendar_get_months_name();
    for (var m = 0; m < 12; ++m) {
        select.append(
            $('<option>').text(months[m]).val(m + 1)
        );
    }
    select.val(1);

    calendar_season_display(select);
}

function calendar_season_length(hcontainerId, calendarID) {
    var select = $('<select>')
        .attr('id', calendarID)
        .addClass('form-select')
        .appendTo($('#' + hcontainerId));

    for (var l = 2; l <= 12; ++l) {
        select.append(
            $('<option>').text(l).val(l)
        );
    }
    select.val(3);

    calendar_season_display(select);
}

function calendar_season_display(select) {
    var months = calendar_get_months_name();
    select.on('change', () => {
        var mon = $('#mon-seas-calendar option:selected').val();
        var len = $('#len-seas-calendar option:selected').val();
        mon = Number(mon);
        len = Number(len);
        var mn = (mon + len - 1) % 12;
        mn = (mn === 0) ? 12 : mn;
        var seas = months[mon - 1] + ' -> ' + months[mn - 1];
        $('#display-season').text(seas);
    });
}

function calendar_get_months_name() {
    var months = [];
    for (var m = 0; m < 12; ++m) {
        var date = new Date(2025, m, 1);
        var month = date.toLocaleString('default', { month: 'long' });
        months.push(month);
    }
    return months;
}

function calendar_format_dekad(date) {
    var dk = Number(date.substring(8, 10));
    if (dk <= 10) {
        dek = '01';
    } else if (dk >= 21) {
        dek = '21';
    } else {
        dek = '11';
    }

    return date.substring(0, 8) + dek + date.substring(10);
}

function calendar_format_dekad_query(date) {
    var tmp = date.split('-');
    var out = '';
    if (tmp[2] === undefined) {
        return out;
    }
    var dk = Number(tmp[2]);
    if (isNaN(dk)) {
        return out;
    }
    if (dk > 31 || dk < 1) {
        return out;
    }
    if (dk <= 10) {
        tmp[2] = '1';
    } else if (dk >= 21) {
        tmp[2] = '3';
    } else {
        tmp[2] = '2';
    }

    return tmp.join('-');
}

function calendar_format_dekad_range(date) {
    var dk = date.split('-');
    if (dk[2] === '1') {
        d = '01';
    } else if (dk[2] === '2') {
        d = '11';
    } else {
        d = '21';
    }
    dk[2] = d;

    return dk.join('-');
}