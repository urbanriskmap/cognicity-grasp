'use strict';

// config.js - Configuration for cognicity-server

var config = {};

// Instance name - default name for this configuration (will be server process name)
config.instance = 'sample-reports-app';

// Postgres database connection
config.pg = {};

// Example postgres string for running on localhost
// config.pg.conString = 'postgres://postgres@localhost/cognicity';

/* Sample connection string using environment variables from AWS Elastic Beanstalk. */
config.pg.conString = 'postgres://postgres@127.0.0.1:5432/cognicity_grasp?ssl=false';
/*	On other platforms you would replace those variables as necessary
*/

// Database reconnection settings
config.pg.reconnectionDelay = 1000 * 60 * 3; // Delay before attempting a reconnection in ms
config.pg.reconnectionAttempts = 5; // Number of times to attempt reconnection before notifying admin and exiting

// Logging configuration
config.logger = {};
config.logger.level = "debug"; // What level to log at; info, verbose or debug are most useful. Levels are (npm defaults): silly, debug, verbose, info, warn, error.
config.logger.maxFileSize = 1024 * 1024 * 100; // Max file size in bytes of each log file; default 100MB
config.logger.maxFiles = 10; // Max number of log files kept
config.logger.logDirectory = './'; // Set this to a full path to a directory - if not set logs will be written to the application directory.

module.exports = config;
