function geom_support_polygons_select(shpfiles, endpoint) {
    var divselect = $('<div>');
    $("<span>").text('Select shapefile').appendTo(divselect);
    var selectSHP = $('<select>')
        .attr('id', 'geom-polygons')
        .addClass('form-select')
        .appendTo(divselect);
    for (var s = 0; s < shpfiles.length; ++s) {
        selectSHP.append(
            $("<option>").text(shpfiles[s]).val(shpfiles[s])
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
    selectSHP.on("change", () => {
        $('#nav-tab-shp-attr').hide();
        $('#div-shp-attr').empty();

        removeLayerPolygons();
        selectAttrFields.empty();
        var shpfile = selectSHP.val();

        $.getJSON(endpoint, { 'shpfile': shpfile }, (json) => {
            if (json.status === -1) {
                flashMessage(json.message, 'error');
                return false;
            }
            json.geojson = JSON.parse(json.geojson);
            // 
            for (var s = 0; s < json.fields.length; ++s) {
                selectAttrFields.append(
                    $('<option>').text(json.fields[s]).val(json.fields[s])
                );
            }
            // 
            btnDispFields.on('click', function() {
                polygons_display_shp_attr(json);
            });
            // 
            selectAttrFields.on('change', () => {
                selectFieldValues.empty();
                var attr_f = selectAttrFields.val();
                var attr_l = json.geojson.features.map(x => x.properties[attr_f]);
                attr_l = attr_l.filter((item, pos, self) => self.indexOf(item) == pos);

                for (var s = 0; s < attr_l.length; ++s) {
                    selectFieldValues.append(
                        $('<option>').text(attr_l[s]).val(attr_l[s])
                    );
                }
            });
            selectAttrFields.trigger('change');

            // display shp on map
            polygons_display_onMap(json.geojson);
        });
    });
    selectSHP.trigger('change');

    //////
    var divList = $('<div>').addClass('container-md')
        .css({ 'margin': '0px', 'padding': '0px' });
    var divRow = $('<div>').appendTo(divList)
        .addClass('row g-1').css({ 'margin': '0px', 'padding': '0px' });
    var divCol1 = $('<div>').addClass('col-md-5').appendTo(divRow);
    var divCol2 = $('<div>').addClass('col-md-2 d-flex flex-column justify-content-center').appendTo(divRow);
    var divCol3 = $('<div>').addClass('col-md-5').appendTo(divRow);

    var selectFieldValues = $('<select>').appendTo(divCol1);
    selectFieldValues.attr("multiple", "multiple");
    selectFieldValues.attr("id", "list-shp-attr-fields-1");
    selectFieldValues.attr("size", 8);
    selectFieldValues.addClass('form-control');

    var divbt0 = $('<div>').appendTo(divCol2)
        .addClass('row d-flex align-items-center justify-content-center');
    var divbt1 = $('<div>').addClass('row').appendTo(divbt0);
    var divbt2 = $('<div>').addClass('row').appendTo(divbt0);

    $("<button>", {
        type: 'button',
        class: 'btn btn-outline-secondary',
        id: 'btn-shp-attr-fields-1',
        text: ' >> ',
        click: polygons_add_shp_attr_values
    }).appendTo(divbt1);
    $("<button>", {
        type: 'button',
        class: 'btn btn-outline-secondary',
        id: 'btn-shp-attr-fields-2',
        text: ' << ',
        click: polygons_remove_shp_attr_values
    }).appendTo(divbt2);

    var selectedValues = $('<select>').appendTo(divCol3);
    selectedValues.attr("multiple", "multiple");
    selectedValues.attr("id", "list-shp-attr-fields-2");
    selectedValues.attr("size", 8);
    selectedValues.addClass('form-control');

    $("#div-extract-support").append(divList);

    //////
    var divSelAll = $('<div>')
        .addClass('form-check')
        .css({
            'margin-top': '5px',
            'margin-bottom': '5px'
        });
    $("<input>", {
        type: 'checkbox',
        class: 'form-check-input',
        id: 'select-all-attr-fields'
    }).appendTo(divSelAll);
    $('<label>').addClass('form-check-label')
        .attr('for', 'select-all-attr-fields')
        .html('Select all polygons')
        .appendTo(divSelAll);

    $("#div-extract-support").append(divSelAll);

    //////
    var divSpAvg = $('<div>').addClass('form-check');
    $("<input>", {
        type: 'checkbox',
        class: 'form-check-input',
        id: 'spatial-average-over'
    }).appendTo(divSpAvg);
    $('<label>').addClass('form-check-label')
        .attr('for', 'spatial-average-over')
        .html('Spatially average over the polygons')
        .appendTo(divSpAvg);

    $("#div-extract-support").append(divSpAvg);
}

function polygons_display_shp_attr(json) {
    $('#nav-tab-shp-attr').show();
    $('#div-shp-attr').empty();
    $('#nav-tab-shp-attr').get(0).click();

    var table = $('<table>')
        .addClass('table table-bordered table-hover table-striped');
    table.attr('id', 'shp-attr-fields-table');
    $('#div-shp-attr').append(table);
    var thead = $('<thead>').appendTo(table);
    var row = $('<tr>').appendTo(thead);
    for (var i = 0; i < json.fields.length; i++) {
        row.append($('<th>').text(json.fields[i]));
    }
    var tbody = $('<tbody>').appendTo(table);
    $.each(json.geojson.features, function() {
        var row = $('<tr>').appendTo(tbody);
        $.each(this.properties, function(index, value) {
            var col = $('<td>').text(value);
            row.last().append(col);
        });
    });
}

function polygons_display_onMap(geojson) {
    MAP_BE.off('click');
    removeControlPolygons();
    MAP_CONTROL_POLYGONS = polygons_display_attrValue('fields-polygons');

    // display polygons
    var layerPolygons = L.geoJson(geojson, {
        style: polygons_style_default,
        onEachFeature: polygons_onEachFeature
    }).addTo(MAP_BE);

    MAP_LAYER_POLYGONS = layerPolygons;

    $('#fields-polygons').on('change', () => {
        polygons_clear_selected_attr();
    });
}

function polygons_checkExistsLayers(feature) {
    var result = false;
    var attr_name = polygons_get_attribute_name(feature.properties, 'fields-polygons');
    if (attr_name === null) {
        return result;
    }
    //
    var attr_added = polygons_get_shp_attr_options('list-shp-attr-fields-2');
    if (attr_added.length === 0) {
        return result;
    }
    for (var i = 0; i < attr_added.length; i++) {
        if (attr_added[i] == attr_name) {
            result = true;
            break;
        }
    };
    return result;
}

function polygons_get_layers_keys(layer, value, selectID) {
    var field = $('#' + selectID + ' option:selected').val();
    var all_layers = layer._map._layers;
    var key_layers = [];
    for (var key in all_layers) {
        if (all_layers.hasOwnProperty(key)) {
            if (all_layers[key].hasOwnProperty('feature')) {
                if (all_layers[key].feature.properties[field] === value) {
                    key_layers.push(key);
                }
            }
        }
    }

    return key_layers;
}

function polygons_highlightFeature(e) {
    var layer = e.target;
    var value = polygons_get_attribute_name(layer.feature.properties, 'fields-polygons');
    var key_layers = polygons_get_layers_keys(layer, value, 'fields-polygons');

    if (key_layers.length > 1) {
        for (var key of key_layers) {
            layer._map._layers[key].setStyle(polygons_style_highlight());
        }
    } else {
        layer.setStyle(polygons_style_highlight());
    }

    MAP_CONTROL_POLYGONS.update(layer.feature.properties);
}

function polygons_resetHighlight(e) {
    var layer = e.target;
    var value = polygons_get_attribute_name(layer.feature.properties, 'fields-polygons');
    var key_layers = polygons_get_layers_keys(layer, value, 'fields-polygons');

    if (polygons_checkExistsLayers(layer.feature)) {
        if (key_layers.length > 1) {
            for (var key of key_layers) {
                layer._map._layers[key].setStyle(polygons_style_selected());
            }
        } else {
            layer.setStyle(polygons_style_selected());
        }
    } else {
        if (key_layers.length > 1) {
            for (var key of key_layers) {
                layer._map._layers[key].setStyle(polygons_style_default());
            }
        } else {
            layer.setStyle(polygons_style_default());
        }
    }
    MAP_CONTROL_POLYGONS.update();
}

function polygons_onEachFeature(feature, layer) {
    layer.on({
        mouseover: polygons_highlightFeature,
        mouseout: polygons_resetHighlight,
        click: polygons_select_object
    });
}

function polygons_select_object(e) {
    var layer = e.target;
    var attr_name = polygons_get_attribute_name(layer.feature.properties, 'fields-polygons');
    var attr_added = polygons_get_shp_attr_options('list-shp-attr-fields-2');
    var key_layers = polygons_get_layers_keys(layer, attr_name, 'fields-polygons');

    if (attr_name !== null) {
        if (polygons_checkExistsLayers(layer.feature)) {
            if (key_layers.length > 1) {
                for (var key of key_layers) {
                    layer._map._layers[key].setStyle(polygons_style_default());
                }
            } else {
                layer.setStyle(polygons_style_default());
            }

            var index = attr_added.indexOf(attr_name);
            if (index !== -1) {
                $('#list-shp-attr-fields-2').find('[value="' + attr_name + '"]').remove();
            }
        } else {
            if (key_layers.length > 1) {
                for (var key of key_layers) {
                    layer._map._layers[key].setStyle(polygons_style_selected());
                }
            } else {
                layer.setStyle(polygons_style_selected());
            }

            $('#list-shp-attr-fields-2').append(
                $("<option>").text(attr_name).val(attr_name)
            );
        }
    }
}

function polygons_get_shp_attr_options(selectID) {
    var options = $("#" + selectID + " option").map(function() {
        return $(this).val();
    });
    return options.get();
}

function polygons_add_shp_attr_values() {
    var attr = $('#fields-polygons option:selected').val();
    var sel_val = $('#list-shp-attr-fields-1').val();
    if (sel_val.length === 0) {
        return false;
    }
    var sel_added = polygons_get_shp_attr_options('list-shp-attr-fields-2');
    for (var s = 0; s < sel_val.length; ++s) {
        if (sel_added.indexOf(sel_val[s]) === -1) {
            $('#list-shp-attr-fields-2').append(
                $("<option>").text(sel_val[s]).val(sel_val[s])
            );
        }
    }
    // add to map
    MAP_LAYER_POLYGONS.eachLayer(function(layer) {
        var attr_layer = '' + layer.feature.properties[attr];
        if (sel_val.includes(attr_layer)) {
            layer.setStyle(polygons_style_selected());
        }
    });
}

function polygons_clear_selected_attr() {
    var sel_added = polygons_get_shp_attr_options('list-shp-attr-fields-2');
    if (sel_added.length === 0) {
        return false;
    }

    $('#list-shp-attr-fields-2').empty();

    if (MAP_LAYER_POLYGONS !== undefined) {
        MAP_LAYER_POLYGONS.eachLayer(function(layer) {
            layer.setStyle(polygons_style_default());
        });
    }
}

function polygons_remove_shp_attr_values() {
    var attr = $('#fields-polygons option:selected').val();
    var sel_val = $('#list-shp-attr-fields-2').val();
    if (sel_val.length === 0) {
        return false;
    }
    for (var s = 0; s < sel_val.length; ++s) {
        $('#list-shp-attr-fields-2 option[value="' + sel_val[s] + '"]').remove();
        // $('#list-shp-attr-fields-2').find('[value="' + sel_val[s] + '"]').remove();
    }
    // remove from map
    MAP_LAYER_POLYGONS.eachLayer(function(layer) {
        var attr_layer = '' + layer.feature.properties[attr];
        if (sel_val.includes(attr_layer)) {
            layer.setStyle(polygons_style_default());
        }
    });
}