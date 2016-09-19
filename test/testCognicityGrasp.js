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

  // Mock short function
  global.shortid = {
    generate: function(){return 'ABC123'}
  }

  // Test suite for issueCard function
  describe( 'issueCard', function(){

    var oldGraspDBissueCard;


    it ('Returns correct card id ', function(){
      grasp.issueCard(function(result){
        test.value(result).is('ABC123');
      });
    });


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
    });

  });
});
