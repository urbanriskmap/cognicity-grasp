'use strict';

// Node requirements
var shortid = require('shortid');


/**
 * A CognicityGrasp object manages requests and receiepts of user reports
 * @constructor
 * @param {object} config Configuration object
 * @param {object} db Configured instance of database connection from Massive module
 * @param {object} logger Configured instance of logger object from Winston module
 * @param {function} exitWithStatus Function to exit the process with the status code
 */
var CognicityGrasp = function(
  config,
  db,
  logger,
  exitWithStatus
){

  this.config = config;
  this.db = db;
  this.logger = logger;
  this.exitWithStatus = exitWithStatus;
};

CognicityGrasp.prototype = {

  /**
   * Configuration object
   * @type {config}
   */
   config: null,

  /**
   * Configured instance of pg object from pg module
   * @type {object}
   */
   db: null,

 /**
  * Configured instance of logger object from Winston module
  * @type {object}
  */
  logger: null,

 /**
  * Function to exit the process with the supplied status code
  * @type {function}
  */
  exitWithStatus: null,


  /**
   * Create card unique id, register in database, and return value via callback
   * @param {function} success Callback function to return card id
   */
  issueCard: function(callback){

    var self = this;

    // Create card id
    var _card_id = shortid.generate();

    // Update database
    self.db.issueCard([_card_id], function(err, result){
      if (err){
        console.log(err);
        return;
      }
      else {
        self.db.insertLog([_card_id, 'CARD ISSUED'], function(err, result){
          if (err){
            console.log(err);
            return;
          }
          else {
            // Return card id
            callback(_card_id);
          }
        });
      }
    });
  }
};

module.exports = CognicityGrasp;
