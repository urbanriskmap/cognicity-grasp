'use strict';

// index.js - cognicity-grasp module (Geosocial Rapid Assessment Platform)

/**
  * @file NodeJS app for report collection and REST service
  * @copyright (c) Tomas Holderness & Etienne Turpin
  * @license Released under GNU GPLv3 License (see LICENSE)
  */

// Node dependencies
var Massive = require('massive');
var express = require('express');

// Connect to database
var db = Massive.connectSync({db: "cognicity_grasp"});

// Init express app
var app = express();

// Grasp object
var CognicityGrasp = require('./CognicityGrasp');

var config = {};
var logger = {};
var exitWithStatus = function(err){console.log(err);};

var grasp = new CognicityGrasp(config, db, logger, exitWithStatus);

grasp.issueCard(function(result){console.log(result);});

//grasp.checkCardStatus('1', function(result){console.log(result[0]);});

// Routes
app.get('/report/:card_id', function(req, res, next){
    grasp.checkCardStatus(req.params.card_id, function(result){
    if ( result.received === false){
      res.send('Success - proceed with report');
    }
    else if (result.received === true){
      res.send('Error - report already received');
    }
    else {
      res.send('Error - report card id invalid');
    }
  });
});


app.listen(3000, function(){
  console.log('express listening');
});
