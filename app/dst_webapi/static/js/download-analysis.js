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
    var in_tempres = getAllSelectOptions_pgCtl('temporal_resolution');
    var in_variable = getAllSelectOptions_pgCtl('variable');
    var out_format = getAllSelectOptions('output-format');

    /////
    $('#analysis').on('change', () => {
        $('.analysis').empty();
        var analysis = $('#analysis').val();
        if (analysis === 'anomaly') {
            create_anomaly_form(in_tempres, in_variable);
        } else if (analysis === 'spi') {
            // 
        } else {
            // 
        }
    });
    $('#analysis').trigger('change');

    /////
    $('#extract-support').on('change', () => {
        download_data_setGeom(out_format);
    });
    $('#extract-support').trigger('change');

    ////
    $('#btn-api-url').on('click', function() {
        download_analysis_api_url()
    });

    ////
    $('#btn-download-data').on('click', function() {
        download_analysis_web_app();
    });
});

function download_analysis_api_url() {
    $('#nav-tab-api-url').show();
    $('#div-api-url').empty();
    $('#nav-tab-api-url').get(0).click();

    var analysis = $('#analysis').val();
    if (analysis === 'anomaly') {
        var query = get_anomaly_query_parameters();
    } else if (analysis === 'spi') {
        // 
    } else {
        return false;
    }

    if (!query) {
        return false;
    }
    var params = create_tseries_request_api_obj(query, 'download_analysis_data', 'analysis');
    var links = create_tseries_request_api_url(query, 'download_analysis_data', 'analysis');

    create_tab_api_request(params, links);
}

function download_analysis_web_app() {
    var analysis = $('#analysis').val();
    if (analysis === 'anomaly') {
        var query = get_anomaly_query_parameters();
    } else if (analysis === 'spi') {
        // 
    } else {
        return false;
    }

    if (!query) {
        return false;
    }
    var params = create_tseries_request_api_obj(query, 'download_analysis_data', 'analysis');

    if (!is_grid_extraction(query)) {
        params.parameters.webApp = true;

        var endpoint = create_endpoint_post('download_analysis_data');

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

        var urls = create_tseries_request_api_url(query, 'download_analysis_data', 'analysis');
        var title = [
            params.parameters.variable,
            params.parameters.temporalRes,
            params.dates[0],
            params.dates[params.dates.length - 1],
            params.parameters.geomExtract
        ];
        title = title.join('_');
        title = `List_anomaly_${title}.txt`;
        var filenames = params.dates.map((x) => {
            var prfx0 = '';
            var prfx1 = 'anomaly_';
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
            return `${prfx0}${prfx1}${prfx}_${x}.${ext}`;
        });
        download_links_list(urls, filenames, title);
    }
}

function get_anomaly_query_parameters() {
    var query = { apiKey: DATA_USERS.api_key };
    query.analysis = $('#analysis').val();
    query.anomaly = $('#anomaly-type').val();
    var query_d = get_tseries_query_parameters();
    query = Object.assign(query, query_d);
    // if (query.temporalRes === 'seasonal') {
    //     query.seasLength = $('#len-seas-calendar').val();
    // }
    var query_c = get_common_query_parameters();
    query = Object.assign(query, query_c);
    var query_bp = get_baseperiod_query_parameters();
    query = Object.assign(query, query_bp);

    return query
}

function create_anomaly_form(in_tempres, in_variable) {
    var divCont = $('.analysis');
    var div1 = $('<div>').appendTo(divCont);
    $('<span>').appendTo(div1)
        .addClass('title-label')
        .text('Anomaly type');
    var select1 = $('<select>').appendTo(div1)
        .attr('id', 'anomaly-type')
        .addClass('form-select');
    for (var [k, v] of Object.entries(PAGE_CTRL.anomaly_type)) {
        select1.append($("<option>").text(v).val(k));
    }

    var div2 = $('<div>').appendTo(divCont);
    $('<span>').appendTo(div2)
        .addClass('title-label')
        .text('Select Dataset');
    var select2 = $('<select>').appendTo(div2)
        .attr('id', 'dataset')
        .addClass('form-select');
    for (var [k, v] of Object.entries(PAGE_CTRL.dataset)) {
        select2.append($("<option>").text(v).val(k));
    }
    select2.val(PAGE_CTRL.dataset_sel);

    var div3 = $('<div>').appendTo(divCont);
    $('<span>').appendTo(div3)
        .addClass('title-label')
        .text('Temporal Resolution');
    var select3 = $('<select>').appendTo(div3)
        .attr('id', 'temporal-resolution')
        .addClass('form-select');
    for (var [k, v] of Object.entries(PAGE_CTRL.temporal_resolution)) {
        select3.append($("<option>").text(v).val(k));
    }
    select3.val(PAGE_CTRL.temporal_resolution_sel);

    var div4 = $('<div>').appendTo(divCont);
    $('<span>').appendTo(div4)
        .addClass('title-label')
        .text('Select Variable');
    var select4 = $('<select>').appendTo(div4)
        .attr('id', 'variable')
        .addClass('form-select');
    for (var [k, v] of Object.entries(PAGE_CTRL.variable)) {
        select4.append($("<option>").text(v).val(k));
    }
    select4.val(PAGE_CTRL.variable_sel);

    var div5 = $('<div>').appendTo(divCont);
    div5.append(create_select_data_range());

    var div6 = $('<div>').appendTo(divCont);
    div6.append(create_select_base_period());

    // 
    setTimeout(() => {
        select2.on('change', () => {
            download_data_setTempres(in_tempres, in_variable);
            download_data_setCalendar();
            download_data_hideDayWindow();
        });
        select2.trigger('change');

        select3.on('change', () => {
            download_data_setVariable(in_variable);
            download_data_setCalendar();
            download_data_hideDayWindow();
        });
        select3.trigger('change');

        select4.on('change', () => {
            download_data_setCalendar();
        });
        select4.trigger('change');
    }, 50);
}

function create_select_data_range() {
    var divCont = $('<div>')
        .addClass('container');

    var div1 = $('<div>')
        .addClass('row')
        .appendTo(divCont);

    var div1Col1 = $('<div>')
        .addClass('col-md-6')
        .appendTo(div1);
    $('<span>').appendTo(div1Col1)
        .attr('id', 'start-date-text')
        .text('Start Year');
    $('<div>').appendTo(div1Col1)
        .attr('id', 'start-date');

    var div1Col2 = $('<div>')
        .addClass('col-md-6')
        .appendTo(div1);
    $('<span>').appendTo(div1Col2)
        .attr('id', 'end-date-text')
        .text('End Year');
    $('<div>').appendTo(div1Col2)
        .attr('id', 'end-date');

    var div2 = $('<div>')
        .addClass('row')
        .attr('id', 'seasonal-res')
        .appendTo(divCont);

    var div2Col1 = $('<div>')
        .addClass('col-md-6')
        .text('Season Start')
        .appendTo(div2);
    $('<div>').appendTo(div2Col1)
        .attr('id', 'start-season');

    var div2Col2 = $('<div>')
        .addClass('col-md-6')
        .text('Season Length')
        .appendTo(div2);
    $('<div>').appendTo(div2Col2)
        .attr('id', 'length-season');

    $('<p>').appendTo(div2)
        .text('Season: ')
        .css('font-weight', 'bold')
        .append(
            $('<span>')
            .attr('id', 'display-season')
            .text('January -> March')
        );
    return divCont;
}

function create_select_base_period() {
    var divOut = $('<div>');

    // 
    var divHd = $('<div>').appendTo(divOut)
        .addClass('clearfix')
        .css('padding-right', '5px');
    $('<span>').appendTo(divHd)
        .addClass('title-label')
        .text('Base Period');
    var btn_collapse = $('<button>', {
        type: 'button',
        id: 'collapse-base-period',
        class: 'border-0 float-end',
        'data-bs-toggle': 'collapse',
        'data-bs-target': '#div-base-period',
        html: '<i class="bi bi-chevron-down"></i>'
    }).appendTo(divHd);

    $('<hr>').appendTo(divOut)
        .css({
            'margin-bottom': 5,
            'margin-top': 0
        });

    // 
    var divCont = $('<div>').appendTo(divOut)
        .addClass('container collapse')
        .attr('id', 'div-base-period');

    divCont.on('shown.bs.collapse', () => {
        btn_collapse.html('<i class="bi bi-chevron-up"></i>');
    });
    divCont.on('hidden.bs.collapse', () => {
        btn_collapse.html('<i class="bi bi-chevron-down"></i>');
    });

    // 
    var div1 = $('<div>').appendTo(divCont)
        .addClass('row g-1 div-climato-row');
    $('<div>').appendTo(div1)
        .addClass('col-auto d-flex align-items-center justify-content-end')
        .text('Start Year:')
    $('<div>').appendTo(div1)
        .addClass('col-auto')
        .css('margin-right', '30px')
        .append(
            $('<input>', {
                type: 'text',
                id: 'start-year',
                class: 'form-control input-down',
                size: 4,
                value: 1991
            })
        );
    $('<div>').appendTo(div1)
        .addClass('col-auto d-flex align-items-center justify-content-end')
        .text('End Year:')

    $('<div>').appendTo(div1)
        .addClass('col-auto')
        .append(
            $('<input>', {
                type: 'text',
                id: 'end-year',
                class: 'form-control input-down',
                size: 4,
                value: 2020
            })
        );

    var div2 = $('<div>').appendTo(divCont)
        .addClass('row g-1 div-climato-row');
    $('<div>').appendTo(div2)
        .addClass('col-auto d-flex align-items-center justify-content-end')
        .text('Minimum number of years:')
    $('<div>').appendTo(div2)
        .addClass('col-auto')
        .append(
            $('<input>', {
                type: 'text',
                id: 'min-year',
                class: 'form-control input-down',
                size: 3,
                value: 30
            })
        );

    var div3 = $('<div>').appendTo(divCont)
        .addClass('row g-1 div-climato-row')
        .attr('id', 'div-days-window');
    $('<div>').appendTo(div3)
        .addClass('col-auto d-flex align-items-center justify-content-end')
        .text('Centered days window:')
    $('<div>').appendTo(div3)
        .addClass('col-auto')
        .append(
            $('<input>', {
                type: 'text',
                id: 'days-window',
                class: 'form-control input-down',
                size: 2,
                value: 0
            })
        );
    $('<div>').appendTo(div3)
        .addClass('col-auto d-flex align-items-center justify-content-end')
        .append(
            $('<span>').addClass('input-down')
            .text('days (2 * win + 1)')
        );

    return divOut;
}