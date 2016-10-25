'use strict';

var map = L.map('baseMap');
L.tileLayer('https://api.mapbox.com/styles/v1/mayankojha/ciu43n5ge00bj2ilfv9vazp2e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF5YW5rb2poYSIsImEiOiJfeGl3Y01jIn0.Z3VjUlCe-W63PLsPzY_7Cw', {
//attribution: 'Map data &copy; <a href="http://openstreetmap.org">OSM</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
}).addTo(map);
map.setView([-6.2, 106.83], 14);


//CHANGE no. of cards; by ADDING NEW CARD TITLE...
var titleStrings = ['Select Location', 'Report Height of Flooding', 'Add Description', 'Review & Submit', 'Terms & Conditions', 'Report Submitted'];
var noOfCards = titleStrings.length - 2; //exclude T&C and Thanks cards
var cardTracker = 1;
var cardVal = ['Location not selected', 'Default height', 'No description provided'];

$(document).ready(function () {

    //Dot markers (tabs) tracking report progress
    for (var i = 1; i <= noOfCards; i++) {
        $('#tabTracker').append(
            $('<button/>').attr({ //TODO: this is better done with id's or classes instead of searching through html
                'class': 'tabBtn',
                'id': 'tab' + i
            })
        );
        if (i != cardTracker) {
            $('#tab' + i).prop('disabled', true);
        }
    }

    $.fn.showCard = function(cardNo) { //TODO: adding functions to someone else's library is a bit iffy
        $('.cardInner').siblings().hide();
        $(this).show();
        $('#cardTitle').html(titleStrings[cardNo - 1]);
    };

    $('#next').click(function () {
        if (cardTracker === 1) {
            $('#prev').prop('disabled', false);
        }
        cardTracker = cardTracker + 1;
        if (cardTracker <= noOfCards) {
          $('#tab' + cardTracker).prop('disabled', false);
        }
        $('#contentCard' + cardTracker).showCard(cardTracker);
        $('#contentCard' + cardTracker).trigger('launch');
        if (cardTracker >= noOfCards) {
            $(this).prop('disabled', true);
        }
    });

    $('#prev').click(function () {
        if (cardTracker === noOfCards) {
            $('#next').prop('disabled', false);
        }
        if (cardTracker <= noOfCards) {
          $('#tab' + cardTracker).prop('disabled', true);
        }
        cardTracker = cardTracker - 1;
        $('#contentCard' + cardTracker).showCard(cardTracker);
        if (cardTracker === 1) {
            $(this).prop('disabled', true);
        }
    });

    //Show screen & card frame
    $('#screen').fadeIn(800);
    $('#cardFrame').fadeIn(400);

    //Show first card
    $('#contentCard' + cardTracker).showCard(cardTracker);
    $('#contentCard' + cardTracker).trigger('launch');

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
    var cardmap = L.map('cardMapWrapper'),
    //TODO: this is super slow (at least on my machine, unclear if we can make faster

        geolocated = false,
        markerPlaced = false,
        gpsLocation,
        center,
        marker,
        markerIcon = L.icon({
            iconUrl: '/svg/marker-11.svg',
            iconSize: [60, 60],
            iconAnchor: [30, 60]
        });

    L.tileLayer('https://api.mapbox.com/styles/v1/mayankojha/ciu43n5ge00bj2ilfv9vazp2e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF5YW5rb2poYSIsImEiOiJfeGl3Y01jIn0.Z3VjUlCe-W63PLsPzY_7Cw', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OSM</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
        minZoom: 10,
        maxZoom: 20
    }).addTo(cardmap);

    cardmap.locate({
        setView: true,
        zoom: 14
        //maxBounds: boundsC //TODO: get rid of commented code
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
    cardmap.once('locationfound', function (e) { //execute once?? find location a few moments later?
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
    cardmap.once('locationerror', function () { //Execute once
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
    });

    //Update picker position & toggle buttons
    cardmap.on('move', function () {
        center = cardmap.getCenter();
        $('#setLocation').prop('disabled', false);
        if (geolocated && center !== gpsLocation) { //TODO: this is really unclear-
            $('#resetLocation').prop('disabled', false);
        }
    });

    $('#setLocation').click(function () {
        if (markerPlaced) {
            cardmap.removeLayer(marker);
        }

        marker = L.marker(center, {
            icon: markerIcon
        }).addTo(cardmap);

        markerPlaced = true;
        $('#setLocation').prop('disabled', true);
        $('#next').prop('disabled', false);

        cardVal[0] = center.lng + " " + center.lat;
    });

    $('#resetLocation').click(function () {
        if (geolocated) {
            cardmap.flyTo(gpsLocation);
        }
        $('#resetLocation').prop('disabled', true);
    });
});


// ***CARD 2*** set height
$('#contentCard2').one('launch', function () { //launch once
    $('#hideZone').mouseenter(function () {
        $('#dragRef').fadeOut('fast');
        $('#dragRef').css('z-index', '1');
        $(this).hide();
        $(this).css('z-index', '2');
    });

    var imgH = 200, //Height of reference image in cm
        startPos,
        dragPos,
        initOff = $('#sliderKnob').offset().top, //top offset
        fillH = $('#waterFill').height(),
        refH = $('#bgImg').height(),
        pressed = false,
        translateVar = -12, //half of height of knob, initial translateY
        stringH = ['Ankle-deep', 'Knee-deep', 'Waist-high', 'Neck-high', 'Above-neck'],
        thresholdH = [-1, 25, 50, 100, 150, imgH],
        HeightInCM = Math.round((fillH * imgH) / refH);

    $('#hText').html(HeightInCM + 'cm');
    cardVal[1] = HeightInCM;

    $('#sliderKnob').mousedown(function (e) {
        startPos = e.pageY;
        pressed = true;
    });

    $('#cardFrame').mousemove(function (e) {
        dragPos = e.pageY;
        HeightInCM = Math.round(((fillH + (startPos - dragPos)) * imgH) / refH);

        if (pressed && HeightInCM >= 0 && HeightInCM <= imgH) {
            $('#sliderKnob').css({
                'transform': 'translateY(' + (translateVar + dragPos - startPos) + 'px)'
            });

            $('#waterFill').height(fillH + (startPos - dragPos) + 'px');
            $('#waterFill').css({
                'background-color': 'rgba(128, 203, 196, ' + (0.1 + (HeightInCM / imgH) * 0.65) + ')' //Opacity range 0.1 to 0.75
            });

            for (var i = 0; i < stringH.length; i = i + 1) {
                if (HeightInCM > thresholdH[i] && HeightInCM <= thresholdH[i + 1]) {
                    $('#hText').html(stringH[i] + ', ' + HeightInCM + 'cm');
                }
            }
        }
    });

    $(document).mouseup(function () {
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

    if (charLength === 0) {
        $('#descripText').val("Enter text here...");

        $('#descripText').one('focus', function () { //jQuery alt for {once: true}
            $(this).val("");
        });
    }

    $('#descripText').keyup(function () {
        charLength = $(this).val().length;
        $('#charRef').text(charLength + "/140");

        if (charLength > 0) {             //will give true for default text also, check...
            cardVal[2] = $('#descripText').val();
        }
    });
});


// ***CARD 4*** summary
$('#contentCard4').on('launch', function () {
    $('#floodH').html('Height of flooding: ' + cardVal[1] + 'cm');

    if (cardVal[2]) {
        $('#comment').html(cardVal[2]);
    }

    /*
    //Use knob as button - easier debugging
    $('#submitKnob').click(function () {
        $('.cardInner').siblings().hide();
        $('#thanks').show();
        $('#thanks').trigger('launch');
    });
    */

    var slideStartPos,
        slideDragPos,
        slideRange = $('#submitSlider').width() - $('#submitKnob').width(),
        slidePressed = false,
        slideThreshold = 0.9, //90%
        slideTranslate = 0;

    $('#submitKnob').mousedown(function (e) {
        slideStartPos = e.pageX;
        slidePressed = true;
    });

    $('#reviewSubmit').mousemove(function (e) {
        slideDragPos = e.pageX;
        slideTranslate = slideDragPos - slideStartPos;
        if (slidePressed && slideTranslate >= 0 && slideTranslate < slideRange) {
            $('#submitKnob').css({
                'left': slideTranslate + 'px'
            });
            $('#submitSlider').css({
                'background-color': 'rgba(0, 149, 136, ' + (slideTranslate / (slideThreshold * slideRange)) + ')'
            });

            if (slideTranslate >= (slideThreshold * slideRange)) { //CODE for SUBMIT BUTTON here...
                var card_id = window.location.pathname.split('/').pop();
                $.put('/report/' + card_id,
                  {location: cardVal[0],
                    water_depth: cardVal[1],
                    text: cardVal[2],
                    created_at: new Date().toISOString()}, function(result) {
                      console.log('Report ID json: ' + result);
                      // if(result > 0){
                      //     console.log('Making getAllReports call');
                      //     $.get('http://localhost:3000/report/confirmedReports/' + 0, null, function(result){
                      //       if(result.statusCode == 200){
                      //         console.log('getAllReports call successful');
                      //       }
                      //       else {
                      //         console.log('getAllReports call failed');
                      //       }
                      //     })
                      // }
                });
                window.location.replace('/');
                cardTracker = cardTracker + 1;
                $('#next').trigger('click');
                /*
                $('.cardInner').siblings().hide();
                $('#thanks').show();
                $('#thanks').trigger('launch');
                */
            }
        }
    });

    $(document).mouseup(function () {
        if (slidePressed && slideTranslate < (slideThreshold * slideRange)) {
            $('#submitKnob').animate({ //Swing back to start position
                'left': 0 + 'px'
            }, 50);
            $('#submitSlider').css({
                'background-color': 'transparent'
            });
        }
        slidePressed = false;
    });

    $('#linkToTandC').click(function () {
        $('#next').trigger('click');
    });
});


// ***Terms & Conditions Card***
$('#contentCard5').on('launch', function () {
    $('#cardTitle').html('Terms &amp; Conditions')
    $('#next').prop('disabled', true);
});


// ***Thank you Card***
$('#contentCard6').on('launch', function () {
    $('#cardTitle').html('Report Submitted')
    $('#next').prop('disabled', true);
    $('#prev').prop('disabled', true);
    $('.tabBtn').css({
        'border': 'none',
        'background-color': 'white',
        'opacity': '0.1'
    });

    //Replace with link to about.htm (petabencana.id), target document...
    //Use delay + trigger event which opens href (eg. proxy <a> tag...?)
    $('#cardFrame').delay(2000).fadeOut(500);
    $('#screen').delay(2000).fadeOut(500);
});
