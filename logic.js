// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function markerSize(mag) {
  if (mag > 0) {
    return mag * 3;
  };
  return 1;
};


function chooseColor(d){
  return d < 1 ? '#58d68d' :
  d < 2  ? '#229954' :
  d < 3  ? '#2e86c1' :
  d < 4  ? '#1f618d' :
  d < 5  ? '#9b59b6' :
  d < 6  ? '#6c3483' :
  d < 7  ? '#f1c40f' :
  d < 8  ? '#f39c12' :
  d < 9  ? '#e74c3c' :
           '#922b21' ;
};

function createFeatures(earthquakeData) {

  // Define a function for each feature in the array
  // Give each feature a popup
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array 
  // Run the onEachFeature function once for each data point
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng)
    },
    onEachFeature: onEachFeature,
    style: function(feature) {
      return {
        fillOpacity: 0.75,
        fillColor: chooseColor(feature.properties.mag),
        radius: markerSize(feature.properties.mag),
        color: "black",
        weight: 1,
        opacity: 0.8,
      }
    }
  });

  // Sending the earthquakes layer to the function createMap 
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define map layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Defining a baseMaps object to hold the layers
  var baseMaps = {
    "Satellite Map": satellitemap,
    "Street Map": streetmap,
    "Dark Map": darkmap    
  };

  // Create overlay object to hold the overlay
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map, 
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [satellitemap, earthquakes]
  });

  // Create layer control
  // Pass in baseMaps & overlayMaps
  // Adding layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = [0,1,2,3,4,5,6,7,8,9];
  var colors = ['#58d68d',
    '#229954',
    '#2e86c1',
    '#1f618d',
    '#9b59b6',
    '#6c3483',
    '#f1c40f',
    '#f39c12',
    '#e74c3c',
    '#922b21'];
  var labels = [];

  var legendInfo = "<h1>Earthquake Magnitude</h1>" +
    "<div class=\"labels\">" +
      // "<div class=\"min\">" + limits[0] + "</div>" +
      // "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
    "</div>";

  div.innerHTML = legendInfo;

  limits.forEach(function(limit, index) {
    labels.push("<li style=\"background-color: " + colors[index] + "\">" + limits[index] + "</li>" );
  });

  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);

};