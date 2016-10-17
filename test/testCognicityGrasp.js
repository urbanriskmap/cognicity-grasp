'use strict';
// Node modules
var test = require('unit.js');
var shortid = require('shortid');
// Test modules
var ReportCard = require('../ReportCard');
var Bot = require('../Bot');

// Create grasp object with empty objects
// Mock objects as required for each test suite
var report_card = new ReportCard(
                  {},
                  {},
                  {}
);

var bot = new Bot(
                {
                  regex: /\breport|alerts\b/i
                },
                {},
                {}
);

// Test harness for ReportCard object
describe( 'ReportCard', function(){

  // Test suite for issueCard function
  describe( 'Succesful issueCard', function(){

    // Mock functions
    var old_insertCard, old_generateID;
    var fail_database = 0;
    before (function(){
        // insert into report card table
        old_insertCard = report_card._insertCard;
        report_card._insertCard = function(card_id, username, network, language, callback){
          if (fail_database === 0){
            callback(null, card_id);
          }
          else {
            callback(1, null);
          }
        };
        // generate onetime link
        old_generateID = report_card._generate_id;
        report_card._generate_id = function(){
          return('ABC1234');
        };
    });

    // Test return card id
    it ('Returns correct card id ', function(){
      report_card.issueCard('username', 'network', 'language', function(err, card_id){
        test.value(card_id).is('ABC1234');
      });
    });

    it ('Catches database error with _insertCard', function(){
      fail_database = 1;
      report_card.issueCard('username', 'network', 'language', function(err, card_id){
        test.value(err).is(1);
      });
    });
    after (function(){
      fail_database = 0;
      report_card._generate_id = old_generateID;
      report_card.issueCard = old_insertCard;
    });
  });

  // Test suite for checkCardStatus function
  describe( 'Succesful checkCardStatus', function(){
    var old_shortidIsValid, old_loggerDebug, old_loggerInfo, old_dbQuery, isValid = false;

    before(function(){
      old_shortidIsValid = shortid.isValid;
      shortid.isValid = function(){
        if (isValid === true){
          return (true);
        }
        else {
          return (false);
        }
      }
      old_loggerDebug = report_card.logger.debug;
      report_card.logger.debug = function(value){
        console.log('Mocked logger [debug]: '+value);
      };
      old_loggerInfo = report_card.logger.info;
      report_card.logger.info = function(value){
        console.log('Mocked logger [info]: '+value);
      };
      old_dbQuery = report_card.dbQuery;
    })
    it ('Catches invalid card id', function(){
      isValid = false;
      report_card.checkCardStatus('123', function(err, value){
        test.value(value).is({received : 'invalid'});
      })
    });
    /*
    it ('Filters a succesful result from _checkCardStatus', function(){
      isValid = true;
      report_card.dbQuery = function(object, callback){
        var result = [{received : 123}]
        return (null, result);
      }
      report_card.checkCardStatus('123', function(err, value){
        test.value(value.received).is(false);
      });
    });
    it ('Catches database error for _checkCardStatus', function(){
      isValid = true;
      report_card.dbQuery = function(object, callback){
        return(1, null);
      }
      report_card.checkCardStatus('123', function(err, value){
        test.value(err).is(1);
      });
    });
    */


  });

});
    /*
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
    var cardDBvalue, logDBvalue, loggerValue;
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
    var cardDBvalue, logDBvalue, loggerValue;
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

// Test harness for CognicityGrasp object
describe( 'Bot', function(){
  // Test suite for issueCard function
  describe( 'Succesfully parse input', function(){
    var oldissueCard = bot.report_card.issueCard;
    var oldLoggerInfo = bot.logger.info;
    var report_card_return_value;
    var loggerValue;
    before (function(){
      bot.report_card.issueCard = function(callback){
        report_card_return_value = 0;
      };
      bot.logger.info = function(message){
        loggerValue = message;
      }
    });
    it ('No card requested if keyword not found', function(){
      bot.parse('spam', function(){});
      test.value(loggerValue).is('Bot could not detect a keyword');
    });
    it ( 'Detects keyword, and requests card', function(){
      bot.parse('report', function(){});
      test.value(report_card_return_value).is(0);
      test.value(loggerValue).is('Bot requesting issue of card');
    });
    after (function(){
      bot.report_card.issueCard = oldissueCard;
      bot.logger.info = oldLoggerInfo;
    });
  });
});*/
