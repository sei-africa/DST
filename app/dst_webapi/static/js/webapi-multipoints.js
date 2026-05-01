function geom_support_usermpoints_select(csvfiles) {
    var divselect = $('<div>');
    $("<span>").text('Select the CSV file to use').appendTo(divselect);
    var select = $('<select>')
        .attr('id', 'geom-usermpoints')
        .addClass('form-select')
        .appendTo(divselect);
    for (var m = 0; m < csvfiles.length; ++m) {
        select.append(
            $("<option>").text(csvfiles[m]).val(csvfiles[m])
        );
    }
    $("#div-extract-support").append(divselect);

    select.on("change", () => {
        removeLayerMarkers();
        var csvfile = $("#geom-usermpoints option:selected").val();
        var endpoint = create_endpoint_get('read_usermpoints');
        $.getJSON(endpoint, { 'csvfile': csvfile }, (json) => {
            if (json.mpts === null) {
                flashMessage(json.message, "error");
                return false;
            }

            $.each(json.mpts, (ix) => {
                var don = json.mpts[ix];
                loc = don[Object.keys(don)[0]];
                lon = don[Object.keys(don)[1]];
                lat = don[Object.keys(don)[2]];

                var marker = L.marker([lat, lon]).bindPopup(loc).addTo(MAP_BE);
                MARKERS_BE.push(marker);
            });
        });
    });
    select.trigger("change");

    //////
    var divPad = $('<div>').css('margin-top', '5px')
        .addClass('border-top border-secondary');
    $("<p>").appendTo(divPad).css('margin-bottom', '5px')
        .text('Spatially average neighboring grid points (Padding)');
    $("<p>").appendTo(divPad)
        .css({ 'font-style': 'italic', 'margin-bottom': '0px' })
        .text('Number of grid points from the point coordinate for');

    var divCrdPad = $('<div>').appendTo(divPad).addClass('container-md');
    var divRowP = $('<div>').appendTo(divCrdPad).addClass('row g-1')
        .css({ 'padding-top': '0px', 'padding-bottom': '0px' });

    var divColP1 = $('<div>').appendTo(divRowP)
        .addClass('col-md-3 d-flex align-items-center justify-content-end');
    var divColP2 = $('<div>').appendTo(divRowP).addClass('col-md-2');
    var divColP3 = $('<div>').appendTo(divRowP)
        .addClass('col-md-3 d-flex align-items-center justify-content-end');
    var divColP4 = $('<div>').appendTo(divRowP).addClass('col-md-2');

    $("<span>").text('Longitude:').appendTo(divColP1);
    $("<input>", { type: 'text', id: 'geom-padLon' }).appendTo(divColP2)
        .addClass('form-control input-down').attr('size', 4).val(0);
    $("<span>").text('Latitude:').appendTo(divColP3);
    $("<input>", { type: 'text', id: 'geom-padLat' }).appendTo(divColP4)
        .addClass('form-control input-down').attr('size', 4).val(0);

    $("#div-extract-support").append(divPad);
}

function geom_support_mapmpoints_select() {
    var divInputCont = $('<div>').addClass('container-md')
        .css({ 'margin': '0px', 'padding': '0px' });

    var divRow1 = $('<div>').appendTo(divInputCont)
        .addClass('row g-1').css({ 'margin': '0px', 'padding': '0px' });
    var divCol1a = $('<div>').addClass('col-md-4 d-flex align-items-end').appendTo(divRow1);
    var divCol2a = $('<div>').addClass('col-md-4 d-flex align-items-end').appendTo(divRow1);
    var divCol3a = $('<div>').addClass('col-md-4 btn-group-vertical').appendTo(divRow1);

    $("<span>").text('Longitude:').appendTo(divCol1a);
    $("<span>").text('Latitude:').appendTo(divCol2a);
    $("<button>", {
        type: 'button',
        class: 'btn btn-secondary btn-sm',
        text: ' Display New ',
        click: mapmpoints_display_point
    }).appendTo(divCol3a);

    var divRow2 = $('<div>').appendTo(divInputCont)
        .addClass('row g-1').css({ 'margin': '0px', 'padding': '0px' });
    var divCol1b = $('<div>').addClass('col-md-4').appendTo(divRow2);
    var divCol2b = $('<div>').addClass('col-md-4').appendTo(divRow2);
    var divCol3b = $('<div>').addClass('col-md-3 btn-group-vertical').appendTo(divRow2);

    $("<input>", { type: 'text', id: 'geom-mapLon' })
        .addClass('form-control').appendTo(divCol1b);
    $("<input>", { type: 'text', id: 'geom-mapLat' })
        .addClass('form-control').appendTo(divCol2b);
    $("<button>", {
        type: 'button',
        class: 'btn btn-secondary btn-sm',
        text: ' Add Point ',
        click: mapmpoints_add_point
    }).appendTo(divCol3b);
    $("<input>").attr({
        type: 'hidden',
        id: 'geom-mapIDLoc',
    }).appendTo(divRow2);

    // 
    var divList = $('<div>').addClass('container-md')
        .css({ 'margin': '0px', 'padding': '0px' });

    var divRowL = $('<div>').appendTo(divList)
        .addClass('row g-1 align-items-center justify-content-center')
        .css({ 'margin': '0px', 'padding': '0px' });

    var divCol1L = $('<div>').addClass('col-md-8').appendTo(divRowL);
    var divCol2L = $('<div>').addClass('col-md-4').appendTo(divRowL);

    $("<textarea>", { id: 'geom-mapCoordList', rows: '5' })
        .addClass('form-control').appendTo(divCol1L);

    $("<button>", {
        type: 'button',
        class: 'btn btn-secondary',
        text: ' Update ',
        click: mapmpoints_update_map
    }).appendTo(divCol2L);

    // 
    var savePoints = DATA_USERS.extract.includes('usermpoints');
    if (savePoints) {
        var divSave = $('<div>').addClass('container-md')
            .css({ 'margin': '0px', 'padding': '0px' });

        var divRowS = $('<div>').appendTo(divSave)
            // .addClass('row g-1 align-items-center justify-content-center')
            .addClass('row g-1')
            .css({ 'margin': '0px', 'padding': '0px' });

        var divCol1S = $('<div>').addClass('col-md-4').appendTo(divRowS);
        var divCol2S = $('<div>').addClass('col-md-6').appendTo(divRowS);
        var divCol3S = $('<div>').addClass('col-md-2').appendTo(divRowS);

        $("<span>").text('Add list of points to your profile').appendTo(divCol1S);
        $("<input>", {
                type: 'text',
                id: 'geom-saveCoordList',
                placeholder: 'name_list_of_points.csv'
            })
            .addClass('form-control').appendTo(divCol2S);
        var btnsave = $("<button>", {
            type: 'button',
            id: 'geom-mapCoordSave',
            class: 'btn btn-secondary',
            text: ' Save ',
            click: mapmpoints_save_coords_list
        }).appendTo(divCol3S);
        var btnspinner = $("<span>")
            .addClass('spinner-border spinner-border-sm')
            .attr({
                'role': 'status',
                'aria-hidden': 'true'
            }).css('display', 'none');
        btnsave.prepend(btnspinner);
    }

    //
    var divPad = $('<div>').css('margin-top', '5px')
        .addClass('border-top border-secondary');
    $("<p>").appendTo(divPad).css('margin-bottom', '5px')
        .text('Spatially average neighboring grid points (Padding)');
    $("<p>").appendTo(divPad)
        .css({ 'font-style': 'italic', 'margin-bottom': '0px' })
        .text('Number of grid points from the point coordinate for');

    var divCrdPad = $('<div>').appendTo(divPad).addClass('container-md');
    var divRowP = $('<div>').appendTo(divCrdPad).addClass('row g-1')
        .css({ 'padding-top': '0px', 'padding-bottom': '0px' });

    var divColP1 = $('<div>').appendTo(divRowP)
        .addClass('col-md-3 d-flex align-items-center justify-content-end');
    var divColP2 = $('<div>').appendTo(divRowP).addClass('col-md-2');
    var divColP3 = $('<div>').appendTo(divRowP)
        .addClass('col-md-3 d-flex align-items-center justify-content-end');
    var divColP4 = $('<div>').appendTo(divRowP).addClass('col-md-2');

    $("<span>").text('Longitude:').appendTo(divColP1);
    $("<input>", { type: 'text', id: 'geom-padLon' }).appendTo(divColP2)
        .addClass('form-control input-down').attr('size', 4).val(0);
    $("<span>").text('Latitude:').appendTo(divColP3);
    $("<input>", { type: 'text', id: 'geom-padLat' }).appendTo(divColP4)
        .addClass('form-control input-down').attr('size', 4).val(0);

    //
    $("#div-extract-support").append(divInputCont);
    $("#div-extract-support").append(divList);
    if (savePoints) {
        $("#div-extract-support").append(divSave);
    }
    $("#div-extract-support").append(divPad);
}

function mapmpoints_save_coords_list() {
    var csvfile = $("#geom-saveCoordList").val();
    csvfile = csvfile.trim();
    if (csvfile === '') {
        flashMessage("Provide a CSV file name to save the list of points", "error");
        return false;
    }

    var coordList = mapmpoints_get_list_points();
    if (coordList.length === 0) {
        flashMessage("No list of points to save", "warning");
        return false;
    }

    var data = {
        'points': coordList,
        'file': csvfile
    }

    var endpoint = create_endpoint_post('save_usermpoints');

    $.ajax({
        type: 'POST',
        url: endpoint,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
        success: (json) => {
            flashMessage(json.message, json.status);
            if (json.status === 'error') {
                return false;
            }
            $('#btn-api-url').show();
        },
        beforeSend: () => {
            $("#geom-mapCoordSave .spinner-border").show();
        },
        error: (xhr, s, e) => {
            displayAjaxError(xhr, s, e);
        }
    }).always(() => {
        $("#geom-mapCoordSave .spinner-border").hide();
    });
}

function mapmpoints_update_map() {
    (function(next) {
        var coordList = mapmpoints_get_list_points();
        removeLayerMarkers();
        MAP_BE.off('click');

        for (var j = 0; j < coordList.length; ++j) {
            var this_coord = coordList[j];
            var lon = Number(this_coord[1]);
            var lat = Number(this_coord[2]);
            var id_loc = this_coord[0];
            var marker = L.marker([lat, lon], {
                nameID: id_loc
            }).bindPopup(id_loc).addTo(MAP_BE);
            MARKERS_BE.push(marker);
        }
    }(function() {
        MAP_BE.on('click', mapmpoints_click_point);
    }));
}

function mapmpoints_click_point(e) {
    var active = MARKERS_BE.map(x => x._icon.style.filter).indexOf('hue-rotate(120deg)');
    if (active === -1) {
        var pos = e.latlng;
        $("#geom-mapLat").val(pos.lat.toFixed(6));
        $("#geom-mapLon").val(pos.lng.toFixed(6));
        mapmpoints_set_point(pos.lng, pos.lat);
    }
}

function mapmpoints_display_point() {
    var lon = mapmpoints_check_input("geom-mapLon", "longitude");
    if (isNaN(lon)) {
        return false;
    }
    var lat = mapmpoints_check_input("geom-mapLat", "latitude");
    if (isNaN(lat)) {
        return false;
    }
    mapmpoints_set_point(lon, lat);
    return true;
}

function mapmpoints_set_point(lon, lat) {
    var nb_loc = MARKERS_BE.length + 1;
    var id_loc = "Point_" + nb_loc;
    var marker = L.marker([lat, lon], {
            nameID: id_loc,
            draggable: true,
            autoPan: true
        })
        .bindPopup(id_loc).addTo(MAP_BE);
    marker._icon.style.filter = "hue-rotate(120deg)";
    marker.on('move', function(e) {
        var pos = e.target.getLatLng();
        $("#geom-mapLat").val(pos.lat.toFixed(6));
        $("#geom-mapLon").val(pos.lng.toFixed(6));
    });

    MARKERS_BE.push(marker);
    $("#geom-mapIDLoc").val(id_loc);

    $("#geom-mapLon, #geom-mapLat").blur(function() {
        var active = MARKERS_BE.map(x => x._icon.style.filter).indexOf('hue-rotate(120deg)');
        if (active !== -1) {
            var marker = MARKERS_BE[active];
            mapmpoints_set_latlng(marker);
        }
    });
}

function mapmpoints_set_latlng(marker) {
    var lon = mapmpoints_check_input("geom-mapLon", "longitude");
    if (isNaN(lon)) {
        return false;
    }
    var lat = mapmpoints_check_input("geom-mapLat", "latitude");
    if (isNaN(lat)) {
        return false;
    }
    var latlng = new L.LatLng(lat, lon);
    marker.setLatLng(latlng);
}

function mapmpoints_check_input(idInput, coord) {
    var crd = $("#" + idInput).val();
    crd = crd.trim();
    if (crd === "") {
        flashMessage("Put a correct " + coord + " value", "error");
        return NaN;
    }
    crd = Number(crd);
    if (isNaN(crd)) {
        flashMessage("Invalid " + coord + " value", "error");
        return NaN;
    }
    return crd;
}

function mapmpoints_add_point() {
    if ($("#geom-mapIDLoc").val() === '') {
        var ret = mapmpoints_display_point();
        if (!ret) {
            $("#geom-mapIDLoc").val('');
            return false;
        }
    }
    setTimeout(function() {
        var id_loc = $("#geom-mapIDLoc").val();
        var ix = MARKERS_BE.map(x => x.options.nameID).indexOf(id_loc);
        if (ix === -1) {
            flashMessage("Location ID" + id_loc + "not found.", "error");
            return false;
        }

        var marker = MARKERS_BE[ix];
        var pos_loc = marker.getLatLng();
        marker._icon.style.filter = "hue-rotate(0deg)";
        marker.dragging.disable();
        $("#geom-mapIDLoc").val('');
        var lon = pos_loc.lng.toFixed(6);
        var lat = pos_loc.lat.toFixed(6);
        var currentPoint = [id_loc, lon, lat];

        //
        var coordList = mapmpoints_get_list_points();
        coordList.push(currentPoint);
        mapmpoints_set_list_points(coordList);
    }, 100);
}

function mapmpoints_set_list_points(coordList) {
    var coords = '';
    for (var j = 0; j < coordList.length; ++j) {
        var this_coord = coordList[j].join(',') + '\n';
        coords = coords + this_coord;
    }
    $("#geom-mapCoordList").val(coords);
}

function mapmpoints_get_list_points() {
    var currentList = $("#geom-mapCoordList").val();
    var coordList = currentList.split('\n');
    coordList = coordList.map(x => x.trim());
    coordList = coordList.filter(x => x !== '');
    if (coordList.length === 0) {
        return coordList;
    }
    coordList = coordList.map(x => x.split(','));
    return coordList;
}

function mapmpoints_format_list_points() {
    var coordList = mapmpoints_get_list_points();
    if (coordList.length === 0) {
        return coordList;
    }
    coordList = coordList.map((x) => {
        var obj = new Object();
        obj.loc = x[0];
        obj.lon = Number(x[1]);
        obj.lat = Number(x[2]);
        return obj;
    });

    return coordList;
}