'use strict';

var map = L.map('MapContain').setView([-6.25, 106.83], 10);
L.tileLayer('https://api.mapbox.com/styles/v1/mayankojha/ciu43n5ge00bj2ilfv9vazp2e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF5YW5rb2poYSIsImEiOiJfeGl3Y01jIn0.Z3VjUlCe-W63PLsPzY_7Cw', {
  maxZoom: 20,
  minZoom: 9
}).addTo(map);

//L.control.locate().addTo(map);

//Custom marker icons
var pumpIcon = L.icon({
  iconUrl: '/svg/marker-08.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});
var reportIcon = L.icon({
  iconUrl: '/svg/marker-03.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

var cityLayers = L.layerGroup();
var layerToggle;

//Add city objects with following parameters, and data sources with respective names & icons
var jakartaParams = {
  city: "Jakarta",
  center: [-6.25, 106.83],
  urlList: ["https://raw.githubusercontent.com/ojha-url/URL_Internal/master/Test_jakarta.json", "https://petajakarta.org/banjir/data/api/v2/infrastructure/pumps"],
  layerList: ["Reports", "Pumps"],
  iconList: [reportIcon, pumpIcon]
};

var cambridgeParams = {
  city: "Cambridge",
  center: [42.3601, -71.0942],
  urlList: ["https://raw.githubusercontent.com/ojha-url/URL_Internal/master/test-cambridge.json"],
  layerList: ["Reports"],
  iconList: [reportIcon]
};

function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.status) {
      layer.bindPopup('Status: ' + feature.properties.status + '<br>Water depth: ' + feature.properties.water_depth + 'cm');
    } else if (feature.properties && feature.properties.name) {
      layer.bindPopup('Pump name: ' + feature.properties.name);
    }
}

function createLayer(url, name, icon) {
  var newLayer;
  $.getJSON(url, function (data) {
    newLayer = L.geoJson(data, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: icon});
      }
    });
    cityLayers.addLayer(newLayer);
    layerToggle.addOverlay(newLayer, name);
  });
}

function updateMapView(cityObject) {
  if (layerToggle) {
    map.removeControl(layerToggle);
  }
  layerToggle = L.control.layers();
  cityLayers.clearLayers();
  map.flyTo(cityObject.center, 12, { //TODO smooth curve flyTo
    animate: true,
    duration: 3
  });
  for (var i = 0; i < cityObject.urlList.length; i += 1) {
    createLayer(cityObject.urlList[i], cityObject.layerList[i], cityObject.iconList[i]);
  }
  layerToggle.addTo(map);
  cityLayers.addTo(map);
}

//Add click events for different cities
$('#Cambridge_test').click(function () {
  updateMapView(cambridgeParams);
});
$('#Jakarta').click(function () {
  updateMapView(jakartaParams);
});

//Default view jakarta
$(document).ready(function () {
  $('#Jakarta').trigger('click');
});
