// Queries earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", 
    function(earthquakes) {

        // Queries tectonic plate data
        d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
            function(tectonics) {

                // Passes GeoJSON features to build map layers
                createFeatures(earthquakes.features, tectonics.features);
            }
        );
    }
);


function createFeatures(earthquakeData, tectonicData) {
    // Builds earthquake geometry with bubble markers and popups
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: earthquakePoints,
        onEachFeature: onEachEarthquake,
    });

    // Builds tectonics geometry
    var tectonics = L.geoJSON(tectonicData, {
        style: {
            "color": "#ff0000",
            "weight": 2,
            "opacity": 0.7
        }
    });

    createMap(earthquakes, tectonics);
}


// Binds popup information about each earthquake to its location
function onEachEarthquake(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
        <p>
            Time: ${new Date(feature.properties.time)}<br>
            Magnitude: ${feature.properties.mag}<br>
            Depth: ${feature.geometry.coordinates[2]}
        </p>`);
}


// Styles earthquake locations as bubbles, colored and sized by depth and magnitude, respectively
function earthquakePoints(feature, latlng) {            
    return L.circleMarker(latlng,
        {
            radius: feature.properties.mag*2,
            color: "black",
            opacity: 0.4,
            weight: 1,
            fillOpacity: 0.9,
            fillColor: chooseColor(feature.geometry.coordinates[2])
        }
    )
}


// Builds map layers from features
function createMap(earthquakes, tectonics) {
    var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Outdoors Map": outdoorsmap,
        "Dark Map": darkmap,
        "Satellite Map": satellitemap,
    };

    var overlayMaps = {
        Earthquakes: earthquakes,
        "Tectonic Plates": tectonics
    };

    // Initializes map with default visualizations
    var myMap = L.map("map", {
        center: [20, 0],
        zoom: 2,
        layers: [satellitemap, earthquakes, tectonics]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    
    // Builds legend (adapted from https://leafletjs.com/examples/choropleth/)
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend');
        var depths = [-10, 10, 30, 50, 70, 90];

        for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(depths[i]+1) + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
            return div;
    };

    legend.addTo(myMap);
}

// Colors bubbles (and legend) based on earthquake depth
function chooseColor(depth) {
    if (depth > 90) {
        return "#FF0000";
    } else if (depth > 70) {
        return "#FF4600";
    } else if (depth > 50) {
        return "#FF8C00";
    } else if (depth > 30) {
        return "#FFD300";
    } else if (depth > 10) {
        return "#E5FF00";
    } else {
        return "#00FF00";
    }
}