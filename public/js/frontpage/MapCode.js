"use strict";

var map = L.map('MapContain').setView([-6.25,106.83], 10);
L.tileLayer('https://api.mapbox.com/styles/v1/asbarve/ciu0anscx00ac2ipgyvuieuu9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXNiYXJ2ZSIsImEiOiI4c2ZpNzhVIn0.A1lSinnWsqr7oCUo0UMT7w',
{ maxZoom: 18,
  minZoom: 9,
}).addTo(map);

//Custom marker icons
var pumpIcon = L.icon({
  iconUrl: '/svg/pumpIcon.svg',
  iconSize: [30, 30],
  iconAnchor: [20, 10]
});
var reportIcon = L.icon({
  iconUrl: '/svg/floodIcon.svg',
  iconSize: [25, 25],
  iconAnchor: [18, 8]
});
var floodGateIcon = L.icon({
  iconUrl: '/svg/floodGate.svg',
  iconSize: [25, 25],
  iconAnchor: [18, 10],

});
var waterwaysLinestyle = {
  "color": "#787878",
   "weight": 2,
   "opacity": 0.65
};

var cityLayers = L.layerGroup();
var layerToggle;
// var response;
// $.get('/reports/confirmed/', {}, function (response) {
//    console.log('Get All Reports successful MapCode.js');
// });
// console.log(response);

//Add city objects with following parameters, and data sources with respective names & icons
var jakartaParams = {
  city: "Jakarta",
  center: [-6.15, 106.83],
  urlList: ["/reports/confirmed", "https://petajakarta.org/banjir/data/api/v2/infrastructure/pumps","https://petajakarta.org/banjir/data/api/v2/infrastructure/floodgates","https://petajakarta.org/banjir/data/api/v2/infrastructure/waterways"],
  layerList: ["Reports", "Pumps", "Flood Gates", 'Waterways'],
  styleList: [reportIcon, pumpIcon, floodGateIcon, waterwaysLinestyle]
};

var cambridgeParams = {
  city: "Cambridge",
  center: [42.3601, -71.0942],
  urlList: ["/reports/confirmed"], //There will be new Reports API by area name. Until then.
  layerList: ["Reports"],
  styleList: [reportIcon]
};

var SurabayaParams = {
  city: "Surabaya",
  center: [-7.25,112.75],
  urlList: ["/reports/confirmed"],
  layerList: ["Reports"],
  styleList: [reportIcon]
};


var BandungParams = {
  city: "Bandung",
  center: [-6.91,107.61],
  urlList: ["/reports/confirmed"],
  layerList: ["Reports"],
  styleList: [reportIcon]
};

function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.status) {
      $.get('/report/retrieveimage/' + feature.properties.card_id, function (response) {
        response = JSON.parse(response);
        layer.bindPopup('<center><img src="'+response.signedRequest+'" height="100%" width="100%"><br></center><br> <b>Status: </b>' + feature.properties.status + '<br><b>Water depth: </b>' + feature.properties.water_depth + 'cm');
      });
    } else if (feature.properties && feature.properties.name) {
      layer.bindPopup('<b>Name: </b>' + feature.properties.name);
    }
}

function createLayer(url, name, icon) {
  var newLayer;
  $.getJSON(url, function (data) {
    newLayer = L.geoJson(data, {
      onEachFeature: onEachFeature,

      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: icon});
      },
    style: function(feature) {
          switch (feature.geometry.type) {
              case 'LineString':return icon;
              //case 'point':   return L.marker(feature.geometry.coordinates, {icon: icon});
          }
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
    createLayer(cityObject.urlList[i], cityObject.layerList[i], cityObject.styleList[i]);
  }
  layerToggle.addTo(map);
  cityLayers.addTo(map);
}

//Add click events for different cities
$('#Cambridge').click(function () {
  updateMapView(cambridgeParams);
});
$('#Jakarta').click(function () {
  updateMapView(jakartaParams);
});
$('#Surabaya').click(function () {
  updateMapView(SurabayaParams);
});
$('#Bandung').click(function () {
  updateMapView(BandungParams);
});

//Default view jakarta
$(document).ready(function () {
  $('#Jakarta').trigger('click');
});
