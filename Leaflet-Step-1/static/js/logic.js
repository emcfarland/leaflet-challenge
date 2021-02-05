// Initialize earthquake data query
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", 
    function(data) {
        createFeatures(data.features);
    }
);

// Build markers and popups
function createFeatures(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            
            return L.circleMarker(latlng,
                {
                    radius: feature.properties.mag*3,
                    color: "black",
                    weight: 1,
                    fillOpacity: 0.9,
                    fillColor: chooseColor(feature.geometry.coordinates[2])
                }
            )
        },
        onEachFeature: onEachFeature,
    });

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
            <p>
                Time: ${new Date(feature.properties.time)}<br>
                Magnitude: ${feature.properties.mag}<br>
                Depth: ${feature.geometry.coordinates[2]}
            </p>`);
    }

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

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [streetmap, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

}



function chooseColor(depth) {
    if (depth < 0) {
        return "#00FF00";
    } else if (depth < 15) {
        return "#58FF00";
    } else if (depth < 30) {
        return "#9FFF00";
    } else if (depth < 45) {
        return "#E5FF00";
    } else if (depth < 60) {
        return "#FFD300";
    } else if (depth < 75) {
        return "#FF8C00";
    } else if (depth < 90) {
        return "#FF4600";
    } else {
        return "#FF0000";
    }
}