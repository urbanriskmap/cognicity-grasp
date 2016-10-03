// Config object
var config = {
  logger : {
    logDirectory : null,
    filename : 'cognicity-grasp',
    maxFileSize : 1024 * 1024 * 100,
    maxFiles : 10,
    level : 'debug'
  },
  bot : {
    regex: /\breport|alerts\b/i,
    card_url_prefix: 'https://petabencana.id/jakarta/banjir/grasp'
    }
};

module.exports = config;
