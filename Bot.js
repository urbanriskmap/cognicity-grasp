'use strict';

// Human keywords/endpoints
// 1) Report
// 2) Alerts
// 3) Subscribe
// 4) Unsubscribe

/**
 * A bot object manages conversation with users
 * @constructor
 * @param {object} config Configuration object
 * @param {object} ReportCard CogniCity Report Card object
 * @param {object} logger Configured instance of logger object from Winston module
 * @param {function} exitWithStatus Function to exit the process with the status code
 */
var Bot = function(
  config,
  report_card,
  logger,
  exitWithStatus
){

  this.config = config;
  this.report_card = report_card;
  this.logger = logger;
  this.exitWithStatus = exitWithStatus;
};




Bot.prototype = {

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

    parse: function(words, callback){

      var self = this;

      switch (words.match(/\breport\b/i)){
        case  null:
          self.logger.info('Bot could not detect a keyword');
          break;
        default:
          self.logger.info('Bot requesting issue of card');
          self.report_card.issueCard(callback);
          // do we need a return here?
      }
    }
};

module.exports = Bot;
