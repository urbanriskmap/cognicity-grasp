/*
var map = L.map('baseMap');
L.tileLayer('https://api.mapbox.com/styles/v1/mayankojha/ciu43n5ge00bj2ilfv9vazp2e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF5YW5rb2poYSIsImEiOiJfeGl3Y01jIn0.Z3VjUlCe-W63PLsPzY_7Cw', {
//attribution: 'Map data &copy; <a href="http://openstreetmap.org">OSM</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
}).addTo(map);
map.setView([-6.2, 106.83], 14);
*/

//CHANGE no. of cards; by ADDING NEW CARD TITLE...
var titleStrings = ['Place marker to report flood location', 'Drag slider to report height of flooding', 'Add description', 'Review & submit report'];
var noOfCards = titleStrings.length;
var cardTracker = 1;
var cardVal = ['Location not selected','Default height','No description provided'];

$(document).ready(function(){

  //Dot markers (tabs) tracking report progress
  for (i = 1; i <= noOfCards; i++) {
    $('#tabTracker').append(
      $('<button/>').attr({
        class: 'tabBtn',
        id: 'tab' + i
      })
    );
    if (i==cardTracker) {
      $('#tab'+i).css({
        'background-color': '#80cbc4',
        'border-color': 'white'
      });
    }
  }

  $.fn.showCard = function(cardNo) {
    $('.cardInner').siblings().hide();
    $(this).show();
    $('#cardTitle').html(titleStrings[cardNo - 1]);
  };

  $('#next').click(function() {
    if (cardTracker==1) {
      $('#prev').prop('disabled', false);
    }
    cardTracker = cardTracker + 1;
    $('#contentCard'+cardTracker).showCard(cardTracker);
    $('#contentCard'+cardTracker).trigger('launch');
    $('#tab'+cardTracker).css({
      'background-color': '#80cbc4',
      'border-color': 'white'
    });
    if (cardTracker==noOfCards) {
      $(this).prop('disabled', true);
    }
  });

  $('#prev').click(function() {
    if (cardTracker==noOfCards) {
      $('#next').prop('disabled', false);
    }
    $('#tab'+cardTracker).css({
      'background-color': 'initial',
      'border-color': '#c0c0c0'
    });
    cardTracker = cardTracker - 1;
    $('#contentCard'+cardTracker).showCard(cardTracker);
    if (cardTracker==1) {
      $(this).prop('disabled', true);
    }
  });

  //Show screen & card frame
  $('#screen').show();
  $('#cardFrame').show();

  //Show first card
  $('#contentCard'+cardTracker).showCard(cardTracker);
  $('#contentCard'+cardTracker).trigger('launch');

  $('#prev').prop('disabled', true);

}); //close document.ready event

function _ajax_request(url, data, callback, method) {
    return jQuery.ajax({
        dataType: "json",
        contentType: "application/json",
        url: url,
        type: method,
        data: JSON.stringify(data),
        success: callback
    });
}

jQuery.extend({
    put: function(url, data, callback) {
        return _ajax_request(url, data, callback, 'PUT');
}});

jQuery.extend({
    get: function(url, data, callback) {
            return _ajax_request(url, data, callback, 'GET');
}});

// ***CARD 1*** get/set location
$('#contentCard1').on('launch', function () {
    var cardmap = L.map('cardMapWrapper');

    L.tileLayer('https://api.mapbox.com/styles/v1/mayankojha/ciu43n5ge00bj2ilfv9vazp2e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF5YW5rb2poYSIsImEiOiJfeGl3Y01jIn0.Z3VjUlCe-W63PLsPzY_7Cw', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OSM</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
      minZoom: 10,
      maxZoom: 20
    }).addTo(cardmap);

    cardmap.locate({
      setView: true,
      zoom: 14,
      //maxBounds: boundsC
    });

    var geolocated = false;
    var markerPlaced = false;
    var gpsLocation;
    var center;
    var marker;
    var markerIcon = L.icon({
      iconUrl: '/svg/marker-11.svg',
      iconSize: [60,60],
      iconAnchor: [30,60],
    });

    $('#setLocation').prop('disabled', true);
    $('#resetLocation').prop('disabled', true);
    $('#next').prop('disabled', true);

  /*
  var boundsJ = [
  // Jakarta
  [-6.5, 106.5], // Southwest coordinates
  [-5.9, 107.05]  // Northeast coordinates
  ];
  var boundsC = [
  // Cambridge
  [42.2, -71.2], // Southwest coordinates
  [42.5, -70]  // Northeast coordinates
  ];
  */

  //Geolocate function
  cardmap.once('locationfound', function(e) {
    gpsLocation = cardmap.getCenter();

    L.circle(gpsLocation, {
      weight: 0,
      fillColor: 'green',
      fillOpacity: 0.15,
      radius: e.accuracy/2
    }).addTo(cardmap);

    L.circleMarker(gpsLocation, {
      color: 'white',
      weight: 1,
      fillColor: 'green',
      fillOpacity: 1,
      radius: 8
    }).addTo(cardmap);

    marker = L.marker(gpsLocation, {
      icon: markerIcon
    }).addTo(cardmap);

    geolocated = true;
    markerPlaced = true;
    $('#setLocation').prop('disabled', true);
    $('#resetLocation').prop('disabled', false);
    $('#next').prop('disabled', false);

    cardVal[0] = gpsLocation.lng + " " + gpsLocation.lat;
  });

  //Geolocate error function
  cardmap.once('locationerror', function(e) {
    //alert(e.message); //add msg here; 'enable gps location'

    //Set view to default center
    cardmap.setView([-6.2, 106.83], 14); //Jakarta
    //cardmap.setView([42.365, -71.095], 14); //Cambridge

    //Set map pan bounds
    //cardmap.setMaxBounds(boundsJ);
    //cardmap.setMaxBounds(boundsC);

    center = cardmap.getCenter(); //DEBUG!!! - for different browsers

    $('#setLocation').prop('disabled', false);
    $('#resetLocation').prop('disabled', true);
  }, {once: true}); //Execute once

  //Update picker position & toggle buttons
  cardmap.on('move', function() {
    center = cardmap.getCenter();
    $('#setLocation').prop('disabled', false);
    if (geolocated && center!=gpsLocation) {
      $('#resetLocation').prop('disabled', false);
    }
  });

  $('#setLocation').click(function() {
    if (markerPlaced) {
      cardmap.removeLayer(marker);
    }

    marker = L.marker(center, {
      icon: markerIcon
    }).addTo(cardmap); //DEBUG - for different browsers

    markerPlaced = true;
    $('#setLocation').prop('disabled', true);
    $('#next').prop('disabled', false);

    cardVal[0] = center.lng + " " + center.lat;
  });

  $('#resetLocation').click(function() {
    if (geolocated) {
      cardmap.flyTo(gpsLocation);
    }
    $('#resetLocation').prop('disabled', true);
  });
});

// ***CARD 2*** set height
$('#contentCard2').one('launch', function () {
  $('#hideZone').mouseenter(function() {
    $('#dragRef').fadeOut('fast');
    $('#dragRef').css('z-index', '1');
    $(this).hide();
    $(this).css('z-index', '2');
  });

  var imgH = 200; //Height of reference image in cm
  var startPos;
  var dragPos;
  var initOff = $('#sliderKnob').offset().top; //half of height of sliderKnob + offset
  var fillH = $('#waterFill').height();
  var refH = $('#bgImg').height();
  var pressed = false;
  var translateVar = -12;
  var HeightInCM = Math.round((fillH * imgH) / refH);

  $('#sliderKnob').mousedown(function(e) {
    startPos = e.pageY;
    pressed = true;
  });

  $('#slider').mousemove(function(e) {
    dragPos = e.pageY;
    HeightInCM = Math.round(((fillH + (startPos - dragPos)) * imgH) / refH);

    if (pressed && HeightInCM>=0 && HeightInCM<=imgH) {
      $('#sliderKnob').css({
        'transform': 'translateY(' + (translateVar + dragPos - startPos) + 'px)'
      });

      $('#waterFill').height(fillH + (startPos - dragPos) + 'px');
      $('#waterFill').css({
        'background-color': 'rgba(128, 203, 196, ' + (0.1 + (HeightInCM/imgH)*0.65) + ')' //Opacity range 0.1 to 0.75
      });
      $('#hText').html(HeightInCM + 'cm');
    }
  });

  $(document).mouseup(function(e) {
    if (pressed) {
      pressed = false;
      translateVar = -12 + $('#sliderKnob').offset().top - initOff;
      fillH = $('#waterFill').height();
      cardVal[1] = HeightInCM;
    }
  });
});

// ***CARD 3*** enter description
$('#contentCard3').on('launch', function () {
  var charLength = $('#descripText').val().length;

  if (charLength == 0) {
    $('#descripText').val("Enter text here...");

    $('#descripText').one('focus', function() { //jQuery alt for {once: true}
      $(this).val("");
    });
  }

  $('#descripText').keypress(function() {
    charLength = $(this).val().length;
    $('#charRef').text(charLength + "/140");

    if (charLength > 0) {             //will give true for default text also, check...
      cardVal[2] = $('#descripText').val();
    }
  });
});

// ***CARD 4*** summary
$('#contentCard4').on('launch', function () {
  $('#getVal').click(function() {
    if (cardVal[0]) {
      $('#geoPosition').html(cardVal[0]);
    } else {
      $('#geoPosition').html('Location error');
    }

    $('#floodH').html(cardVal[1] + 'cm');

    if (cardVal[2]) {
      $('#comment').html(cardVal[2]);
    } else {
      $('#comment').html('No description provided');
    }
  });

  $('#submitButton').click(function(){
    var card_id = window.location.pathname.split('/').pop();
    console.log("ISO Date: " + new Date().toISOString());
    $.put('http://localhost:3000/report/' + card_id,
      {location: cardVal[0],
        water_depth: cardVal[1],
        text: cardVal[2],
        created_at: new Date().toISOString()}, function(putResult) {
          console.log('Report ID json: ' + putResult);
          if(putResult > 0){
              console.log('Making getAllReports call');
              $.get('http://localhost:3000/report/confirmedReports/' + 0, null, function(getResult){
                if(getResult.statusCode == 200){
                  console.log('getAllReports call successful');
                }
                else {
                  console.log('getAllReports call failed');
                }
              })
          }
    });
  })
});
