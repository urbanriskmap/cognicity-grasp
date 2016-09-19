'use strict';

// index.js - cognicity-grasp module (Geosocial Rapid Assessment Platform)

/**
  * @file NodeJS app for report collection and REST service
  * @copyright (c) Tomas Holderness & Etienne Turpin
  * @license Released under GNU GPLv3 License (see LICENSE)
  */

// Node dependencies
var Massive = require('massive');

// Connect to database
var db = Massive.connectSync({db: "cognicity_grasp"});

var CognicityGrasp = require('./CognicityGrasp');

var config = {};
var logger = {};
var exitWithStatus = function(err){console.log(err);};

var grasp = new CognicityGrasp(config, db, logger, exitWithStatus);

grasp.issueCard(function(result){console.log(result);});
