'use strict';

// index.js - cognicity-grasp module (Geosocial Rapid Assessment Platform)

/**
  * @file NodeJS app for report collection and REST service
  * @copyright (c) Tomas Holderness & Etienne Turpin
  * @license Released under GNU GPLv3 License (see LICENSE)
  */

// Node dependencies
var Massive = require('massive'); // database
var express = require('express'); // web
var logger = require('winston');  // logging
var fs = require('fs');           // file system
var path = require('path');       // directory paths

// Config object
var config = {
  logger : {
    logDirectory : null,
    filename : 'cognicity-grasp',
    maxFileSize : 1024 * 1024 * 100,
    maxFiles : 10,
    level : 'debug'
  }
};

// Logging configuration
var logPath = ( config.logger.logDirectory ? config.logger.logDirectory : __dirname );
// Check that log file directory can be written to
try {
	fs.accessSync(logPath, fs.W_OK);
} catch (e) {
	console.log( "Log directory '" + logPath + "' cannot be written to"  );
	throw e;
}
logPath += path.sep;
logPath += config.logger.filename + ".log";

// Setup logger
logger
	// Configure custom File transport to write plain text messages
	.add(logger.transports.File, {
		filename: logPath, // Write to projectname.log
		json: false, // Write in plain text, not JSON
		maxsize: config.logger.maxFileSize, // Max size of each file
		maxFiles: config.logger.maxFiles, // Max number of files
		level: config.logger.level // Level of log messages
	});
	// Console transport is no use to us when running as a daemon
  //.remove(logger.transports.Console); (commented for dev)

// FIXME This is a workaround for https://github.com/flatiron/winston/issues/228
// If we exit immediately winston does not get a chance to write the last log message.
// So we wait a short time before exiting.
function exitWithStatus(exitStatus) {
	logger.info( "Exiting with status " + exitStatus );
	setTimeout( function() {
		process.exit(exitStatus);
	}, 500 );
}

logger.info("Application starting...");

// Connect to database
var db = Massive.connectSync({db: "cognicity_grasp"});

// Init express app
var app = express();

// Grasp object
var ReportCard = require('./ReportCard');
var Bot = require('./Bot');

var report_card = new ReportCard(config, db, logger, exitWithStatus);
var bot = new Bot(config, report_card, logger, exitWithStatus);
//report_cardissueCard(function(result){console.log(result);});
bot.parse('Report', function(result){console.log(result)});

// Routes
/*
app.get('/report/:card_id', function(req, res, next){
    report_card.checkCardStatus(req.params.card_id, function(result){
    if ( result.received === false){
      res.send('Success - proceed with report');
      logger.debug('[/report/:card_id] Approved access for card '+req.params.card_id);
    }
    else if (result.received === true){
      res.send('Error - report already received');
      logger.debug('[/report/:card_id] Rejected access for card '+req.params.card_id+ '- already received');
    }
    else {
      res.send('Error - report card id invalid');
      logger.debug('[/report/:card_id] Rejected access for card '+req.params.card_id+ '- invalid');
    }
  });
});

app.listen(3000, function(){
  logger.info('Express listening');
});*/
