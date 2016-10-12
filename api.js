'use strict';

// Example of card validation by HTTP server
module.exports = function(app, report_card, logger) {

  app.put('/report/:card_id', function(req, res){
    report_card.checkCardStatus(req.params.card_id, function(err, result){
      if ( result.received === false){
        report_card.insertReport(req.params.card_id, req.body, function(id){
          logger.info('[/report/:card_id] Inserted report');
          res.send('Got a PUT request at /report/:card_id  - map report = '+id);
        });
      }
      else {
        res.send('Error - report card ID invalid or report already received');
        logger.info('[/report/:card_id] Could not insert report - invalid card');
      }
    });
  });

  app.get('/report/:card_id', function(req, res, next){
      report_card.checkCardStatus(req.params.card_id, function(err, result){
      if ( result.received === false){
        res.sendFile(__dirname+'/public/card.html');
        logger.debug('[/report/:card_id] Approved access for card '+req.params.card_id);
      }
      else if (result.received === true){
        res.send('Error - report already received');
        logger.debug('[/report/:card_id] Rejected access for card '+req.params.card_id+ '- already received');
      }
      else {
        res.send('Error - report card id invalid');
        logger.debug('[/report/:card_id] Rejected access for card '+req.params.card_id+ '- invalid');
      }
    });
  });
};
