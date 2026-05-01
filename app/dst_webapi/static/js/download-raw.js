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

    ///
    $('#dataset').on('change', () => {
        download_data_setTempres(in_tempres, in_variable);
        download_data_setCalendar();
    });
    $('#dataset').trigger('change');

    $('#temporal-resolution').on('change', () => {
        download_data_setVariable(in_variable);
        download_data_setCalendar();
    });
    $('#temporal-resolution').trigger('change');

    $('#variable').on('change', () => {
        download_data_setCalendar();
    });
    $('#variable').trigger('change');

    $('#extract-support').on('change', () => {
        download_data_setGeom(out_format);
    });
    $('#extract-support').trigger('change');

    ////
    $('#btn-api-url').on('click', function() {
        download_rawdata_api_url();
    });

    ////
    $('#btn-download-data').on('click', function() {
        download_rawdata_web_app();
    });
});

function download_rawdata_api_url() {
    $('#nav-tab-api-url').show();
    $('#div-api-url').empty();
    $('#nav-tab-api-url').get(0).click();

    var query = get_rawdata_query_parameters();
    if (!query) {
        return false;
    }
    var params = create_tseries_request_api_obj(query, 'download_raw_data', 'rawdata');
    var links = create_tseries_request_api_url(query, 'download_raw_data', 'rawdata');

    create_tab_api_request(params, links);
}

function download_rawdata_web_app() {
    var query = get_rawdata_query_parameters();
    if (!query) {
        return false;
    }
    var params = create_tseries_request_api_obj(query, 'download_raw_data', 'rawdata');

    if (!is_grid_extraction(query)) {
        params.parameters.webApp = true;

        var endpoint = create_endpoint_post('download_raw_data');

        $.ajax({
            type: 'POST',
            url: endpoint,
            dataType: 'json',
            data: JSON.stringify(params.parameters),
            contentType: 'application/json',
            success: (json) => {
                if (json.status === 0) {
                    var blob = new Blob([json.data], { type: json.mimetype });
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
    } else {
        $('#nav-tab-down-data').show();
        $('#div-down-data').empty();
        $('#nav-tab-down-data').get(0).click();

        var urls = create_tseries_request_api_url(query, 'download_raw_data', 'rawdata');
        var title = [
            params.parameters.variable,
            params.parameters.temporalRes,
            params.dates[0],
            params.dates[params.dates.length - 1],
            params.parameters.geomExtract
        ];
        title = title.join('_');
        title = `List_${title}.txt`;
        var filenames = params.dates.map((x) => {
            var prfx0 = '';
            var prfx = params.parameters.variable + '_' +
                params.parameters.temporalRes;
            if (params.parameters.geomExtract === 'polygons') {
                var ext = 'zip';
                if ('Poly' in params.parameters) {
                    if (params.parameters.Poly.length === 1) {
                        prfx0 = params.parameters.Poly[0].replace(/\W/gi, '');
                        prfx0 = `${prfx0}_`;
                        if (params.parameters.outFormat === 'netCDF-Format') {
                            ext = 'nc';
                        } else if (params.parameters.outFormat === 'JSON-Format') {
                            ext = 'json';
                        } else {
                            ext = 'csv';
                        }
                    }
                }
            } else {
                var ext;
                if (params.parameters.outFormat === 'netCDF-Format') {
                    ext = 'nc';
                } else if (params.parameters.outFormat === 'JSON-Format') {
                    ext = 'json';
                } else {
                    ext = 'csv';
                }
            }
            return `${prfx0}${prfx}_${x}.${ext}`;
        });
        download_links_list(urls, filenames, title);
    }
}

function get_rawdata_query_parameters() {
    var query = { apiKey: DATA_USERS.api_key };
    var query_d = get_tseries_query_parameters();
    query = Object.assign(query, query_d);
    var query_c = get_common_query_parameters();
    query = Object.assign(query, query_c);

    return query;
}