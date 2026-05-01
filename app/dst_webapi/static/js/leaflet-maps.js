var MAP_BE;
var TILE_BE;
var ZOOM_BE;
var SCALE_BE;
var MOUSEPOS_BE;
var MARKERS_BE = [];
var IMAGES_PNG = [];
var RECTANGLE_BOX;
var MAP_LAYER_POLYGONS;
var MAP_LAYER_MARKERS;
var MAP_CONTROL_POLYGONS;

var RASTER_VALUE;
var IMAGE_MASK; //myimageMASK
var PARS_MASK; //myparsMASK
var POLAR_AXIS = [];

function createLeafletTileLayer(container) {
    if (MAP_BE == undefined) {
        var map = L.map(container, {
            center: [MTO_INIT.mapCenterLAT, MTO_INIT.mapCenterLON],
            minZoom: 2,
            zoom: MTO_INIT.mapZoom,
            zoomControl: false
        });

        var meteo = ' | <a href="' + MTO_INIT.metServiceURL + '">' + MTO_INIT.metServiceName + '</a>';
        var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
        var tiles = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: attribu + meteo,
            maxZoom: 19,
            subdomains: ["a", "b", "c"]
        });
        tiles.addTo(map);

        TILE_BE = tiles;
        MAP_BE = map;
        addLControlPositions();

        addLControlZoom(map, 'bottomright');
        addLControlScale(map, 'hcenterbottom');
        addLControlMousePosition(map, 'bottomleft');
    } else {
        var map = MAP_BE;
        map.invalidateSize();
        // remove markers
        removeLayerMarkers(map);
        // remove images layers
        removeLayerImagePNG(map);
        // remove other Layers
        removeLayerPolarAxis(map);
    }

    return map;
}

function addLControlZoom(map = MAP_BE, position = 'bottomright') {
    ZOOM_BE = new L.Control.Zoom({
        position: position
    }).addTo(map);
}

function addLControlScale(map = MAP_BE, position = 'bottomleft') {
    SCALE_BE = new L.Control.Scale({
        position: position,
        imperial: false
    }).addTo(map);

    $('.leaflet-control-scale .leaflet-control-scale-line').css({
        'position': 'absolute',
        'top': '-10px',
        'left': '-50px',
        'width': '98px'
    });
}

function addLControlMousePosition(map = MAP_BE, position = 'bottomleft') {
    MOUSEPOS_BE = new L.control.mousePosition({
        position: 'bottomleft',
        lngFormatter: funlonFrmt,
        latFormatter: funlatFrmt
    }).addTo(map);
}

// format lon
function funlonFrmt(lon) {
    var degre, minute, second;
    xlon = (lon < 0) ? Math.abs(lon) : lon;
    degre = Math.floor(xlon);
    lonm = (xlon - degre) * 60;
    minute = Math.floor(lonm);
    second = (lonm - minute) * 60;
    suffix = (lon < 0) ? 'W' : 'E';
    long = degre + 'º ' + minute + "' " +
        second.toFixed(2) + '" ' + suffix;
    return long;
}

// format lat
function funlatFrmt(lat) {
    var degre, minute, second;
    xlat = (lat < 0) ? Math.abs(lat) : lat;
    degre = Math.floor(xlat);
    latm = (xlat - degre) * 60;
    minute = Math.floor(latm);
    second = (latm - minute) * 60;
    suffix = (lat < 0) ? 'S' : 'N';
    lati = degre + 'º ' + minute + "' " +
        second.toFixed(2) + '" ' + suffix;
    return lati;
}

function addLControlPositions() {
    var positions = MAP_BE._controlCorners;
    var container = MAP_BE._controlContainer;

    function createCenterPosition(center, side) {
        var className = 'leaflet-' + center + ' ' + 'leaflet-' + side;
        positions[center + side] = L.DomUtil.create('div', className, container);
    }

    createCenterPosition('vcenter', 'left');
    createCenterPosition('vcenter', 'right');
    createCenterPosition('hcenter', 'top');
    createCenterPosition('hcenter', 'bottom');
}

/////

function polygons_get_attribute_name(properties, selectID) {
    var attr = $('#' + selectID + ' option:selected').val();
    var attr_name = null;
    if (properties) {
        // convert to string
        attr_name = '' + properties[attr];
    }
    return attr_name;
}

function polygons_display_attrValue(selectID) {
    infoControl = L.control({ position: 'topleft' });

    infoControl.onAdd = function() {
        this._div = L.DomUtil.create('div', 'leaflet-display-attr-name');
        this.update();
        return this._div;
    };

    infoControl.update = function(properties) {
        var attr_name = polygons_get_attribute_name(properties, selectID);
        jQuery(this._div).html(attr_name);
    };

    infoControl.addTo(MAP_BE);

    return infoControl;
}

function polygons_style_default() {
    return {
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.0,
        //fillColor: "#2262cc"
    };
}

function polygons_style_highlight() {
    return {
        color: "black",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.5,
        fillColor: '#2262cc'
    };
}

function polygons_style_selected() {
    return {
        color: "black",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.6,
        fillColor: '#f55347'
    };
}

/////

function removeLayerMarkers() {
    if (MARKERS_BE.length > 0) {
        for (i = 0; i < MARKERS_BE.length; i++) {
            MAP_BE.removeLayer(MARKERS_BE[i]);
        }
        MARKERS_BE = [];
    }
}

function removeLayerMarkers1() {
    if (MAP_LAYER_MARKERS !== undefined) {
        MAP_LAYER_MARKERS.remove();
        var tmp;
        MAP_LAYER_MARKERS = tmp;
    }
}

function removeLayerRectangleBox() {
    if (RECTANGLE_BOX !== undefined) {
        RECTANGLE_BOX.remove();
        var tmp;
        RECTANGLE_BOX = tmp;
    }
}

function removeLayerPolygons() {
    if (MAP_LAYER_POLYGONS !== undefined) {
        MAP_LAYER_POLYGONS.remove();
        var tmp;
        MAP_LAYER_POLYGONS = tmp;
    }
}

function removeControlPolygons() {
    if (MAP_CONTROL_POLYGONS !== undefined) {
        MAP_BE.removeControl(MAP_CONTROL_POLYGONS)
        var tmp;
        MAP_CONTROL_POLYGONS = tmp;
    }
}

function removeLayerImagePNG() {
    if (IMAGES_PNG.length > 0) {
        for (i = 0; i < IMAGES_PNG.length; i++) {
            if (IMAGES_PNG[i]) {
                MAP_BE.removeLayer(IMAGES_PNG[i]);
            }
        }
    }
}

function addLayerImagePNG() {
    if (IMAGES_PNG.length > 0) {
        for (i = 0; i < IMAGES_PNG.length; i++) {
            if (IMAGES_PNG[i]) {
                MAP_BE.addLayer(IMAGES_PNG[i]);
            }
        }
    }
}

function removeLayerPolarAxis() {
    if (POLAR_AXIS.length > 0) {
        for (i = 0; i < POLAR_AXIS.length; i++) {
            MAP_BE.removeLayer(POLAR_AXIS[i]);
        }
        POLAR_AXIS = [];
    }
}