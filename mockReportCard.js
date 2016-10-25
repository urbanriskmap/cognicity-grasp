'use strict';

// Node requirements
var shortid = require('shortid');

var test_card_id = 'rcardtest'; 

/**
 * A mock ReportCard object for testing and front end development 
 * is only aware of one card, and one user
 * card id is rcardtest 
 * @constructor
 * @param {object} db null- no database is used in this mock
 * @param {object} logger Configured instance of logger object from Winston module
 */
var ReportCard = function(
  config,
  pg,
  logger
){
  this.config = config;
  this.pg = null;
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
   * left null in the mock 
   * @type {object}
   */
   pg: null,

   /**
    * Configured instance of logger object from Winston module
    * @type {object}
    */
    logger: null,

   /**
    * Whether our single test card has been inserted yet 
    * @type {object}
    */
    received: null, 

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
  issueCard: function(username, network, language, callback){

    var self = this;

    // Create card id
    var _card_id = test_card_id; 
    self.received = false; 

    self.logger.info('Issued mock testing card '+_card_id);
    callback(null, _card_id);
  },

  /**
   * Returns result.received === true if the card has already been 
   * submitted. Returns callback(err != null) if the card is invalid
   * @param {card_id} string Card id
   */
  checkCardStatus: function(card_id, callback){
     var self = this;

     if (card_id === test_card_id){
       self.logger.debug('Checked card status =' + self.received); 
       callback(null, {received: self.received}); 
     }
     else {
       self.logger.info('Checked card '+card_id+' - invalid');
       callback(null, {received : 'invalid'});
     }
   },

   // Switches the status to recieved 
   insertReport: function(card_id, report_object){
     var self = this;
     self.logger.info("Got insert report call to mockReportcard"); 
     if (self.received === true){
       self.logger.err("Attempted to insert a card that has already been registered in mockReportcard"); 
     }
     self.received = true; 

   },

   // Watch table
   // returns our single card 
   watchCards: function(network, callback){

     var self = this;
     self.logger.info("Got a watchcards notification in mockReportCard"); 
     //TODO: send a mock report object- 
     //Flattent out mockReportCard and send that for testing 
     var report = {username: 'testusername'};
     callback(null, report); 

   }
};

module.exports = ReportCard;
