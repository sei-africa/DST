function geom_support_rectangle_select() {
    var divInputCont = $('<div>').addClass('container-md')
        .css({ 'margin': '0px', 'padding': '0px' });
    var divRow = $('<div>').appendTo(divInputCont)
        .addClass('row g-1 align-items-center justify-content-center')
        .css({ 'margin': '0px', 'padding': '0px' });
    var divCol1 = $('<div>').addClass('col-md-10').appendTo(divRow);
    var divCol2 = $('<div>').addClass('col-md-2').appendTo(divRow);

    // 
    var divRow1 = $('<div>').appendTo(divCol1)
        .addClass('row g-1').css({ 'margin': '0px', 'padding': '0px' });
    var divCol1a = $('<div>').addClass('col-md-3 d-flex align-items-center justify-content-end').appendTo(divRow1);
    var divCol2a = $('<div>').addClass('col-md-4 d-flex align-items-start').appendTo(divRow1);
    var divCol3a = $('<div>').addClass('col-md-4 d-flex align-items-start').appendTo(divRow1);

    $("<span>").text('Longitude:').appendTo(divCol2a);
    $("<span>").text('Latitude:').appendTo(divCol3a);

    var divRow2 = $('<div>').appendTo(divCol1)
        .addClass('row g-1').css({ 'margin': '0px', 'padding': '0px' });
    var divCol1b = $('<div>').addClass('col-md-3 d-flex align-items-center justify-content-end').appendTo(divRow2);
    var divCol2b = $('<div>').addClass('col-md-4 d-flex align-items-start').appendTo(divRow2);
    var divCol3b = $('<div>').addClass('col-md-4 d-flex align-items-start').appendTo(divRow2);

    $("<span>").text('Minimum:').appendTo(divCol1b);
    $("<input>", { type: 'text', id: 'geom-bbox-minlon' })
        .addClass('form-control').appendTo(divCol2b);
    $("<input>", { type: 'text', id: 'geom-bbox-minlat' })
        .addClass('form-control').appendTo(divCol3b);

    var divRow3 = $('<div>').appendTo(divCol1)
        .addClass('row g-1').css({ 'margin': '0px', 'padding': '0px' });
    var divCol1c = $('<div>').addClass('col-md-3 d-flex align-items-center justify-content-end').appendTo(divRow3);
    var divCol2c = $('<div>').addClass('col-md-4 d-flex align-items-start').appendTo(divRow3);
    var divCol3c = $('<div>').addClass('col-md-4 d-flex align-items-start').appendTo(divRow3);

    $("<span>").text('Maximum:').appendTo(divCol1c);
    $("<input>", { type: 'text', id: 'geom-bbox-maxlon' })
        .addClass('form-control').appendTo(divCol2c);
    $("<input>", { type: 'text', id: 'geom-bbox-maxlat' })
        .addClass('form-control').appendTo(divCol3c);

    // 
    $("<button>", {
            type: 'button',
            class: 'btn btn-secondary',
            text: ' Draw New ',
            click: rectangle_display_onMap
        }).appendTo(divCol2)
        .css('margin-bottom', '5px');
    $("<button>", {
        type: 'button',
        class: 'btn btn-secondary',
        text: ' Clear ',
        click: rectangle_clear_onMap
    }).appendTo(divCol2);

    $("#div-extract-support").append(divInputCont);

    //////
    var divSpAvg = $('<div>')
        .addClass('form-check')
        .css('margin-top', '10px');
    $("<input>", {
        type: 'checkbox',
        class: 'form-check-input',
        id: 'spatial-average-over'
    }).appendTo(divSpAvg);
    $('<label>').addClass('form-check-label')
        .attr('for', 'spatial-average-over')
        .html('Spatially average over the rectangle')
        .appendTo(divSpAvg);

    $("#div-extract-support").append(divSpAvg);
}

function rectangle_clear_onMap() {
    $("#geom-bbox-minlon, #geom-bbox-maxlon, #geom-bbox-minlat, #geom-bbox-maxlat").off('blur');
    removeLayerRectangleBox();
    $("#geom-bbox-minlat").val('');
    $("#geom-bbox-maxlat").val('');
    $("#geom-bbox-minlon").val('');
    $("#geom-bbox-maxlon").val('');
}

function rectangle_draw_onMap(e) {
    if (RECTANGLE_BOX !== undefined) {
        return false;
    }

    var lon0 = e.latlng.lng;
    var lat0 = e.latlng.lat;
    (function(next) {
        rectangle_set_bbox(lon0, lon0, lat0, lat0);
        next()
    }(function() {
        MAP_BE.on('mousemove', function(m) {
            MAP_BE.dragging.disable();

            var lon1 = m.latlng.lng;
            var lat1 = m.latlng.lat;

            (function(next) {
                var minlon = lon0;
                var maxlon = lon1;
                if (lon1 > lon0) {
                    minlon = lon0;
                    maxlon = lon1;
                } else {
                    minlon = lon1;
                    maxlon = lon0;
                }

                var minlat = lat0;
                var maxlat = lat1;
                if (lat1 > lat0) {
                    minlat = lat0;
                    maxlat = lat1;
                } else {
                    minlat = lat1;
                    maxlat = lat0;
                }

                rectangle_set_bbox(minlon, maxlon, minlat, maxlat);
                next()
            }(function() {
                var bounds = rectangle_set_bounds();
                removeLayerRectangleBox();
                rectangle_draw_init(bounds);
            }));
        });

        MAP_BE.on('mouseup', function() {
            MAP_BE.removeEventListener('mousemove');
            MAP_BE.dragging.enable();
        });
    }));
}

function rectangle_display_onMap() {
    if (RECTANGLE_BOX !== undefined) {
        return false;
    }
    var bounds = rectangle_set_bounds();
    if (bounds.length === 0) {
        return false;
    }
    rectangle_draw_init(bounds);
    return true;
}

function rectangle_draw_init(bounds) {
    (function(next) {
        RECTANGLE_BOX = L.rectangle(bounds, {
            color: 'red',
            fill: false,
            weight: 4,
            className: 'box-rectangle'
        }).addTo(MAP_BE);
        next()
    }(function() {
        rectangle_blur_bbox();
        rectangle_resize_bbox();
    }));
}

function rectangle_blur_bbox() {
    if (RECTANGLE_BOX === undefined) {
        return false;
    }
    var all_bnds = $("#geom-bbox-minlon, #geom-bbox-maxlon, #geom-bbox-minlat, #geom-bbox-maxlat");
    all_bnds.blur(function() {
        var bounds = rectangle_set_bounds();
        if (bounds.length === 0) {
            return false;
        }
        RECTANGLE_BOX.setBounds(bounds);
    });
    return true;
}

function rectangle_resize_bbox() {
    if (RECTANGLE_BOX === undefined) {
        return false;
    }

    RECTANGLE_BOX.on('mouseover', function() {
        $('.box-rectangle').css('cursor', 'crosshair')
    });
    RECTANGLE_BOX.on('mouseout', function() {
        $('.box-rectangle').css('cursor', '')
    });

    RECTANGLE_BOX.on({
        mousedown: function(m) {
            var r = rectangle_check_side(m);
            MAP_BE.on('mousemove', function(e) {
                MAP_BE.dragging.disable();
                rectangle_draw_bounds(e, m, r);
            });
        }
    });

    MAP_BE.on('mouseup', function(e) {
        MAP_BE.removeEventListener('mousemove');
        MAP_BE.dragging.enable();
    });
}

function rectangle_draw_bounds(e, m, r) {
    if (r === 'o') {
        return false;
    }

    (function(next) {
        var p = e.latlng;
        var b = m.target._bounds;
        var mnlo = b._southWest.lng;
        var mxlo = b._northEast.lng;
        var mnla = b._southWest.lat;
        var mxla = b._northEast.lat;

        if (r === 'n') {
            mxla = p.lat;
        } else if (r === 's') {
            mnla = p.lat;
        } else if (r === 'w') {
            mnlo = p.lng;
        } else if (r === 'e') {
            mxlo = p.lng;
        } else if (r === 'nw') {
            mxla = p.lat;
            mnlo = p.lng;
        } else if (r === 'ne') {
            mxla = p.lat;
            mxlo = p.lng;
        } else if (r === 'sw') {
            mnla = p.lat;
            mnlo = p.lng;
        } else if (r === 'se') {
            mnla = p.lat;
            mxlo = p.lng;
        } else {
            // do nothing
        }
        rectangle_set_bbox(mnlo, mxlo, mnla, mxla);
        next()
    }(function() {
        var bounds = rectangle_set_bounds();
        if (bounds.length === 0) {
            return false;
        }
        RECTANGLE_BOX.setBounds(bounds);
    }));
}

function rectangle_check_side(m) {
    var rX1 = m.target._bounds._southWest.lng;
    var rY1 = m.target._bounds._northEast.lat;
    var rX2 = m.target._bounds._northEast.lng;
    var rY2 = m.target._bounds._southWest.lat;
    var cX = m.latlng.lng;
    var cY = m.latlng.lat;

    var z = m.target._map.getZoom();
    var eps = Math.exp(-0.7492 * z + 1.4135);

    var bnw = Math.abs(cX - rX1) <= eps && Math.abs(cY - rY1) <= eps;
    var bne = Math.abs(cX - rX2) <= eps && Math.abs(cY - rY1) <= eps;
    var bsw = Math.abs(cX - rX1) <= eps && Math.abs(cY - rY2) <= eps;
    var bse = Math.abs(cX - rX2) <= eps && Math.abs(cY - rY2) <= eps;

    if (cX < rX1 + eps && cY < rY1 + eps && bnw) {
        return 'nw';
    } else if (cX > rX2 - eps && cY < rY1 + eps && bne) {
        return 'ne';
    } else if (cX < rX1 + eps && cY > rY2 - eps && bsw) {
        return 'sw';
    } else if (cX > rX2 - eps && cY > rY2 - eps && bse) {
        return 'se';
    } else if (cY >= rY1 - eps && cY <= rY1 + eps) {
        return 'n';
    } else if (cY >= rY2 - eps && cY <= rY2 + eps) {
        return 's';
    } else if (cX >= rX1 - eps && cX <= rX1 + eps) {
        return 'w';
    } else if (cX >= rX2 - eps && cX <= rX2 + eps) {
        return 'e';
    } else {
        return 'o';
    }
}

function rectangle_set_bounds() {
    var bounds = [];
    var bbox = rectangle_get_bbox();
    if (bbox !== undefined) {
        bounds = [
            [bbox.maxlat, bbox.minlon],
            [bbox.minlat, bbox.maxlon]
        ];
    }
    return bounds;
}

function rectangle_check_input(idInput, coord, limit) {
    var crd = $("#" + idInput).val();
    crd = crd.trim();
    if (crd === "") {
        flashMessage("Put a correct " + limit + " " + coord + " value", "error");
        return NaN;
    }
    crd = Number(crd);
    if (isNaN(crd)) {
        flashMessage("Invalid " + limit + " " + coord + " value", "error");
        return NaN;
    }
    return crd;
}

function rectangle_set_bbox(minlon, maxlon, minlat, maxlat) {
    $("#geom-bbox-minlat").val(minlat.toFixed(6));
    $("#geom-bbox-maxlat").val(maxlat.toFixed(6));
    $("#geom-bbox-minlon").val(minlon.toFixed(6));
    $("#geom-bbox-maxlon").val(maxlon.toFixed(6));
}

function rectangle_get_bbox() {
    var bbox;
    var minlon = rectangle_check_input('geom-bbox-minlon', 'longitude', 'minimum');
    if (isNaN(minlon)) {
        return bbox;
    }
    var maxlon = rectangle_check_input('geom-bbox-maxlon', 'longitude', 'maximum');
    if (isNaN(maxlon)) {
        return bbox;
    }
    var minlat = rectangle_check_input('geom-bbox-minlat', 'latitude', 'minimum');
    if (isNaN(minlat)) {
        return bbox;
    }
    var maxlat = rectangle_check_input('geom-bbox-maxlat', 'latitude', 'maximum');
    if (isNaN(maxlat)) {
        return bbox;
    }

    return { 'minlon': minlon, 'maxlon': maxlon, 'minlat': minlat, 'maxlat': maxlat };
}