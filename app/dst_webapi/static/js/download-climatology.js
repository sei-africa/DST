$(document).ready(function() {
    ajax_url_endpoint_prefix();
    // 
    var map = createLeafletTileLayer('div-map-container');
    $('#nav-tab-map-container').on('shown.bs.tab', (e) => {
        MAP_BE.invalidateSize();
    });

    $('#nav-tab-api-url').hide();
    $('#nav-tab-down-data').hide();
    $('#nav-tab-shp-attr').hide();

    /////
    var in_tempres = getAllSelectOptions('temporal-resolution');
    var in_variable = getAllSelectOptions('variable');
    var out_format = getAllSelectOptions('output-format');
    download_data_setSeasLen();

    ///
    $('#dataset').on('change', () => {
        download_data_setTempres(in_tempres, in_variable);
        download_data_hideDayWindow();
        download_data_hideSeasLen();
    });
    $('#dataset').trigger('change');

    $('#temporal-resolution').on('change', () => {
        download_data_setVariable(in_variable);
        download_data_hideDayWindow();
        download_data_hideSeasLen();
        fullyear_clim_hideClimdate();
    });
    $('#temporal-resolution').trigger('change');

    $('#extract-support').on('change', () => {
        download_data_setGeom(out_format);
    });
    $('#extract-support').trigger('change');

    $('#clim-function').on('change', () => {
        download_data_hideClimFunPerc();
    });
    $('#clim-function').trigger('change');

    ////
    $('#btn-api-url').on('click', function() {
        download_climatology_api_url();
    });

    ////
    $('#btn-download-data').on('click', function() {
        download_climatology_web_app();
    });

    $('#climato-full-year').on('click', function() {
        fullyear_clim_hideClimdate();
    });
});

function download_climatology_api_url() {
    $('#nav-tab-api-url').show();
    $('#div-api-url').empty();
    $('#nav-tab-api-url').get(0).click();

    var query = get_climato_query_parameters();
    if (!query) {
        return false;
    }

    var params = create_climato_request_api_obj(query);
    var links = create_climato_request_api_url(query);

    create_tab_api_request(params, links);
}

function download_climatology_web_app() {
    var query = get_climato_query_parameters();
    if (!query) {
        return false;
    }

    var params = create_climato_request_api_obj(query);
    params.parameters.webApp = true;

    var endpoint = create_endpoint_post('download_climtology_data');

    $.ajax({
        type: 'POST',
        url: endpoint,
        dataType: 'json',
        data: JSON.stringify(params.parameters),
        contentType: 'application/json',
        success: (json) => {
            if (json.status === 0) {
                if (json.binary) {
                    var out_data = convertBase64ToArrayBuffer(json.data);
                } else {
                    var out_data = json.data;
                }
                var blob = new Blob([out_data], { type: json.mimetype });
                createDownloadableLink(blob, json.filename);
            } else {
                flashMessage(json.message, 'error');
            }
        },
        beforeSend: () => {
            if (MAP_BE != undefined) {
                MAP_BE.closePopup();
                MAP_BE.spin(true, spinnerOptions());
            }
            $('#spin-download-data').removeClass('visually-hidden');
            $('#btn-download-data').prop('disabled', true);
        },
        error: (xhr, s, e) => {
            displayAjaxError(xhr, s, e);
        }
    }).always(() => {
        MAP_BE.spin(false);
        $('#spin-download-data').addClass('visually-hidden');
        $('#btn-download-data').prop('disabled', false);
    });
}

function create_climato_request_api_obj(query) {
    var obj = JSON.parse(JSON.stringify(query));
    if (obj.geomExtract === 'polygons') {
        if (!obj.allPolygons) {
            obj.Poly = obj.shpPolygons;
            delete obj.shpPolygons;
            delete obj.allPolygons;
        }
    }

    if (is_grid_extraction(obj)) {
        delete obj.spatialAvg;
    }
    // var url = window.location.origin + '/download_climtology_data';
    var url = window.location.origin + ajaxURLprefix + '/download_climtology_data';

    return { 'parameters': obj, 'url': url, 'dates': [], 'from': 'climatology' }
}

function create_climato_request_api_url(query) {
    var obj = JSON.parse(JSON.stringify(query));
    var queryString;
    if (obj.geomExtract === 'polygons') {
        if (!obj.allPolygons) {
            var params = new URLSearchParams();
            obj.shpPolygons.forEach(x => params.append('Poly', x));
            queryString = params.toString();
            delete obj.shpPolygons;
            delete obj.allPolygons;
        }
    }

    // var baseUrl = window.location.origin + '/download_climtology_data';
    var baseUrl = window.location.origin + ajaxURLprefix + '/download_climtology_data';
    var url = new URL(baseUrl);

    if (is_grid_extraction(obj)) {
        delete obj.spatialAvg;
    }

    for (var key in obj) {
        url.searchParams.append(key, obj[key]);
    }
    url = url.toString();
    if (queryString !== undefined) {
        url = url + '&' + queryString;
    }

    return url;
}

function get_climato_query_parameters() {
    var query = { apiKey: DATA_USERS.api_key };
    query.dataset = $('#dataset').val();
    var temp_res = $('#temporal-resolution').val();
    query.temporalRes = temp_res;
    query.variable = $('#variable').val();

    if (temp_res === 'seasonal') {
        query.seasLength = $('#season-length').val();
    }

    // full year climatology
    query.fullYear = $('#climato-full-year').is(':checked');
    if (!query.fullYear) {
        if (temp_res !== 'annual') {
            query.climDate = $('#climdate-full-year').val();
        }
    }

    var clim_f = $('#clim-function').val();
    query.climFunction = clim_f;

    if (clim_f === 'percentile') {
        var perc_v = $('#clim-function-perc').val();
        perc_v = Number(perc_v.trim());
        if (isNaN(perc_v)) {
            flashMessage('Invalid percentile value', 'error');
            return false;
        } else {
            if (perc_v < 0 || perc_v > 100) {
                flashMessage('Invalid percentile value', 'error');
                return false;
            }
        }
        query.precentileValue = perc_v;
    }

    var query_bp = get_baseperiod_query_parameters();
    query = Object.assign(query, query_bp);
    var query_c = get_common_query_parameters();
    query = Object.assign(query, query_c);

    return query;
}

function fullyear_clim_hideClimdate() {
    var tempres = $('#temporal-resolution option:selected').val();
    if (tempres == 'annual') {
        $('#climato-full-year').prop('checked', true);
        $('#climdate-full-year').empty();
        $('#select-full-year').hide();
    } else {
        var fullyear = $('#climato-full-year').is(':checked');
        $('#climdate-full-year').empty();
        if (fullyear) {
            $('#select-full-year').hide();
        } else {
            $('#select-full-year').show();
            fullyear_clim_setClimdate();
        }
    }
}

function fullyear_clim_setClimdate() {
    var tempres = $('#temporal-resolution option:selected').val();
    var climdate = [];
    if (tempres === 'daily') {
        let start = new Date(2025, 0, 1);
        let dates = [];
        while (start.getFullYear() === 2025) {
            dates.push(new Date(start));
            start.setDate(start.getDate() + 1);
        }
        for (let d = 0; d < dates.length; d++) {
            let mo = dates[d].getMonth() + 1;
            let dy = dates[d].getDate();
            mo = (mo < 10 ? '0' : '') + mo;
            dy = (dy < 10 ? '0' : '') + dy;
            let day = `${mo}-${dy}`;
            climdate.push(day);
        }
    } else if (tempres === 'dekadal') {
        for (let m = 1; m <= 12; m++) {
            for (let d = 1; d < 4; d++) {
                let mo = (m < 10 ? '0' : '') + m;
                let dek = `${mo}-${d}`;
                climdate.push(dek);
            }
        }
    } else if (tempres === 'monthly') {
        for (let i = 1; i <= 12; i++) {
            climdate.push(i);
        }
    } else if (tempres === 'seasonal') {
        for (let i = 1; i <= 12; i++) {
            climdate.push(i);
        }
    } else {
        climdate = [1];
    }

    for (let s = 0; s < climdate.length; s++) {
        $('#climdate-full-year').append(
            $('<option>').text(climdate[s]).val(climdate[s])
        );
    }
}