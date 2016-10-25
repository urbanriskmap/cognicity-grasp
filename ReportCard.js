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
     * Check status of card in grasp_cards table
     * Call the callback with result object once query is succesful.
     *
     * Function to parse user input and provide response based on keyword detection
     * @param {string} card_id Unique card identifier
     * @param {function} callback Callback function for handling status result object
     */
    _checkCardStatus: function(card_id, callback){

      var self = this;

      var filter = function(err, result){
        if (err){
          self.logger.error(err);
          callback(err, null);
        }
        else if (result.length > 0){
          self.logger.info('Checked card '+card_id+' is valid');
          callback(null, result[0]);
        }
        else {
          self.logger.info('Checked card '+card_id+' was not found in database');
          callback(null, {received : null});
        }
      };

      self.dbQuery(
        {
        text: "SELECT received FROM grasp_cards WHERE card_id = $1;",
        values : [ card_id ]
       },
       filter
     );
   },

   //TODO - jsdoc
   _insertReport: function(card_id, report_object, callback){

     var self = this;

     self.dbQuery({
       text: "INSERT INTO grasp_reports (card_id) VALUES ($1) RETURNING pkey;",
       values: [ card_id ]
     },
     function(err, result){
       if (err){
         self.logger.error(err);
         callback(err, null);
       }
       else {
         self._updateGraspCards(card_id, result[0].pkey, callback);
       }
     }
   );
   },

   //TODO - jsdoc
   _updateGraspCards: function(card_id, report_id, callback){

     var self = this;

     self.dbQuery(
       {
       text: "UPDATE grasp_cards SET received = TRUE, report_id = $1 WHERE card_id = $2",
       values: [ report_id, card_id ]
       },
        function(err, result){
          if (err){
            self.logger.error(err);
            callback(err, null);
          }
          else {
            self._insertLogTbl(card_id, 'REPORT RECEIVED', function(card_id){
              callback(report_id);
            });
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

  /**
   * Check the validity and status of a card id
   * @param {string} card_id Unique card identifier
   * @param {function} callback Callback function to return status result
   */
  checkCardStatus: function(card_id, callback){
     var self = this;
     if (shortid.isValid(card_id)){
       self._checkCardStatus(card_id, callback);
     }
     else {
       self.logger.info('Checked card '+card_id+' was found invalid by shortid');
       callback(null, {received : null});
     }
   },

   /**
    * Insert report from user (i.e. from server) (Below fields for MVP, more to be added later)
    * @param  {string} created_at    ISO8601 format date string
    * @param  {string} card_id       Unique Card Id
    * @param  {string} location      Geo coordinates in WKT format (long lat)
    * @param  {string} water_depth   Water depth selected on the slider
    * @param  {string} text          Description of the report
    */
   insertReport: function(created_at, card_id, location, water_depth, text, callback){
   // Insert report from user (i.e. from server)
   
     var self = this;
     self.logger.info("Got insert report call to Reportcard");

     if(shortid.isValid(card_id) && !string(created_at).isEmpty() && !string(location).isEmpty() && !string(water_depth).isEmpty() && !string(text).isEmpty()) {
       self.dbQuery({
         text: "INSERT INTO grasp_reports (card_id, location, water_depth, text, created_at, status) VALUES ($1, ST_GeomFromText('POINT(' || $2 || ')',4326), $3, $4, $5, $6) RETURNING pkey;",
         values: [ card_id, location, water_depth, text, created_at, "Confirmed" ]
       },
         function(insertReportError, insertReportResult){
           if (insertReportError){
             self.logger.error(insertReportError);
             callback(insertReportError, null);
           }
           else {
             self.logger.info('Inserted report successfully for card_id: ' + card_id);
             self.dbQuery({
               text: "UPDATE grasp_cards SET received = TRUE WHERE card_id = $1",
               values: [ card_id ]
              },
                function(updateCardStatusError, updateCardStatusResult){
                  if (updateCardStatusError){
                    self.logger.error(updateCardStatusError);
                    callback(updateCardStatusError, null);
                  }
                  else {
                    self.logger.info('Updated card status of cardId ' + card_id + ' as received');
                    callback(updateCardStatusError, insertReportResult[0].pkey);
                  }
                }
              );
            }
            //TODO update log table
            //TODO update log files
          }
        );
     }
     else {
       self.logger.info('Invalid input received');
       callback(null, {received : 'invalid'});
     }
   },

   getAllReports: function(callback){
     var self = this;
     var queryObject = {
 			text: "SELECT 'FeatureCollection' As type, " +
 					"array_to_json(array_agg(f)) As features " +
 				"FROM (SELECT 'Feature' As type, " +
 					"ST_AsGeoJSON(lg.location)::json As geometry, " +
 					"row_to_json( " +
 						"(SELECT l FROM " +
 							"(SELECT pkey, " +
 							"created_at at time zone 'EDT' created_at, " +
 							"status, " +
              "text, " +
              "water_depth) " +
 						" As l) " +
 					") As properties " +
 					"FROM grasp_reports As lg " +
 				" ) As f ;",
 		 };
     self.dbQuery(queryObject,
     function(error, result){
       if (error){
         self.logger.error(error);
         callback(error, null);
       }
       else {
         self.logger.info('getAllReports call successful; returning results');
         callback(error, result);
       }
     });
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
          var notification = JSON.parse(msg.payload);
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

module.exports = ReportCard;
