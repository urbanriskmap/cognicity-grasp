'use strict';

// Node requirements
var shortid = require('shortid');

/**
 * A ReportCard object manages requests and receiepts of user reports
 * @constructor
 * @param {object} db Configured instance of database connection from Massive module
 * @param {object} logger Configured instance of logger object from Winston module
 */
var ReportCard = function(
  db,
  logger
){

  this.db = db;
  this.logger = logger;
};

ReportCard.prototype = {

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
   * Private method to generate card id (nested function allows testing)
   */
  _generate_id : function(){
    return shortid.generate();
  },

  /**
   * Create card unique id, register in database, and return value via callback
   * @param {function} callback Callback function to return card id
   */
  issueCard: function(callback){

    var self = this;

    // Create card id
    var _card_id = self._generate_id();

    // Update database
    self.db.issueCard([_card_id], function(err, result){
      if (err){
        self.logger.error('[issueCard] '+ err);
        return;
      }
      else {
        self.db.insertLog([_card_id, 'CARD ISSUED'], function(err, result){
          if (err){
            self.logger.error('[issueCard] '+ err);
            return;
          }
          else {
            // Return card id
            self.logger.info('Issued card '+_card_id);
            callback(_card_id);
          }
        });
      }
    });
  },

  /**
   * Create card unique id, register in database, and return value via callback
   * @param {card_id} string Card id
   */
  checkCardStatus: function(card_id, callback){
     var self = this;
     if (shortid.isValid(card_id)){
       self.db.checkCardStatus([card_id], function(err, result){
         if (err) {
           self.logger.error('[checkCardStatus] '+ err);
           return;
         }
         else if (result[0]){
           self.logger.info('Checked card '+card_id+' - valid');
           callback(result[0]);
         }
         else {
           self.logger.info('Checked card '+card_id+' - invalid');
           callback({received : 'invalid'});
         }
       });
     }
     else {
       self.logger.info('Checked card '+card_id+' - invalid');
       callback({received : 'invalid'});
     }
   }
};

module.exports = ReportCard;
