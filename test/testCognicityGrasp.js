'use strict';
// Node modules
var test = require('unit.js');
var shortid = require('shortid');
// Test modules
var ReportCard = require('../ReportCard');
var Bot = require('../Bot');

var config = require('../sample-grasp-config');
var dialogue = require('../sample-bot-dialogue');

// Create grasp object with empty objects
// Mock objects as required for each test suite
var report_card = new ReportCard(
                  {},
                  {},
                  {}
);

var bot = new Bot(config.bot, dialogue, {}, {});

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
    var old_shortidIsValid, old_loggerDebug, old_loggerInfo, old_loggerError, old_dbQuery, isValid = false;

    before(function(){
      old_shortidIsValid = shortid.isValid;
      shortid.isValid = function(){
        if (isValid === true){
          return (true);
        }
        else {
          return (false);
        }
      };
      old_loggerDebug = report_card.logger.debug;
      report_card.logger.debug = function(value){
        console.log('Mocked logger [debug]: '+value);
      };
      old_loggerInfo = report_card.logger.info;
      report_card.logger.info = function(value){
        console.log('Mocked logger [info]: '+value);
      };
      old_loggerError = report_card.logger.error;
      report_card.logger.error = function(value){
        console.log('Mocked logger [error]: '+value);
      };
      old_dbQuery = report_card.dbQuery;
    });
    it ('Catches invalid card id', function(){
      isValid = false;
      report_card.checkCardStatus('123', function(err, value){
        test.value(err).is(null);
        test.value(value).is({received : null});
      });
    });

    it ('Filters a false result from _checkCardStatus', function(){
      isValid = true;
      report_card.dbQuery = function(object, callback){
        callback(null, [{received : false}]);
      };
      report_card.checkCardStatus('123', function(err, value){
        test.value(err).is(null);
        test.value(value.received).is(false);
      });
      report_card.dbQuery = old_dbQuery;
    });

    it ('Filters a true result from _checkCardStatus ', function(){
      isValid = true;
      report_card.dbQuery = function(object, callback){
        callback(null, [{received : true}]);
      };
      report_card.checkCardStatus('123', function(err, value){
        test.value(err).is(null);
        test.value(value.received).is(true);
      });
      report_card.dbQuery = old_dbQuery;
    });

    it ('Filters an invalid result from _checkCardStatus ', function(){
      isValid = true;
      report_card.dbQuery = function(object, callback){
        callback(null, []);
      };
      report_card.checkCardStatus('123', function(err, value){
        test.value(err).is(null);
        test.value(value.received).is(null);
      });
      report_card.dbQuery = old_dbQuery;
    });

    it ('Catches database error for _checkCardStatus', function(){
      isValid = true;
      report_card.dbQuery = function(object, callback){
        callback(new Error('Database query error'));
      };
      report_card.checkCardStatus('123', function(err, value){
        test.value(err).is(Error());
        test.value(value).is(null);
      });
    });
  });
});

// TODO test for confirm method
// Test harness for CognicityGrasp object
describe( 'Bot', function(){
  var old_loggerError, old_loggerInfo, old_bot_requestCard;
  before(function(){
    old_loggerError = bot.logger.error;
    bot.logger.error = function(value){
      console.log('Mocked logger [error]: '+value);
    };
    old_loggerInfo = bot.logger.info;
    bot.logger.info = function(value){
      console.log('Mocked logger [error]: '+value);
    };
    old_bot_requestCard = bot._requestCard;
    bot._requestCard = function(username, network, language, callback){
      return callback(null, 'Correct response');
    };
  });
  // Test suite for issueCard function
  describe( 'getsDialogue', function(){
    it ('Falls back on default language if not found in dialogue', function(){
      bot.config.default_language = 'en';
      var text = {cards:{en:'card text'}};
      test.value(bot._getDialogue(text.cards, 'de')).is('card text');
    });
  });
  describe( 'cardAddress', function(){
    it ('Catches error with card_url_prefix', function(){
      bot.config.card_url_prefix = null;
      bot._cardAddress(123, function(err, value){
        test.value(err).is('[cardAddress] No card url prefix specified');
      });
    });
    it ('Returns correct card address', function(){
      bot.config.card_url_prefix = 'prefix';
      bot._cardAddress(123, function(err, value){
        test.value(value).is('prefix/123');
      });
    });
  });
  describe ( ' parseRequest ', function(){
    it ('detects no keywords, and calls ahoy', function(){
      bot.parseRequest('user', 'no keywords here', 'en', function(err, value){
          test.value(value).is(bot.dialogue.ahoy.en);
      });
    });
    it ('Detects "banjir" and returns correct response', function(){
      bot.parseRequest('user', 'banjir', 'en', function(err, value){
        test.value(value).is('Correct response');
      });
    });
    it ('Detects "flood" and returns correct response', function(){
      bot.parseRequest('user', 'banjir', 'en', function(err, value){
        test.value(value).is('Correct response');
      });
    });
  });
  after(function(){
    bot.logger.error = old_loggerError;
    bot.logger.info = old_loggerInfo;
  });
});
