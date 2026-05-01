function download_data_setTempres(in_tempres, in_variable) {
    var dataset = $('#dataset option:selected').val();
    var tempres = $('#temporal-resolution option:selected').val();
    var variable = $('#variable option:selected').val();
    var data_info = PAGE_CTRL.dataInfo[dataset];

    $('#temporal-resolution').empty();
    $('#variable').empty();

    var tres_data = Object.keys(data_info);
    var tres_select = in_tempres.filter(x => tres_data.includes(x.value));
    for (var s = 0; s < tres_select.length; ++s) {
        $('#temporal-resolution').append(
            $('<option>').text(tres_select[s].text).val(tres_select[s].value)
        );
    }
    if (tres_data.includes(tempres)) $('#temporal-resolution').val(tempres);

    var var_data = Object.keys(data_info[tres_select[0].value]);
    var var_select = in_variable.filter(x => var_data.includes(x.value));
    for (var s = 0; s < var_select.length; ++s) {
        $('#variable').append(
            $('<option>').text(var_select[s].text).val(var_select[s].value)
        );
    }
    if (var_data.includes(variable)) $('#variable').val(variable);
}

function download_data_setVariable(in_variable) {
    var dataset = $('#dataset option:selected').val();
    var tempres = $('#temporal-resolution option:selected').val();
    var variable = $('#variable option:selected').val();
    var data_info = PAGE_CTRL.dataInfo[dataset][tempres];

    $('#variable').empty();

    var var_data = Object.keys(data_info);
    var var_select = in_variable.filter(x => var_data.includes(x.value));
    for (var s = 0; s < var_select.length; ++s) {
        $('#variable').append(
            $('<option>').text(var_select[s].text).val(var_select[s].value)
        );
    }
    if (var_data.includes(variable)) $('#variable').val(variable);
}

function download_data_setCalendar() {
    var tempres = $('#temporal-resolution option:selected').val();

    $('#start-date').empty();
    $('#end-date').empty();

    var ddm = ['daily', 'dekadal', 'monthly'];
    if (ddm.indexOf(tempres) !== -1) {
        $('#seasonal-res').hide();
        $('#start-date-text').text('Start Date');
        $('#end-date-text').text('End Date');
        calendar_set_daydekmon('start-date', 'start-calendar');
        calendar_set_daydekmon('end-date', 'end-calendar');
    }

    if (tempres === 'seasonal') {
        $('#seasonal-res').show();
        $('#start-date-text').text('Start Year');
        $('#end-date-text').text('End Year');
        calendar_set_year('start-date', 'start-calendar');
        calendar_set_year('end-date', 'end-calendar');

        $('#start-season').empty();
        $('#length-season').empty();

        calendar_season_start('start-season', 'mon-seas-calendar');
        calendar_season_length('length-season', 'len-seas-calendar');
    }
    if (tempres === 'annual') {
        $('#seasonal-res').hide();
        $('#start-date-text').text('Start Year');
        $('#end-date-text').text('End Year');
        calendar_set_year('start-date', 'start-calendar');
        calendar_set_year('end-date', 'end-calendar');
    }
}

function download_data_setSeasLen() {
    for (var s = 2; s <= 12; ++s) {
        $('#season-length').append(
            $('<option>').text(s).val(s)
        );
    }
    $('#season-length').val(3);
}

function download_data_hideSeasLen() {
    var tempres = $('#temporal-resolution option:selected').val();
    if (tempres === 'seasonal') {
        $('#div-climato-seas').show();
    } else {
        $('#div-climato-seas').hide();
    }
}

function download_data_hideClimFunPerc() {
    var climfun = $('#clim-function option:selected').val();
    if (climfun === 'percentile') {
        $('#div-climato-perc').show();
    } else {
        $('#div-climato-perc').hide();
    }
}

function download_data_hideDayWindow() {
    var tempres = $('#temporal-resolution option:selected').val();
    if (tempres === 'daily') {
        $('#div-days-window').show();
    } else {
        $('#div-days-window').hide();
    }
}

function download_data_setGeom(out_format) {
    var exsupp = $('#extract-support option:selected').val();
    $('#div-extract-support').empty();
    removeLayerMarkers();
    removeLayerMarkers1();
    removeLayerRectangleBox();
    removeLayerPolygons();
    MAP_BE.off('click');

    $('#nav-tab-api-url').hide();
    $('#nav-tab-down-data').hide();
    $('#nav-tab-shp-attr').hide();
    $('#btn-api-url').show();
    $('#nav-tab-map-container').get(0).click();

    if (exsupp !== 'rectangle') {
        MAP_BE.removeEventListener('mousedown');
        MAP_BE.dragging.enable();
    }

    if (exsupp === 'originalgrid') {
        // no options
    } else if (exsupp === 'usergeojson') {
        var endpoint = create_endpoint_get('get_usergeojson');
        $.getJSON(endpoint, (json) => {
            if (json.status === -1) {
                flashMessage(json.message, "error");
                return false;
            }
            geom_support_usergeojson_select(json.geojs);
        });
    } else if (exsupp === 'usermpoints') {
        var endpoint = create_endpoint_get('get_usermpoints');
        $.getJSON(endpoint, (json) => {
            if (json.status === -1) {
                flashMessage(json.message, "error");
                return false;
            }
            geom_support_usermpoints_select(json.mpts);
        });
    } else if (exsupp === 'mapmpoints') {
        $('#btn-api-url').hide();
        (function(next) {
            geom_support_mapmpoints_select();
            next()
        }(function() {
            MAP_BE.on('click', mapmpoints_click_point);
        }));
    } else if (exsupp === 'rectangle') {
        (function(next) {
            geom_support_rectangle_select();
            next();
        }(function() {
            MAP_BE.on('mousedown', rectangle_draw_onMap);
            geom_set_select_output_format(out_format, exsupp);
        }));
    } else {
        if (exsupp === 'userpolygons') {
            var endpoint1 = create_endpoint_get('get_userpolygons');
            var endpoint2 = create_endpoint_get('read_userpolygons');
        } else {
            var endpoint1 = create_endpoint_get('get_defaultpolygons');
            var endpoint2 = create_endpoint_get('read_defaultpolygons');
        }

        $.getJSON(endpoint1, (json) => {
            if (json.status === -1) {
                flashMessage(json.message, 'error');
                return false;
            }
            (function(next) {
                geom_support_polygons_select(json.shp, endpoint2);
                next()
            }(function() {
                geom_set_select_output_format(out_format, exsupp);
            }));
        });
    }

    set_select_output_format(out_format, exsupp);
}

function set_select_output_format(out_format, geom_support) {
    $('#output-format').empty();
    var frmt = [];
    if (geom_support === 'usermpoints' || geom_support === 'mapmpoints') {
        frmt = ['CSV-CDT-Format', 'JSON-Format'];
    } else if (geom_support === 'usergeojson') {
        frmt = ['JSON-Format'];
    } else if (geom_support === 'originalgrid') {
        frmt = ['netCDF-Format', 'CSV-Column-Format', 'JSON-Format'];
    } else {
        if ($('#spatial-average-over').is(":checked")) {
            frmt = ['CSV-CDT-Format', 'JSON-Format'];
        } else {
            frmt = ['netCDF-Format', 'CSV-Column-Format', 'JSON-Format'];
        }
    }

    var out_select = out_format.filter(x => frmt.includes(x.value));
    for (var s = 0; s < out_select.length; ++s) {
        $('#output-format').append(
            $('<option>').text(out_select[s].text).val(out_select[s].value)
        );
    }
}

function geom_set_select_output_format(out_format, geom_support) {
    $('#spatial-average-over').change(function() {
        set_select_output_format(out_format, geom_support);
    });
}

function is_grid_extraction(obj) {
    grid1 = ['rectangle', 'polygons'].includes(obj.geomExtract);
    if (grid1) {
        grid1 = grid1 && !obj.spatialAvg;
    }
    grid2 = obj.geomExtract === 'original';

    return grid1 || grid2;
}

function get_tseries_query_parameters() {
    var query = new Object();

    query.dataset = $('#dataset').val();
    var temp_res = $('#temporal-resolution').val();
    query.temporalRes = temp_res;
    query.variable = $('#variable').val();
    var start_t = $('#start-calendar').val();
    if (start_t.trim() === '') {
        flashMessage('Invalid start date range', 'error');
        return false;
    }
    var end_t = $('#end-calendar').val();
    if (end_t.trim() === '') {
        flashMessage('Invalid end date range', 'error');
        return false;
    }
    query.startDate = start_t;
    query.endDate = end_t;
    if (temp_res === 'dekadal') {
        query.startDate = calendar_format_dekad_query(start_t);
        if (query.startDate === '') {
            flashMessage('Invalid start date range', 'error');
            return false;
        }
        query.endDate = calendar_format_dekad_query(end_t);
        if (query.endDate === '') {
            flashMessage('Invalid end date range', 'error');
            return false;
        }
    }
    if (temp_res === 'seasonal') {
        query.seasStart = $('#mon-seas-calendar').val();
        query.seasLength = $('#len-seas-calendar').val();
    }

    return query;
}

function get_common_query_parameters() {
    var query = new Object();

    var geom_ext = $('#extract-support').val();
    if (geom_ext === 'originalgrid') {
        query.geomExtract = 'original';
    } else if (geom_ext === 'usergeojson') {
        query.geomExtract = 'geojson';
        query.geojsonSource = 'user';
        // query.geojsonSource = 'upload';
        // query.geojsonData = geojson_data_read_from_user
        query.geojsonFile = $('#geom-usergeojson').val();
        query.geojsonField = $('#fields-polygons').val();
    } else if (geom_ext === 'usermpoints' || geom_ext === 'mapmpoints') {
        query.geomExtract = 'points';
        if (geom_ext === 'usermpoints') {
            query.pointsSource = 'user';
            query.pointsFile = $('#geom-usermpoints').val();
        } else {
            if ($('#btn-api-url').is(':visible')) {
                var file = $('#geom-saveCoordList').val().trim();
                if (file === '') {
                    flashMessage('CSV file name to save the list of points is missing', 'error');
                    return false;
                }
                query.pointsSource = 'user';
                query.pointsFile = file;
            } else {
                var coordList = mapmpoints_format_list_points();
                if (coordList.length === 0) {
                    flashMessage('No list of points found', 'error');
                    return false;
                }
                query.pointsSource = 'upload';
                query.pointsList = coordList;
            }
        }
        var padLon = $('#geom-padLon').val();
        padLon = Number(padLon.trim());
        if (isNaN(padLon)) {
            flashMessage('Invalid longitude pad', 'error');
            return false;
        }
        query.padLon = padLon;
        var padLat = $('#geom-padLat').val();
        padLat = Number(padLat.trim());
        if (isNaN(padLat)) {
            flashMessage('Invalid latitude pad', 'error');
            return false;
        }
        query.padLat = padLat;
    } else if (geom_ext === 'rectangle') {
        query.geomExtract = 'rectangle';
        var bbox = rectangle_get_bbox();
        if (bbox === undefined) {
            return false;
        }
        query.minLon = bbox.minlon;
        query.maxLon = bbox.maxlon;
        query.minLat = bbox.minlat;
        query.maxLat = bbox.maxlat;
        query.spatialAvg = $('#spatial-average-over').is(':checked');
    } else {
        query.geomExtract = 'polygons';
        query.shpSource = geom_ext === 'userpolygons' ? 'user' : 'default';
        query.shpFile = $('#geom-polygons').val();
        query.shpField = $('#fields-polygons').val();
        query.allPolygons = $('#select-all-attr-fields').is(':checked');
        if (!query.allPolygons) {
            var sel_added = polygons_get_shp_attr_options('list-shp-attr-fields-2');
            if (sel_added.length === 0) {
                flashMessage('No polygons selected', 'error');
                return false;
            }
            query.shpPolygons = sel_added;
        }
        query.spatialAvg = $('#spatial-average-over').is(':checked');
    }

    query.outFormat = $('#output-format').val();

    return query;
}

function get_baseperiod_query_parameters() {
    var query = new Object();

    var start_y = $('#start-year').val();
    start_y = Number(start_y.trim());
    if (isNaN(start_y)) {
        flashMessage('Invalid start year', 'error');
        return false;
    }
    query.startYear = start_y;

    var end_y = $('#end-year').val();
    end_y = Number(end_y.trim());
    if (isNaN(end_y)) {
        flashMessage('Invalid end year', 'error');
        return false;
    }
    query.endYear = end_y;

    var min_y = $('#min-year').val();
    min_y = Number(min_y.trim());
    if (isNaN(min_y)) {
        flashMessage('Invalid minimum number of years', 'error');
        return false;
    }
    query.minYear = min_y;

    var temp_res = $('#temporal-resolution').val();

    if (temp_res === 'daily') {
        var day_win = $('#days-window').val();
        day_win = Number(day_win.trim());
        if (isNaN(day_win)) {
            flashMessage('Invalid centered days window', 'error');
            return false;
        }
        query.daysWindow = day_win;
    }

    return query;
}

function create_tseries_request_api_url(query, endpoint, from_src) {
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

    // var baseUrl = window.location.origin + '/' + endpoint;
    var baseUrl = window.location.origin + ajaxURLprefix + '/' + endpoint;
    var url = new URL(baseUrl);

    if (!is_grid_extraction(obj)) {
        for (var key in obj) {
            url.searchParams.append(key, obj[key]);
        }
        url = url.toString();
        if (queryString !== undefined) {
            url = url + '&' + queryString;
        }
    } else {
        var seq_dates = [];
        if (obj.temporalRes === 'daily') {
            seq_dates = get_seq_dates_daily(obj.startDate, obj.endDate);
        } else if (obj.temporalRes === 'dekadal') {
            seq_dates = get_seq_dates_dekadal(obj.startDate, obj.endDate);
        } else if (obj.temporalRes === 'monthly') {
            seq_dates = get_seq_dates_monthly(obj.startDate, obj.endDate);
        } else if (obj.temporalRes === 'annual') {
            seq_dates = get_seq_dates_annual(obj.startDate, obj.endDate);
        } else {
            seq_dates = get_seq_dates_seasonal(obj.startDate, obj.endDate,
                obj.seasStart, obj.seasLength);
            delete obj.seasStart;
            if (from_src !== 'analysis') {
                delete obj.seasLength;
            }
        }
        delete obj.startDate;
        delete obj.endDate;
        delete obj.spatialAvg;

        for (var key in obj) {
            url.searchParams.append(key, obj[key]);
        }
        url = url.toString();

        var urls = [];
        for (var i = 0; i < seq_dates.length; i++) {
            var tmp = 'Date=' + seq_dates[i];
            if (queryString !== undefined) {
                tmp = tmp + '&' + queryString;
            }
            urls.push(url + '&' + tmp);
        }
        url = urls;
    }

    return url;
}

function create_tseries_request_api_obj(query, endpoint, from_src) {
    var obj = JSON.parse(JSON.stringify(query));
    if (obj.geomExtract === 'polygons') {
        if (!obj.allPolygons) {
            obj.Poly = obj.shpPolygons;
            delete obj.shpPolygons;
            delete obj.allPolygons;
        }
    }
    var seq_dates = [];
    var gridded = is_grid_extraction(obj);
    if (gridded) {
        if (obj.temporalRes === 'daily') {
            seq_dates = get_seq_dates_daily(obj.startDate, obj.endDate);
        } else if (obj.temporalRes === 'dekadal') {
            seq_dates = get_seq_dates_dekadal(obj.startDate, obj.endDate);
        } else if (obj.temporalRes === 'monthly') {
            seq_dates = get_seq_dates_monthly(obj.startDate, obj.endDate);
        } else if (obj.temporalRes === 'annual') {
            seq_dates = get_seq_dates_annual(obj.startDate, obj.endDate);
        } else {
            seq_dates = get_seq_dates_seasonal(obj.startDate, obj.endDate, obj.seasStart,
                obj.seasLength);
            delete obj.seasStart;
            if (from_src !== 'analysis') {
                delete obj.seasLength;
            }
        }
        delete obj.startDate;
        delete obj.endDate;
        delete obj.spatialAvg;
    }
    // var url = window.location.origin + '/' + endpoint;
    var url = window.location.origin + ajaxURLprefix + '/' + endpoint;

    return {
        'dates': seq_dates,
        'parameters': obj,
        'url': url,
        'from': from_src,
        'gridded': gridded
    }
}