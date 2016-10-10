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
  config,
  pg,
  logger
){
  this.config = config;
  this.pg = pg;
  this.logger = logger;
};

ReportCard.prototype = {

  /**
   * Configuration object
   * @type {config}
   */
   config: null,

  /**
   * Instance of pg object from pg module
   * @type {object}
   */
   pg: null,

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
   * DB query success callback
   * @callback DbQuerySuccess
   * @param {object} result The 'pg' module result object on a successful query
   */

	/**
	 * Perform a query against the database using the parameterized query in the queryObject.
	 * Call the callback with error information or result information.
	 *
	 * @param {object} queryObject Query object for parameterized postgres query
	 * @param {string} queryObject.text The SQL query text for the parameterized query
	 * @param {Array} queryObject.values Values for the parameterized query
	 * @param {DataQueryCallback} callback Callback function for handling error or response data
	 */
	dbQuery: function(queryObject, callback){
		var self = this;

		self.logger.debug( "dataQuery: queryObject=" + JSON.stringify(queryObject) );

		self.pg.connect(self.config.pg.conString, function(err, client, done){
			if (err){
				self.logger.error("dataQuery: " + JSON.stringify(queryObject) + ", " + err);
				done();
				callback( new Error('Database connection error') );
				return;
			}

			client.query(queryObject, function(err, result){
				if (err){
					done();
					self.logger.error( "dataQuery: Database query failed, " + err.message + ", queryObject=" + JSON.stringify(queryObject) );
					callback( new Error('Database query error') );
				} else if (result && result.rows){
					self.logger.debug( "dataQuery: " + result.rows.length + " rows returned" );
					done();
					callback(null, result.rows);
				} else {
					// TODO Can we ever get to this point?
					done();
					callback( new Error('Unknown query error, queryObject=' + JSON.stringify(queryObject)) );
				}
			});
		});
  },

  /**
   * Create card unique id, register in database, and return value via callback
   * @param {string} username Unique username requesting card (e.g. @user)
   * @param {string} network Name of user social messaging network (e.g. Twitter)
   * @param {function} callback Callback function to return card id
   */
  issueCard: function(username, network, callback){

    var self = this;

    // Create card id
    var _card_id = self._generate_id();

    self.dbQuery(
      {
      text: "INSERT INTO grasp_cards (card_id, username, network, received) VALUES ($1, $2, $3, FALSE);",
      values: [ _card_id, username, network ]
      },
      function(err, result){
        if (err){
          self.logger.error(err);
          callback(err, null);
        }
        else {
          self.dbQuery(
            {
              text: "INSERT INTO grasp_log (card_id, event_type) VALUES ($1, $2);",
              values: [ _card_id, "CARD ISSUED"]
            },
            function(err, result){
              if (err){
                self.logger.error(err);
                callback(err, null);
              }
              else {
                self.logger.info('Issued card '+_card_id);
                callback(err, _card_id);
              }
            }
          );
        }
      }
    );
  },

  /**
   * Create card unique id, register in database, and return value via callback
   * @param {card_id} string Card id
   */
  checkCardStatus: function(card_id, callback){
     var self = this;
     if (shortid.isValid(card_id)){
       self.dbQuery(
         {
         text: "SELECT received FROM grasp_cards WHERE card_id = $1;",
         values : [ card_id ]
        },
        function(err, result){
          if (err){
            self.logger.error(err);
            callback(err, null);
          }
          else if (result[0].received === false){
            self.logger.info('Checked card '+card_id+' - valid');
            callback(err, result[0]);
          }
          else {
            self.logger.info('Checked card '+card_id+' - already completed');
            callback(err, {received : 'invalid'});
          }
        }
      );
     }
     else {
       self.logger.info('Checked card '+card_id+' - invalid');
       callback(err, {received : 'invalid'});
     }
   }
};

module.exports = ReportCard;
