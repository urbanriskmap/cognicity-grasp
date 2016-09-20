'use strict';
// Node modules
var test = require('unit.js');
// Test moduke
var CognicityGrasp = require('../CognicityGrasp');

// Create grasp object with empty objects
// Mock objects as required for each test suite
var grasp = new CognicityGrasp(
                  {},
                  {},
                  {},
                  {}
);

// Test harness for CognicityGrasp object
describe( 'CognicityGrasp', function(){

  // Test suite for issueCard function
  describe( 'Succesful issueCard', function(){

    // Mock functions
    var oldDBIssueCard, oldDBInsertLog, oldGenerateID, oldLoggerInfo;
    var cardDBvalue, logDBvalue, loggerValue = 0;
    before (function(){
        oldDBIssueCard = grasp.db.issueCard;
        grasp.db.issueCard = function(param_dict, callback){
          cardDBvalue = param_dict[0];
          callback(0, 'data');
        };
        oldDBInsertLog = grasp.db.insertLog;
        grasp.db.insertLog = function(param_dict, callback){
          logDBvalue = param_dict
          callback(0, 'log')
        };
        oldGenerateID = grasp.issueCard._generate_id;
        grasp._generate_id = function(){return 'ABC1234'};

        oldLoggerInfo = grasp.logger.info;
        loggerValue = 0;
        grasp.logger.info = function(message){
          loggerValue = message;
        }
    });

    // Test
    it ('Returns correct card id ', function(){
      grasp.issueCard(function(result){
        test.value(result).is('ABC1234');
      });
    });

    it ('Sends correct card id to database card table', function(){
      grasp.issueCard(function(result){
        test.value(cardDBvalue).is('ABC1234');
      });
    });

    it ('Sends correct card data to database log table', function(){
      grasp.issueCard(function(result){
        test.value(logDBvalue[0]).is('ABC1234');
        test.value(logDBvalue[1]).is('CARD ISSUED');
      });
    });

    // Retore mocked items
    after (function(){
      grasp.db.issueCard = oldDBIssueCard;
      grasp.db.insertLog = oldDBInsertLog;
      grasp._generate_id = oldGenerateID;
      grasp.logger.info = oldLoggerInfo;
    });

    // test logger values if data
  });

  // Test suite for issueCard function
  describe( 'Catch issueCard database errors', function(){

    // Mock functions
    var oldDBIssueCard, oldDBInsertLog, oldGenerateID, oldLoggerError;
    var cardDBvalue, logDBvalue, loggerValue = 0;
    before (function(){
        oldDBIssueCard = grasp.db.issueCard;
        grasp.db.issueCard = function(param_dict, callback){
          cardDBvalue = param_dict[0];
          callback(1, 'data');
        };
        oldDBInsertLog = grasp.db.insertLog;
        grasp.db.insertLog = function(param_dict, callback){
          logDBvalue = param_dict
          callback(0, 'log')
        };
        oldGenerateID = grasp.issueCard._generate_id;
        grasp._generate_id = function(){return 'ABC1234'};

        oldLoggerError = grasp.logger.error;
        loggerValue = 0;
        grasp.logger.error = function(message){
          loggerValue = message;
        }
    });

    // Test
    it ('Returns correct card id ', function(){
      grasp.issueCard(function(result){
        test.value(loggerValue).is('[issueCard] 1');
      });
    });

    // Retore mocked items
    after (function(){
      grasp.db.issueCard = oldDBIssueCard;
      grasp.db.insertLog = oldDBInsertLog;
      grasp._generate_id = oldGenerateID;
      grasp.logger.error = oldLoggerError;
    });
  });
  // Test suite for issueCard function
  describe( 'Catch insertLog database errors', function(){

    // Mock functions
    var oldDBIssueCard, oldDBInsertLog, oldGenerateID, oldLoggerError;
    var cardDBvalue, logDBvalue, loggerValue = 0;
    before (function(){
        oldDBIssueCard = grasp.db.issueCard;
        grasp.db.issueCard = function(param_dict, callback){
          cardDBvalue = param_dict[0];
          callback(0, 'data');
        };
        oldDBInsertLog = grasp.db.insertLog;
        grasp.db.insertLog = function(param_dict, callback){
          logDBvalue = param_dict
          callback(2, 'log')
        };
        oldGenerateID = grasp.issueCard._generate_id;
        grasp._generate_id = function(){return 'ABC1234'};

        oldLoggerError = grasp.logger.error;
        loggerValue = 0;
        grasp.logger.error = function(message){
          loggerValue = message;
        }
    });

    // Test
    it ('Returns correct card id ', function(){
      grasp.issueCard(function(result){
        test.value(loggerValue).is('[issueCard] 2');
      });
    });

    // Retore mocked items
    after (function(){
      grasp.db.issueCard = oldDBIssueCard;
      grasp.db.insertLog = oldDBInsertLog;
      grasp._generate_id = oldGenerateID;
      grasp.logger.error = oldLoggerError;
    });
  });
});
