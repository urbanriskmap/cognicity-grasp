'use strict';
// Node modules
var test = require('unit.js');
// Test moduke
var ReportCard = require('../ReportCard');

// Create grasp object with empty objects
// Mock objects as required for each test suite
var report_card = new ReportCard(
                  {},
                  {},
                  {}
);

// Test harness for CognicityGrasp object
describe( 'ReportCard', function(){

  // Test suite for issueCard function
  describe( 'Succesful issueCard', function(){

    // Mock functions
    var oldDBIssueCard, oldDBInsertLog, oldGenerateID, oldLoggerInfo;
    var cardDBvalue, logDBvalue, loggerValue = 0;
    before (function(){
        oldDBIssueCard = report_card.db.issueCard;
        report_card.db.issueCard = function(param_dict, callback){
          cardDBvalue = param_dict[0];
          callback(0, 'data');
        };
        oldDBInsertLog = report_card.db.insertLog;
        report_card.db.insertLog = function(param_dict, callback){
          logDBvalue = param_dict
          callback(0, 'log')
        };
        oldGenerateID = report_card.issueCard._generate_id;
        report_card._generate_id = function(){return 'ABC1234'};

        oldLoggerInfo = report_card.logger.info;
        loggerValue = 0;
        report_card.logger.info = function(message){
          loggerValue = message;
        }
    });

    // Test
    it ('Returns correct card id ', function(){
      report_card.issueCard(function(result){
        test.value(result).is('ABC1234');
      });
    });

    it ('Sends correct card id to database card table', function(){
      report_card.issueCard(function(result){
        test.value(cardDBvalue).is('ABC1234');
      });
    });

    it ('Sends correct card data to database log table', function(){
      report_card.issueCard(function(result){
        test.value(logDBvalue[0]).is('ABC1234');
        test.value(logDBvalue[1]).is('CARD ISSUED');
      });
    });

    // Retore mocked items
    after (function(){
      report_card.db.issueCard = oldDBIssueCard;
      report_card.db.insertLog = oldDBInsertLog;
      report_card._generate_id = oldGenerateID;
      report_card.logger.info = oldLoggerInfo;
    });

    // test logger values if data
  });

  // Test suite for issueCard function
  describe( 'Catch issueCard database errors', function(){

    // Mock functions
    var oldDBIssueCard, oldDBInsertLog, oldGenerateID, oldLoggerError;
    var cardDBvalue, logDBvalue, loggerValue = 0;
    before (function(){
        oldDBIssueCard = report_card.db.issueCard;
        report_card.db.issueCard = function(param_dict, callback){
          cardDBvalue = param_dict[0];
          callback(1, 'data');
        };
        oldDBInsertLog = report_card.db.insertLog;
        report_card.db.insertLog = function(param_dict, callback){
          logDBvalue = param_dict
          callback(0, 'log')
        };
        oldGenerateID = report_card.issueCard._generate_id;
        report_card._generate_id = function(){return 'ABC1234'};

        oldLoggerError = report_card.logger.error;
        loggerValue = 0;
        report_card.logger.error = function(message){
          loggerValue = message;
        }
    });

    // Test
    it ('Returns correct card id ', function(){
      report_card.issueCard(function(result){
        test.value(loggerValue).is('[issueCard] 1');
      });
    });

    // Retore mocked items
    after (function(){
      report_card.db.issueCard = oldDBIssueCard;
      report_card.db.insertLog = oldDBInsertLog;
      report_card._generate_id = oldGenerateID;
      report_card.logger.error = oldLoggerError;
    });
  });
  // Test suite for issueCard function
  describe( 'Catch insertLog database errors', function(){

    // Mock functions
    var oldDBIssueCard, oldDBInsertLog, oldGenerateID, oldLoggerError;
    var cardDBvalue, logDBvalue, loggerValue = 0;
    before (function(){
        oldDBIssueCard = report_card.db.issueCard;
        report_card.db.issueCard = function(param_dict, callback){
          cardDBvalue = param_dict[0];
          callback(0, 'data');
        };
        oldDBInsertLog = report_card.db.insertLog;
        report_card.db.insertLog = function(param_dict, callback){
          logDBvalue = param_dict
          callback(2, 'log')
        };
        oldGenerateID = report_card.issueCard._generate_id;
        report_card._generate_id = function(){return 'ABC1234'};

        oldLoggerError = report_card.logger.error;
        loggerValue = 0;
        report_card.logger.error = function(message){
          loggerValue = message;
        }
    });

    // Test
    it ('Returns correct card id ', function(){
      report_card.issueCard(function(result){
        test.value(loggerValue).is('[issueCard] 2');
      });
    });

    // Retore mocked items
    after (function(){
      report_card.db.issueCard = oldDBIssueCard;
      report_card.db.insertLog = oldDBInsertLog;
      report_card._generate_id = oldGenerateID;
      report_card.logger.error = oldLoggerError;
    });
  });
});
