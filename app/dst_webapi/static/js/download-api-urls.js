function download_links_list(urls, filenames, title) {
    var divDown = $('<div>').css('margin', '5px');

    var divInfo = $('<div>').appendTo(divDown);
    $('<h3>').appendTo(divInfo)
        .text('Download the list of links');
    $('<p>').appendTo(divInfo)
        .text('"wget" and "curl" are free command-line utilities designed for a wide range of operating systems, including Windows, macOS, and Linux, for downloading data. You can download the data using wget and curl.')
    $('<p>').appendTo(divInfo)
        .text('To download multiple data files at once with wget. You can use the following command:');
    $('<code>').appendTo(divInfo)
        .text('wget --content-disposition -i "' + title + '"');

    var divList = $('<div>').appendTo(divDown)
        .css('margin-top', '10px');
    $("<button>", {
        type: 'button',
        class: 'btn btn-primary',
        text: ' Download Links List ',
        click: () => {
            var txt = urls.join('\n');
            var blob = new Blob([txt], { type: 'text/plain' });
            createDownloadableLink(blob, title);
        }
    }).css('margin-left', '10px').appendTo(divList)

    var divCont = $('<div>').appendTo(divList)
        .addClass('container-fluid rounded-3 overflow-auto')
        .css({
            'margin': '5px 10px 0px',
            'height': '42vh',
            'width': '97%',
            'background-color': 'white'
        });
    var ul = $('<ul>').appendTo(divCont);
    for (var i = 0; i < urls.length; i++) {
        var li = $('<li>').appendTo(ul);
        $('<a>', {
            title: 'click to download individual file',
            text: filenames[i],
            href: urls[i]
        }).attr('target', '_blank').appendTo(li);
    }

    $("#div-down-data").append(divDown);
}

function create_tab_api_request(params, links) {
    var divAPI = $('<div>')
        .addClass('container-fluid overflow-auto')
        .css({
            'margin': '5px',
            'height': '73vh'
        });

    var divLink = $('<div>').appendTo(divAPI);
    $('<h3>').appendTo(divLink)
        .text('Downloading data using link');
    var pLink = $('<p>').appendTo(divLink)
        .text('You can download the data by using the link below and integrate it to your code.')

    if (!params.gridded) {
        if (params.parameters.temporalRes === 'seasonal') {
            if (params.from === 'rawdata') {
                var start_t = 'startDate';
                var end_t = 'endDate';
                var seas_t = 'and the request parameters <code>seasStart</code> ' +
                    'and <code>seasLength</code> for different season.';
            } else if (params.from === 'climatology') {
                var start_t = 'startYear';
                var end_t = 'endYear';
                var seas_t = 'and the request parameter ' +
                    '<code>seasLength</code> for different season length.';
            } else if (params.from === 'analysis') {
                var start_t = 'startDate';
                var end_t = 'endDate';
                var seas_t = 'and the request parameters <code>seasStart</code> ' +
                    'and <code>seasLength</code> for different season.';
            } else {
                flashMessage('Unknown download menu.', 'error');
                return false;
            }
            var html_params = ' You can change the request parameters <code>' +
                start_t + '</code> and <code>' +
                end_t + '</code> to get different period, ' + seas_t;
        } else {
            if (params.from === 'rawdata') {
                var start_t = 'startDate';
                var end_t = 'endDate';
            } else if (params.from === 'climatology') {
                var start_t = 'startYear';
                var end_t = 'endYear';
            } else if (params.from === 'analysis') {
                var start_t = 'startDate';
                var end_t = 'endDate';
            } else {
                flashMessage('Unknown download menu.', 'error');
                return false;
            }
            var html_params = ' You can change the request parameters <code>' +
                start_t + '</code> and <code>' +
                end_t + '</code> to get different period.';
        }
        var url = links;
    } else {
        if (params.from === 'rawdata') {
            var html_params = ' You can change the request parameters <code>Date</code> to get different date.';
            var url = links[0];
        } else if (params.from === 'climatology') {
            var html_params = ' ';
            var url = links;
        } else if (params.from === 'analysis') {
            var html_params = ' You can change the request parameters <code>Date</code> to get different date.';
            var url = links[0];
        } else {
            flashMessage('Unknown download menu.', 'error');
            return false;
        }
    }
    html_params += ' You may also change other request parameters according to your query.'
    pLink.append(html_params);
    $('<code>').appendTo(divLink).text(url);

    var divAPICode = $('<div>').appendTo(divAPI);
    $('<h3>').appendTo(divAPICode)
        .text('Integrate to your code');
    $('<p>').appendTo(divAPICode)
        .text('You can also download with API request code by integrating it to your main code. Below are a simple examples using Python and R.')

    $('<h6>').appendTo(divAPICode)
        .text('Python API request code');
    var python_txtarea = $("<textarea>", {
            id: 'python-apicode',
            rows: '10'
        })
        .addClass('form-control')
        .css({
            'color': '#d63384',
            'font-family': 'monospace, monospace',
            'font-size': '0.8em'
        })
        .appendTo(divAPICode);
    var python_code = python_api_request_code(params);
    python_txtarea.val(python_code);

    $('<h6>').appendTo(divAPICode)
        .text('R API request code');
    var r_txtarea = $("<textarea>", {
            id: 'r-apicode',
            rows: '10'
        })
        .addClass('form-control')
        .css({
            'color': '#d63384',
            'font-family': 'monospace, monospace',
            'font-size': '0.8em'
        })
        .appendTo(divAPICode);
    var r_code = r_api_request_code(params);
    // $('#r-apicode').val(r_code);
    r_txtarea.val(r_code);

    $("#div-api-url").append(divAPI);
}

function python_api_request_code(params) {
    var params = JSON.parse(JSON.stringify(params));
    var apiKey = params.parameters.apiKey;
    delete params.parameters.apiKey;

    for (var key in params.parameters) {
        var val = params.parameters[key];
        if (typeof val === 'boolean') {
            val = val.toString();
            val = val.charAt(0).toUpperCase() + val.substr(1).toLowerCase();
            params.parameters[key] = val;
        }
    }

    var c1 = ['import os', 'import requests',
        '\n## outputDir: change to the path to save the downloaded data',
        'outputDir = "/Users/rijaf/Downloads/Data"\n',
        'baseUrl = "' + params.url + '"',
        'headers = {"X-API-Key": "' + apiKey + '"}',
        '## headers = { "Authorization": "Apikey ' + apiKey + '"}',
        'params = ' + JSON.stringify(params.parameters, null, '\t')
    ];
    c1 = c1.join('\n');
    var c3 = [
        'response = requests.get(baseUrl, params=params, headers=headers)',
        'response.raise_for_status()',
        '\n\t########',
        'content_disposition = response.headers.get("Content-Disposition")',
        'filename = content_disposition.split("filename=")[-1].strip(\'"\')',
        'outfile = os.path.join(outputDir, filename)',
        'with open(outfile, "wb") as file:',
        '\tfile.write(response.content)'
    ];
    var c2 = '';
    if (params.dates.length >= 1) {
        c2 = [
            'Dates = ' + JSON.stringify(params.dates),
            'for date in Dates:',
            '\tparams["Date"] = date'
        ];
        c2 = c2.join('\n');
        c3 = c3.map(x => '\t' + x);
    }
    c3 = c3.join('\n');

    return c1 + '\n' + c2 + '\n' + c3 + '\n';
}

function r_api_request_code(params) {
    var params = JSON.parse(JSON.stringify(params));
    var apiKey = params.parameters.apiKey;
    delete params.parameters.apiKey;

    var c1 = ['library(httr)', 'library(jsonlite)',
        '\n## outputDir: change to the path to save the downloaded data',
        'outputDir <- "/Users/rijaf/Downloads/Data"\n',
        'baseUrl <- "' + params.url + '"',
        'headers <- add_headers("X-API-Key" = "' + apiKey + '")',
        '## headers <- add_headers(Authorization = "Apikey ' + apiKey + '")'
    ];
    c1 = c1.join('\n');

    var with_poly = false;
    if ('Poly' in params.parameters) {
        var poly = params.parameters.Poly;
        delete params.parameters.Poly;
        with_poly = true;
    }
    var c2 = [];
    for (var key in params.parameters) {
        var val = params.parameters[key];
        if (typeof val === 'string') {
            var t = '\t' + key + ' = "' + val + '"';
        } else if (typeof val === 'boolean') {
            var t = '\t' + key + ' = ' + val.toString().toUpperCase();
        } else {
            var t = '\t' + key + ' = ' + val;
        }
        c2.push(t);
    }
    c2 = c2.join(',\n');
    if (with_poly) {
        var cp = [];
        for (p of poly) {
            cp.push('\t' + 'Poly = "' + p + '"');
        }
        cp = cp.join(',\n');
        c2 = c2 + ',\n' + cp;
    }
    c2 = 'params <- list(\n' + c2 + '\n)';
    var c4 = [
        '\n\t########',
        'content_type <- headers(res)[["content-type"]]',
        'content_disposition <- headers(res)[["content-disposition"]]',
        'filename <- strsplit(content_disposition, "filename=")[[1]][2]',
        'outfile <- file.path(outputDir, filename)',
        'if(grepl("csv", content_type)){',
        '\twrite.csv(content(res), outfile, row.names = FALSE, na = "")',
        '}else if(grepl("json", content_type)){',
        '\twrite_json(content(res), outfile)',
        '}else{',
        '\twriteBin(content(res), outfile)',
        '}'
    ]
    if (params.dates.length >= 1) {
        var c3 = [
            'Dates <- c(' + params.dates.map(t => '"' + t + '"').join(', ') + ')',
            'for(date in Dates){',
            '\tparams[["Date"]] <- date',
            '\tres <- GET(url = baseUrl, query = params, headers, progress())',
            '\tif (http_error(res)){',
            '\t\tprint(content(res, "text"))',
            '\t\tnext',
            '\t}'
        ];
        c3 = c3.join('\n');
        c4 = c4.map(x => '\t' + x);
        var c5 = '}';
    } else {
        var c3 = 'res <- GET(url = baseUrl, query = params, headers, progress())';
        var c5 = '';
    }
    c4 = c4.join('\n');

    return c1 + '\n' + c2 + '\n' + c3 + '\n' + c4 + '\n' + c5 + '\n';
}