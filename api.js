'use strict';

// Example of card validation by HTTP server
module.exports = function(app, report_card, logger) {

  app.put('/report/:card_id', function(req, res){
    // checkCardStatus
    // insert
    // return card id?
    report_card.insertReport(req.params.card_id, req.body);
    res.send('Got a PUT request at /report/:card_id');
    logger.info(req.body);
    logger.debug('[/report/:card_id] Received card submission');
    // **To Do**
    // now put this in the database as a confirmed report, returning report ID
    // Thanks for your report, see your report on the map at map/123
  });

  app.get('/report/:card_id', function(req, res, next){
      report_card.checkCardStatus(req.params.card_id, function(err, result){
      if ( result.received === false){
        res.sendFile(__dirname+'/public/petabencana_background.html');
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
