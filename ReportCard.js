'use strict';

// Node requirements
var shortid = require('shortid');
var string = require('string');

/**
 * A ReportCard object manages requests and receiepts of user reports
 * @constructor
 * @param {object} db Configured instance of database connection from Massive module
 * @param {object} logger Configured instance of logger object from Winston module
 */
var ReportCardBot = function(
  config,
  pg,
  logger
){
  this.config = config;
  this.pg = pg;
  this.logger = logger;
};

ReportCardBot.prototype = {

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
   * Insert a record into the grasp_log table
   * Call the callback with card_id once query is succesful.
   *
   * @param {string} card_id Unique card identifier
   * @param {string} event_type Log information (e.g. "CARD ISSUED")
   * @param {function} callback Callback function for handling error or card_id
   */
  _insertLogTbl: function(card_id, event_type, callback){

    var self = this;

    self.dbQuery(
      {
        text: "INSERT INTO grasp_log (card_id, event_type) VALUES ($1, $2);",
        values: [ card_id, event_type]
      },
      function(err, result){
        if (err){
          self.logger.error(err);
          callback(err, null);
        }
        else {
          callback(null, card_id);
        }
      }
    );
  },

  /**
   * Insert a record into the grasp_cards table
   * Call the callback with card_id once query is succesful.
   *
   * Function to parse user input and provide response based on keyword detection
   * @param {string} card_id Unique card identifier
   * @param {string} username Unique username e.g. @twitter
   * @param {string} network User social messaging network e.g. twitter
   * @param {string} language Text string containing ISO 639-1 two letter language code e.g. 'en'
   * @param {function} callback Callback function for handling error or card_id
   */
  _insertCard: function(card_id, username, network, language, callback){

    var self = this;

    self.dbQuery(
      {
      text: "INSERT INTO grasp_cards (card_id, username, network, language, received) VALUES ($1, $2, $3, $4, FALSE);",
      values: [ card_id, username, network, language ]
      },
      function(err, result){
        if (err){
          self.logger.error(err);
          callback(err, null);
        }
        else {
          self.logger.info('Issued card '+card_id);
          self._insertLogTbl(card_id, "CARD ISSUED", callback);
        }
      }
    );
  },

  /**
   * Create card unique id, register in database, and return value via callback
   * @param {string} username Unique username requesting card (e.g. @user)
   * @param {string} network Name of user social messaging network (e.g. Twitter)
   * @param {string} language Text string containing ISO 639-1 two letter language code e.g. 'en'
   * @param {function} callback Callback function to return card id
   */
  issueCard: function(username, network, language, callback){

    var self = this;

    // Create card id
    var _card_id = self._generate_id();

    self._insertCard(_card_id, username, network, language, callback);
  },

   // Watch table
   watchCards: function(network, callback){

     var self = this;

     self.pg.connect(self.config.pg.conString, function(err, client, done){
       if (err){
         self.logger.error("database err: " + err);
         done();
         callback( new Error('Database connection error') );
         return;
       }
       // Return the listen notification
       client.on('notification', function(msg) {
         try{
          self.logger.info('Msg: ' + msg);
          self.logger.info('Payload: ' + msg.payload);
          var notification = JSON.parse(msg.payload);
          self.logger.info('Parse successful');
          if (notification.grasp_cards.network === network){
            self.logger.info('Received card submission');
            callback(null, notification.grasp_cards);
          }
         }
         catch (e){
           self.logger.error('Error processing listen notification from database\n'+e);
           callback(e);

           return;
         }
       });

       // Initiate the listen query
       client.query("LISTEN watchers");
     });
   }
};

module.exports = ReportCardBot;
