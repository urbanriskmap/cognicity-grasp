'use strict';

// Example of card validation by HTTP server
module.exports = function(app, report_card, logger, s3) {
  /**
   * Inserts report for the given param card_id in the DB
   * @param  {string} card_id       Unique Card Id
   * @param  {string} created_at    ISO8601 format date string
   * @param  {string} location      Geo coordinates in WKT format (long lat)
   * @param  {string} water_depth   Water depth selected on the slider
   * @param  {string} text          Description of the report
   */
  app.put('/report/:card_id', function(req, res){
    report_card.checkCardStatus(req.params.card_id, function(err, result){
      logger.debug('In /report/:card_id API');
      if (err) {
        res.send('Error - Report card id invalid');
        logger.debug('[/report/:card_id] Rejected access for card '+ req.params.card_id + '- invalid');
      }
      if (result.received === false) {
        logger.debug('[/report/:card_id] Report submission for card '+ req.params.card_id);
        report_card.insertReport(req.body.created_at,
                                  req.params.card_id,
                                  req.body.location.lng + " " + req.body.location.lat, //WKT Format
                                  req.body.water_depth,
                                  req.body.text, function(err, result) {
          if(err) {
            res.send('Error - Insert report failed');
            logger.debug('[/report/:card_id] Report submission for card: ' + req.params.card_id + ' failed');
          } else if(result.received === 'invalid'){
            res.send('Error - invalid input');
            logger.debug('[/report/:card_id] Invalid input sent for card: '+ req.params.card_id);
          } else {
            logger.debug('[/report/:card_id] Report submission successful. Report id: ' + result);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(result);
          }
        });
      } else {
        res.send('Error - report already received');
        logger.debug('[/report/:card_id] Report for card: '+req.params.card_id+ ' already received');
      }
    });
  });

  /**
   * Insert image data for the report in DB for the given param card_id
   *
   * @param  {string} card_id       Unique Card Id
   * @param  {string} filename      Name of the Image file
   * @param  {string} url_path      Signed URL from S3
   */
  app.put('/report/image/:card_id', function(req, res){
    report_card.checkReportImage(req.params.card_id, function(err, result){
      if (err) {
        res.send('Error - Report card id invalid');
        logger.debug('[/report/image/:card_id] Rejected access for card '+ req.params.card_id + '- invalid');
      }
      if (result.received === false) {
        report_card.insertReportImage(req.params.card_id,
                                      req.body.filename,
                                      req.body.url_path, function(err, result) {
          if(err) {
            res.send('Error - Insert report image failed');
            logger.debug('[/report/image/:card_id] Report image submission for card: ' + req.params.card_id + ' failed');
          } else if(result.received === 'invalid'){
            res.send('Error - invalid input');
            logger.debug('[/report/image/:card_id] Invalid input sent for card: '+ req.params.card_id);
          } else {
            logger.debug('[/report/image/:card_id] Report submission successful. Card id: ' + result);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(result);
          }
        });
      } else {
        res.send('Insert report image already received');
        logger.debug('[/report/image/:card_id] Report image already received. Card id: ' + req.params.card_id);
      }
    });
  });

  /**
   * Gets report for the given param card_id
   * @param  {string} card_id       Unique Card Id
   */
  app.get('/report/:card_id', function(req, res, next){
      report_card.checkCardStatus(req.params.card_id, function(err, result) {
      if (err) {
        res.send('Error - report card id invalid');
        logger.debug('[/report/:card_id] Rejected access for card '+req.params.card_id+ '- invalid');
      }
      if (result.received === false) {
        //res.sendFile(__dirname+'/public/petabencana_background.html');
        res.sendFile(__dirname+'/public/landing.htm');
        logger.debug('[/report/:card_id] Approved access for card '+req.params.card_id);
      } else if (result.received === true) {
        res.send('Error - report already received');
        logger.debug('[/report/:card_id] Rejected access for card '+req.params.card_id+ '- already received');
      }
    });
  });

  /**
   * Gets signedURL to upload an image in AWS for the param card_id
   * @param  {string} card_id       Unique Card Id
   * @param  {string} file_type     Type of the file uploaded
   */
  app.get('/report/imageupload/:card_id', function(req, res, next){
    var s3params = {
      Bucket: "testimageuploadpetabencana",
      Key: req.params.card_id + ".png",
      ContentType: req.query.file_type,
    };
    s3.getSignedUrl('putObject', s3params, function(err, data){
      if (err){
        logger.error('could not get signed url from S3');
        logger.error(err);
      } else {
        var returnData = {
          signedRequest : data,
          url: "https://"+s3params.Bucket + ".s3.amazonaws.com/" + s3params.Key
        };
        logger.debug( "s3 signed request: " + returnData.signedRequest);
        res.write(JSON.stringify(returnData));
        res.end();
      }
    });
  });

  /**
   * Gets signedURL to retrieve an image from AWS for the param card_id
   * @param  {string} card_id       Unique Card Id
   */
  app.get('/report/retrieveimage/:card_id', function(req, res, next){
    var s3params = {
      Bucket: "testimageuploadpetabencana",
      Key: req.params.card_id + ".png",
    };
    logger.info('Getting signedURL for cardID: ' + req.params.card_id);
    s3.getSignedUrl('getObject', s3params, function(err, data){
      if (err){
        logger.error('Could not get signed url from S3');
        logger.error(err);
      } else {
        var returnData = {
          signedRequest : data,
          url: "https://" + s3params.Bucket + ".s3.amazonaws.com/" + s3params.Key
        };
        logger.debug('S3 signed request: ' + returnData.signedRequest);
        res.write(JSON.stringify(returnData));
        res.end();
      }
    });
  });

  /**
   * Fetches all the confirmed reports from the DB in GeoJSON format
   */
  app.get('/reports/confirmed/', function(req, res){
    logger.debug('[/reports/confirmed/] In getAllReports API');
    report_card.getAllReports(function(err, result){
      if(err) {
        res.send('Error - Get all reports failed');
        logger.debug('[/reports/confirmed/] Get all reports failed');
      } else {
        logger.debug('[/reports/confirmed/] Report fetch successful');
        var responseData = {
          code: 200,
          headers: {"Content-type":"application/json"},
          body: JSON.stringify(result[0], "utf8")
        };
        res.writeHead(responseData.code, responseData.headers);
      	res.end(responseData.body);
      }
    });
  });

  var mockReports = require('./mocks/mockReports');
  app.get('/reports/confirmed/:id', function(req, res, next){
    //send some mock data for now so our front end devs can work on it
    if( !req.format) {
      res.status(400).send('invalid GET request to /reports/confirmed without format parameter');
    }
    res.status(200).json(
      mockReports
    );
  });
};
