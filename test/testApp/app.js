'use strict';

/**
  * @file NodeJS App - Reference implementation of CogniCity grasp
  * @copyright (c) Tomas Holderness & Etienne Turpin
  * @license Released under GNU GPLv3 License (see LICENSE)
  */

// Node dependencies
var pg = require('pg'); // database
var logger = require('winston');  // logging
var fs = require('fs');           // file system
var path = require('path');       // directory paths

var config = require('./sample-app-config.js');
var Bot = require('../../index.js');

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

// Start
logger.info("Application starting...");

// GRASP objects
var bot = Bot(config, logger, pg);


// API endpoints
//require('./api')(app, report_card, logger);

// Parse some user input, and return response
bot.ahoy('@nopemartians', 'en', function(err, result){
	console.log('Bot> '+result);
});

// Parse some user input, and return response
bot.parseRequest('@nopemartians', 'Please send me a flood report', 'in', function(err, result){
	console.log('Bot> @nopemartians '+result);
});

bot.confirm(function(err, username, message){
	console.log('Bot> '+message);
});

// Graceful exit
exitWithStatus(0);
