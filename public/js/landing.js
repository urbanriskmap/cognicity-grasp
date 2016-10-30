'use strict';

//Replace map with background image
var map = L.map('baseMap');
L.tileLayer('https://api.mapbox.com/styles/v1/mayankojha/ciu43n5ge00bj2ilfv9vazp2e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF5YW5rb2poYSIsImEiOiJfeGl3Y01jIn0.Z3VjUlCe-W63PLsPzY_7Cw', {
}).addTo(map);
map.setView([-6.2, 106.83], 14);

//CHANGE no. of cards; by ADDING NEW CARD TITLE in right order, terms&conditions & thank you remain second-to-last and last in array...
var titleStrings = ['Select Location', 'Report Height of Flooding', 'Upload a photo', 'Add Description', 'Review & Submit', 'Terms & Conditions', 'Report Submitted'];
var noOfCards = titleStrings.length - 2; //User input cards only; exclude Terms&Conditions and Thank you cards
var cardTracker = 0;
var reportParams = {location: null, height: null, description: null}; //Object collecting user input

$(document).ready(function () {

  //Dot navigation buttons (tabs) tracking report progress; can be made clickable if required
  for (var i = 0; i < noOfCards; i += 1) {
    $('#tabTracker').append(
      $('<button/>').attr({
      'class': 'tabBtn',
      'id': 'tab' + i
    })
  );
  if (i !== cardTracker) {
    $('#tab' + i).prop('disabled', true);
  }
}

var showCard = function (cardNo) {
  $('.cardInner').siblings().hide();
  $('#contentCard' + cardNo).show();
  $('#cardTitle').html(titleStrings[cardNo]);
};

$('#next').click(function () {
  if (cardTracker === 0) {
    $('#prev').prop('disabled', false);
  }
  cardTracker += 1;
  if (cardTracker < noOfCards) {
    $('#tab' + cardTracker).prop('disabled', false);
  }
  showCard(cardTracker);
  $('#contentCard' + cardTracker).trigger('launch');
  if (cardTracker >= (noOfCards - 1)) {
    $(this).prop('disabled', true);
  }
});

$('#prev').click(function () {
  if (cardTracker === (noOfCards - 1)) {
    $('#next').prop('disabled', false);
  }
  if (cardTracker < noOfCards) {
    $('#tab' + cardTracker).prop('disabled', true);
  }
  cardTracker -= 1;
  showCard(cardTracker);
  if (cardTracker === 0) {
    $(this).prop('disabled', true);
  }
});

//Show screen, card frame, first card
$('#screen').show();
$('#cardFrame').show();
showCard(cardTracker);
$('#contentCard' + cardTracker).trigger('launch');
$('#prev').prop('disabled', true);
}); //close document.ready event

function _ajax_request(url, data, callback, method) {
  return $.ajax({
    dataType: "json",
    contentType: "application/json",
    url: url,
    type: method,
    data: JSON.stringify(data),
    success: callback
  });
}

$.extend({
  put: function (url, data, callback) {
    return _ajax_request(url, data, callback, 'PUT');
  }
});


var card_id = window.location.pathname.split('/').pop();
//    uploadLink;


/*
// retrieve aws image upload link... store as global var
var uploadLink = function (file) {
  var xhr = new XMLHttpRequest();
  var response;
  xhr.open('GET', '/sign-s3?file-name=' + file.name + '&file-type=' + file.type);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        response = JSON.parse(xhr.responseText);
        //uploadFile(file, response.signedRequest, response.url);
      } else {
        console.log('Could not get signed URL.');
      }
    }
  };
  xhr.send(); //???
  return response;
};
*/


// ***CARD 0*** get/set location
$('#contentCard0').on('launch', function () {
  var cardmap = L.map('cardMapWrapper'),
  gpsLocation,
  center;

  L.tileLayer('https://api.mapbox.com/styles/v1/asbarve/ciu0anscx00ac2ipgyvuieuu9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXNiYXJ2ZSIsImEiOiI4c2ZpNzhVIn0.A1lSinnWsqr7oCUo0UMT7w', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OSM</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
    minZoom: 10,
    maxZoom: 20
  }).addTo(cardmap);

  cardmap.locate({
    setView: true,
    zoom: 14
  });

  $('#resetLocation').prop('disabled', true);

  //Geolocate function
  cardmap.once('locationfound', function (e) {
    gpsLocation = cardmap.getCenter();

    L.circle(gpsLocation, {
      weight: 0,
      fillColor: 'green',
      fillOpacity: 0.15,
      radius: e.accuracy / 2
    }).addTo(cardmap);

    L.circleMarker(gpsLocation, {
      color: 'white',
      weight: 1,
      fillColor: 'green',
      fillOpacity: 1,
      radius: 8
    }).addTo(cardmap);

    $('#resetLocation').prop('disabled', false);
    reportParams.location = gpsLocation.lng + " " + gpsLocation.lat;
  });

  //Geolocate error function
  cardmap.once('locationerror', function () { //Execute once
    cardmap.setView([-6.2, 106.83], 14); //Jakarta
    $('#resetLocation').prop('disabled', true);
  });

  $('#resetLocation').click(function () {
    if (gpsLocation) {
      cardmap.flyTo(gpsLocation);
    }
    $('#resetLocation').prop('disabled', true);
  });

  cardmap.on('move', function () {
    if (gpsLocation) {
      $('#resetLocation').prop('disabled', false);
    }
  });

  $('#next').click(function () {
    center = cardmap.getCenter();
    reportParams.location = center.lng + " " + center.lat;
  });
});


// ***CARD 1*** set height
$('#contentCard1').one('launch', function () { //launch once
  $('#dragRef').delay(1000).fadeOut(400);

  /* Custom VERTICAL HEIGHT SLIDER, required due to browser compatibility issues
  with <input type="range"> + css transformations; also limits of css styling
  of range slider. */

  var imgH = 200, //Height of reference image in cm
  startPos,
  dragPos,
  initOff = $('#slider').offset().top, //initial top offset
  fillH = $('#waterFill').height(),
  refH = $('#bgImg').height(), //height of reference image in pixels as rendered
  //pressed = false,
  translateVar = - 40, //initial translateY
  stringH = ['Ankle-deep', 'Knee-deep', 'Waist-high', 'Neck-high', 'Above-neck'],
  thresholdH = [0, 25, 50, 100, 150, imgH], //bounds for stringH, [0]=-1 to include 0cm...
  heightInCm = Math.round((fillH * imgH) / refH);

  $('#hText').html(heightInCm + 'cm');
  reportParams.height = heightInCm;

  $('#slider').on('touchstart mousedown', function (e) {
    startPos = e.touches[0].pageY;
    //pressed = true;
    $('#sliderKnob').prop('active', true);
    $('#cardFrame').on('touchmove mousemove', function (e) {
      e.preventDefault();
      dragPos = e.touches[0].pageY;
      heightInCm = Math.round(((fillH + (startPos - dragPos)) * imgH) / refH);
      if (heightInCm > 0 && heightInCm <= imgH) {
        $('#slider').css({
          'transform': 'translateY(' + (translateVar + dragPos - startPos) + 'px)'
        });
        $('#waterFill').height(fillH + (startPos - dragPos) + 'px');
        $('#waterFill').css({
          'background-color': 'rgba(128, 203, 196, ' + (0.1 + (heightInCm / imgH) * 0.65) + ')' //Opacity range 0.1 to 0.75
        });
        for (var i = 0; i < stringH.length; i += 1) {
          if (heightInCm > thresholdH[i] && heightInCm <= thresholdH[i + 1]) {
            $('#hText').html(stringH[i] + ', ' + heightInCm + 'cm');
          }
        }
      }
    });
    $(document).on('touchend mouseup', function () {
      //if (pressed) {
        //pressed = false;
        $('#sliderKnob').prop('active', false);
        translateVar = - 40 + $('#slider').offset().top - initOff;
        fillH = $('#waterFill').height();
        reportParams.height = heightInCm;
      //}
    });
  });
});


// ***CARD 2*** add photo
var photo;

$('#contentCard2').on('launch', function () {
  $('#photoCapture').click(function () {
    $('#ghostCapture').trigger('click');
    $('#ghostCapture').change(function () {
      photo = $('#ghostCapture')[0].files[0];
      if (photo) {
        $.get('/report/imageupload/' + card_id, { 'file_type': photo.type}, function(response) {
          response = JSON.parse(response);
          uploadFile(photo, response.signedRequest, response.url);
        });
      }
    });
  });
  $('#photoSelector').click(function () {
    $('#ghostPicker').trigger('click');
    $('#ghostCapture').change(function () {
      photo = $('#ghostCapture')[0].files[0];
      if (photo) {
        $.get('/report/imageupload/' + card_id, { 'file_type': photo.type}, function(response) {
          response = JSON.parse(response);
          uploadFile(photo, response.signedRequest, response.url);
        });
      }
    });
  });

  function drawOnCard(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var photoPath = e.target.result,
          wrapper = $('#photoCanvas'),
          cntxt = wrapper[0].getContext('2d'),
          reviewImg = new Image();
      reviewImg.onload = function() {
        var w = $('#canvasWrapper').width(),
            h = $('#canvasWrapper').height();
        wrapper.width = w;
        wrapper.height = h;
        var hImg = Math.round((reviewImg.height * w) / reviewImg.width);
        console.log(reviewImg.width + 'x' + reviewImg.height + ', ' + w + 'x' + h + ', ' + hImg);
        cntxt.drawImage(reviewImg, 0, 0, w, hImg);
      };
      reviewImg.src = photoPath;
    };
    reader.readAsDataURL(file);
  }

  //Execute along with thank you card... store photo in global variable
  //Function to carry out the actual PUT request to S3
  //using the signed request from the app.
  function uploadFile(file, signedRequest, url) {
    $.ajax({
            url: signedRequest,
            type: 'PUT',
            data: file,
            contentType: false,
            processData: false,
            cache: false,
            error: function(data){
              console.log("error");
              console.log(data);
            },
            success: function() { console.log("uploaded image successfully!"); }
    });
  }
});


// ***CARD 3*** enter description
$('#contentCard3').on('launch', function () {
  var charLength = $('#descripText').val().length;
  if (charLength === 0) {
    $('#descripText').val("Enter text here...");
    $('#descripText').one('focus', function () { //jQuery alt for fn () {arg, {once: true}}
      $(this).val("");
    });
  }
  $('#descripText').keyup(function () { //TODO: check compatibility of keyup with phone browser input keyboards
    charLength = $(this).val().length;
    $('#charRef').text(charLength + "/140");
    if (charLength > 0) {             //will give true for default text also, check...
      reportParams.description = $('#descripText').val();
    }
  });
});


// ***CARD 4*** summary
$('#contentCard4').on('launch', function () {
  $('#floodH').html('Height of flooding: ' + reportParams.height + 'cm');
  if (reportParams.description) {
    $('#comment').html(reportParams.description);
  }

  //Custom HORIZONTAL SWIPE to SUBMIT slider TODO: phone touch compatibility
  var slideStartPos,
  slideDragPos,
  slideRange = $('#submitSlider').width() - $('#submitKnob').width(),
  slidePressed = false,
  slideThreshold = 0.9, //Slider triggers submit function at 90% swipe width
  slideTranslate = 0;

  $('#submitKnob').on('touchstart mousedown', function (e) {
    slideStartPos = e.touches[0].pageX;
    slidePressed = true;
  });
  $('#reviewSubmit').on('touchmove mousemove', function (e) {
    e.preventDefault();
    slideDragPos = e.touches[0].pageX;
    slideTranslate = slideDragPos - slideStartPos;
    if (slidePressed && slideTranslate >= 0 && slideTranslate < slideRange) {
      $('#submitKnob').css({
        'left': slideTranslate + 'px'
      });
      $('#submitSlider').css({
        'background-color': 'rgba(0, 149, 136, ' + (slideTranslate / (slideThreshold * slideRange)) + ')'
      });
      if (slideTranslate >= (slideThreshold * slideRange)) {
        cardTracker += 1; //cardTracker value override, skip t&c card & arrive at thanks card
        $('#next').trigger('click');
        //Push input values
        $.put('/report/' + card_id, {
          location: reportParams.location,
          water_depth: reportParams.height,
          text: reportParams.description,
          created_at: new Date().toISOString()
        }, function (putResult) {
          console.log('Report ID json: ' + putResult);
          if (putResult > 0) {
            console.log('Making getAllReports call');
            $.get('http://localhost:3000/report/confirmedReports/' + 0, null, function (getResult) {
              if (getResult.statusCode === 200) {
                console.log('getAllReports call successful');
              } else {
                console.log('getAllReports call failed');
              }
            });
          }
        });
      }
    }
  });
  $(document).on('mouseup touchend',function () {
    if (slidePressed && slideTranslate < (slideThreshold * slideRange)) {
      $('#submitKnob').animate({ //Swing back to start position
        'left': 0 + 'px'
      }, 50);
      $('#submitSlider').css({ //Reset slider background
        'background-color': 'transparent'
      });
    }
    slidePressed = false;
  });
  $('#linkToTandC').click(function () { //Launch terms & conditions
    $('#next').trigger('click');
  });
});


// ***Terms & Conditions Card***
$('#contentCard5').on('launch', function () {
  $('#cardTitle').html('Terms &amp; Conditions');
  $('#next').prop('disabled', true);
});


// ***Thank you Card***
$('#contentCard6').on('launch', function () {
  $('#next').prop('disabled', true);
  $('#prev').prop('disabled', true);
  $('.tabBtn').css({
    'border': 'none',
    'background-color': 'white',
    'opacity': '0.1'
  });
  //uploadFile(photo, uploadLink.signedRequest, uploadLink.url);
  $('#cardFrame').delay(2000).fadeOut(500);
  $('#screen').delay(2000).fadeOut(500);
  //delay 2500, open petajakarta.id
  window.setTimeout(function () {
    window.location.replace('/');
  }, 2500);
});
