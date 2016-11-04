'use strict';

var topojson = require('topojson');

// Example of card validation by HTTP server
module.exports = function(app, report_card, logger, s3) {

  app.put('/report/:card_id', function(req, res){
    report_card.checkCardStatus(req.params.card_id, function(cardStatusError, cardStatus){
      logger.debug('In /report/:card_id API');
      if (cardStatusError){
        res.send('Error - Report card id invalid');
        logger.debug('[/report/:card_id] Rejected access for card '+ req.params.card_id + '- invalid');
      }
      if (cardStatus.received === false){
        logger.debug('[/report/:card_id] Report submission for card '+ req.params.card_id);
        report_card.insertReport(req.body.created_at, req.params.card_id, req.body.location.lng +" "+ req.body.location.lat, req.body.water_depth, req.body.text, function(insertReportError, insertReportResult){
          if(insertReportError) {
            res.send('Error - Insert report failed');
            logger.debug('[/report/:card_id] Report submission for card: ' + req.params.card_id + ' failed');
          }
          else if(insertReportResult.received === 'invalid'){
            res.send('Error - invalid input');
            logger.debug('[/report/:card_id] Invalid input sent for card: '+ req.params.card_id);
          }
          else {
            logger.debug('[/report/:card_id] Report submission successful. Report id: ' + insertReportResult);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(insertReportResult);
          }
        });
      }
      else if (cardStatus.received === true){
        res.send('Error - report already received');
        logger.debug('[/report/:card_id] Report for card: '+req.params.card_id+ ' already received');
      }
    });
  });

  app.get('/report/:card_id', function(req, res, next){
      report_card.checkCardStatus(req.params.card_id, function(err, result){
      if (err){
        res.send('Error - report card id invalid');
        logger.debug('[/report/:card_id] Rejected access for card '+req.params.card_id+ '- invalid');
      }
      if ( result.received === false){
        //res.sendFile(__dirname+'/public/petabencana_background.html');
        res.sendFile(__dirname+'/public/landing.htm');
        logger.debug('[/report/:card_id] Approved access for card '+req.params.card_id);
      }
      else if (result.received === true){
        res.send('Error - report already received');
        logger.debug('[/report/:card_id] Rejected access for card '+req.params.card_id+ '- already received');
      }
    });
  });

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

  app.get('/report/confirmedReports/:id', function(req, res){
    logger.debug('[/report/confirmedReports/:id] In GetAllReports API');
    report_card.getAllReports(function(error, result){
      if(error) {
        res.send('Error - Get all reports failed');
        logger.debug('[/report/confirmedReports/:id] Get all reports failed');
      }
      else {
        logger.debug('[/report/confirmedReports/:id] Report fetch successful');
        var topology = topojson.topology({collection:result[0]},{"property-transform":function(object){return object.properties;}});
        var responseData = {};
    		responseData.code = 200;
    		responseData.headers = {"Content-type":"application/json"};
    		responseData.body = JSON.stringify(topology, "utf8");
        res.writeHead(responseData.code, responseData.headers);
      	res.end(responseData.body);
      }
    });
  });

  var mockReports = require('./mocks/mockReports');
  app.get('/reports/confirmed/:id', function(req, res, next){
    //send some mock data for now so our front end devs can work on it
    if( !req.format){
      res.status(400).send('invalid GET request to /reports/confirmed without format parameter');
    }
    res.status(200).json(
      mockReports
    );
  });
};
