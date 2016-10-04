'use strict';

// Example of card validation by HTTP server
module.exports = function(app, report_card, logger) {
  app.get('/report/:card_id', function(req, res, next){
      report_card.checkCardStatus(req.params.card_id, function(result){
      if ( result.received === false){
        res.send('Success - proceed with report');
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
