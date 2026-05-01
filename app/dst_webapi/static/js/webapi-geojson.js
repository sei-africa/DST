function geom_support_usergeojson_select(jsonfiles) {
    var divselect = $('<div>');
    $("<span>").text('Select the JSON file to use').appendTo(divselect);
    var selectGJS = $('<select>')
        .attr('id', 'geom-usergeojson')
        .addClass('form-select')
        .appendTo(divselect);
    for (var m = 0; m < jsonfiles.length; ++m) {
        selectGJS.append(
            $("<option>").text(jsonfiles[m]).val(jsonfiles[m])
        );
    }
    $("<span>").text('Select the field name to use').appendTo(divselect);
    var selectAttrFields = $('<select>')
        .attr('id', 'fields-polygons')
        .addClass('form-select')
        .appendTo(divselect);
    var divbtn = $('<div>').addClass('clearfix').appendTo(divselect);
    var btnDispFields = $("<button>", {
        type: 'button',
        class: 'btn btn-secondary float-end',
        text: ' Display Attributes Table '
    }).css('margin-top', '5px').appendTo(divbtn);

    $("#div-extract-support").append(divselect);

    // 
    selectGJS.on("change", () => {
        $('#nav-tab-shp-attr').hide();
        $('#div-shp-attr').empty();

        removeLayerMarkers1();
        removeLayerPolygons();
        selectAttrFields.empty();
        var jsonfile = selectGJS.val();
        var endpoint = create_endpoint_get('read_usergeojson');
        $.getJSON(endpoint, { 'jsonfile': jsonfile }, (json) => {
            if (json.fields === null) {
                flashMessage(json.message, "error");
                return false;
            }
            json.geojson = JSON.parse(json.geojson);

            for (var s = 0; s < json.fields.length; ++s) {
                selectAttrFields.append(
                    $('<option>').text(json.fields[s]).val(json.fields[s])
                );
            }

            btnDispFields.on('click', function() {
                polygons_display_shp_attr(json);
            });
            geojson_display_onMap(json);
        });
    });
    selectGJS.trigger('change');
}

function geojson_display_onMap(json) {
    var polygons = JSON.parse(JSON.stringify(json.geojson));
    var points = JSON.parse(JSON.stringify(json.geojson));
    polygons.features = polygons.features.filter(x => ['Polygon', 'MultiPolygon'].indexOf(x.geometry.type) != -1);
    points.features = points.features.filter(x => ['Point'].indexOf(x.geometry.type) != -1);
    hasPolygons = polygons.features.length > 0
    hasPoints = points.features.length > 0

    removeControlPolygons();
    MAP_CONTROL_POLYGONS = polygons_display_attrValue('fields-polygons');

    if (hasPolygons) {
        MAP_LAYER_POLYGONS = L.geoJson(polygons, {
            style: polygons_style_selected,
            onEachFeature: geo_polygons_onEachFeature
        }).addTo(MAP_BE);
    }

    if (hasPoints) {
        MAP_LAYER_MARKERS = L.geoJSON(points, {
            onEachFeature: geo_points_onEachFeature
        }).addTo(MAP_BE);
    }

    $('#fields-polygons').on('change', () => {
        // if(hasPolygons) geo_polygons_change_Style_Attributes();
        if (hasPoints) geo_points_changePopup();
    });
}

function geo_points_onEachFeature(feature, layer) {
    var attr = $('#fields-polygons option:selected').val();
    layer.bindPopup(feature.properties[attr]);
}

function geo_points_changePopup() {
    var attr = $('#fields-polygons option:selected').val();

    MAP_LAYER_MARKERS.eachLayer(function(layer) {
        layer.bindPopup(layer.feature.properties[attr]);
    });
}

function geo_polygons_onEachFeature(feature, layer) {
    layer.on({
        mouseover: geo_polygons_highlightFeature,
        mouseout: geo_polygons_resetHighlight
    });
}

function geo_polygons_highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(polygons_style_highlight());
    MAP_CONTROL_POLYGONS.update(layer.feature.properties);
}

function geo_polygons_resetHighlight(e) {
    var layer = e.target;
    layer.setStyle(polygons_style_selected());
    MAP_CONTROL_POLYGONS.update();
}

function geo_polygons_change_Style_Attributes() {
    var attr = $('#fields-polygons option:selected').val();
    MAP_LAYER_POLYGONS.eachLayer(function(layer) {
        // layer.setStyle(polygons_style_default());
        MAP_CONTROL_POLYGONS.update(layer.feature.properties[attr]);
    });
}