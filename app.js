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
var express = require('express'); // web
var bodyParser = require('body-parser'); // web body parse

// Grasp objects
// TODO: put this in config file
var frontEndOnly = false;
if (frontEndOnly){
  var ReportCard = require('./mockReportCard');
} else {
  var ReportCard = require('./ReportCard');
}
var Bot = require('./Bot');

// Local config
var config = require('./sample-grasp-config');
var dialogue = require('./sample-bot-dialogue');

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
var report_card = new ReportCard(config, pg, logger);
var bot = new Bot(config.bot, dialogue, report_card, logger);

// Configure example server user express
var app = express();
app.use(bodyParser.json());

app.use("/", express.static(__dirname + '/public/'));
app.use("/css", express.static(__dirname + '/public/css'));
app.use("/img", express.static(__dirname + '/public/img'));
app.use("/js", express.static(__dirname + '/public/js'));
app.use("/svg", express.static(__dirname + '/public/svg'));
app.use("/vendor/css", express.static(__dirname + '/vendor/css'));
app.use("/vendor/js", express.static(__dirname + '/vendor/js'));
app.use("/test", express.static(__dirname + '/test'));
// Listen for report card requests
app.listen(3000, function(){
    logger.info('Express listening on port 3000');
});
// API endpoints
require('./api')(app, report_card, logger);

// Parse some user input, and return response
bot.parse('@nopemartians', 'Hi Bot!', 'en', function(err, result){
	console.log('Bot> '+result);
});

// Parse some user input, and return response
bot.parse('@nopemartians', 'Please send me a report', 'en', function(err, result){
	console.log('Bot> @nopemartians '+result);
});

bot.received(function(err, username, message){
	console.log('Bot> '+message);
});

// Graceful exit
process.on('SIGINT', function(){
	exitWithStatus(0);
});
