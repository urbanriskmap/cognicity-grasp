'use strict';
/**
 * DB query callback
 * @callback DataQueryCallback
 * @param {Error} err An error instance describing the error that occurred, or null if no error
 * @param {object} data Response data object which is 'result.rows' from the pg module response
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
var dataQuery = function(queryObject, callback){
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
};

module.exports = dataQuery;
