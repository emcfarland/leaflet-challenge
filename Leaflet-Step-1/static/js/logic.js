// Initialize earthquake data query
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", 
    function(data) {
        createFeatures(data.features);
    }
);

// Build markers and popups
function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
            <p>
                Time: ${new Date(feature.properties.time)}<br>
                Magnitude: ${feature.properties.mag}<br>
                Depth: ${feature.geometry.coordinates[2]}
            </p>`);
  }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
    });

    createMap(earthquakes);
}

// Build map
function createMap(earthquakes) {

    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [streetmap, earthquakes]
    });

    L.control.layers(streetmap, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}
