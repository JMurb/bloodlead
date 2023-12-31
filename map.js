var map = L.map('map', { center: [40, -75.155399], zoom: 11 });
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);

var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam11cmIiLCJhIjoiY2xvaDg0NHh1MGR6bTJ0czJodmNhMWoxNCJ9.FuXTCdTbyHhX8sDG2_O5FA';

var grayscale = L.tileLayer(mbUrl, { id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr }),
    streets = L.tileLayer(mbUrl, { id: 'mapbox/streets-v12', tileSize: 512, zoomOffset: -1, attribution: mbAttr });

var baseMaps = {
    "grayscale": grayscale,
    "streets": streets
};
var temple = L.marker([39.981192, -75.155399]);
var drexel = L.marker([39.957352834066796, -75.18939693143933]);
var penn = L.marker([39.95285548473699, -75.19309508637147]);
var universities = L.layerGroup([temple, drexel, penn]);
var universityLayer = {
    "Phily University": universities
};



// popup with coordinates
/*
        var popup = L.popup();







        // Write function to set Properties of the Popup
        function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("Selected location: " + e.latlng.lng.toFixed(4) + " W, " + e.latlng.lat.toFixed(4) + " N")
                .openOn(map);
        }


// Listen for a click event on the Map element
map.on('click', onMapClick);
*/
// load GeoJSON from an external file
var neighborhoodsLayer = null;
$.getJSON("blood_lead.geojson", function (data) {
    // add GeoJSON layer to the map once the file is loaded
    neighborhoodsLayer = L.geoJson(data, {
        style: styleFunc,

        onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomFeature
            });
            layer.bindPopup('# children over 5%: ' + feature.properties.perc_5plus);
        }
    }).addTo(map);
    var overlayLayer = {
        "blood_lead_level": neighborhoodsLayer,
        "Phily University": universities
    };

    L.control.layers(baseMaps, overlayLayer).addTo(map);

});

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    // for different web browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}
// Define what happens on mouseout:
function resetHighlight(e) {
    neighborhoodsLayer.resetStyle(e.target);
}
// As an additional touch, let’s define a click listener that zooms to the state: 
function zoomFeature(e) {
    console.log(e.target.getBounds());
    map.fitBounds(e.target.getBounds().pad(1.5));
}

function styleFunc(feature) {
    return {
        fillColor: setColorFunc(feature.properties.perc_5plus),
        fillOpacity: 0.9,
        weight: 1,
        opacity: 1,
        color: '#ffffff',
        dashArray: '3'
    };
}
// Set function for color ramp, you can use a better palette


function setColorFunc(density) {
    return density > 15 ? '#7a0177' :
        density > 10 ? '#c51b8a' :
            density > 5 ? '#f768a1' :
                density > 0 ? '#fbb4b9' :
                    density == 0 ? '#ffffff' :
                    '#cccccc';
};
// Add Scale Bar to Map
L.control.scale({ position: 'bottomleft' }).addTo(map);
// Create Leaflet Control Object for Legend
var legend = L.control({ position: 'bottomright' });

// Function that runs when legend is added to map
legend.onAdd = function (map) {
    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b>% of Children under 6 with Tested</b><br />';
    div.innerHTML += '<b>Blood Lead Levels >= 5 μg/dL</b><br />';
    div.innerHTML += '<b>by census tract</b>';
    div.innerHTML += '<br>';
    div.innerHTML += '<i style="background: #7a0177"></i><p>15+</p>';
    div.innerHTML += '<i style="background: #c51b8a"></i><p>10-15</p>';
    div.innerHTML += '<i style="background: #f768a1"></i><p>5-10</p>';
    div.innerHTML += '<i style="background: #fbb4b9"></i><p>1-5</p>';
    div.innerHTML += '<i style="background: #ffffff"></i><p> 0 </p>';
    div.innerHTML += '<hr>';
    div.innerHTML += '<i style="background: #cccccc"></i><p>No Data</p>';

    // Return the Legend div containing the HTML content
    return div;
};

// Add Legend to Map
legend.addTo(map);