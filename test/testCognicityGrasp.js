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
  describe( 'issueCard', function(){

    // Mock functions
    var oldDBIssueCard, oldDBInsertLog, oldGenerateID;
    var cardDBvalue, logDBvalue = 0;
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
        grasp._generate_id = function(){return 'ABC1234'}
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
    });

    // test logger values if data
    /*
    before( function(){
      oldGraspDBissueCard = grasp.db.issueCard;
      // Mock database functions
      grasp.db.issueCard = function(){
        var err = 'test error'
        return err;
      };
    });
    it ('Catches issueCard query error', function(){
      grasp.issueCard(function(result){
        test.value(result).is('ABC123');
      });
    });
    after (function(){
      grasp.db.issueCard = oldGraspDBissueCard;
    });*/

  });
});
