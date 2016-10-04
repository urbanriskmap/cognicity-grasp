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
    card_url_prefix: 'http://localhost:3000/report'
    }
};

module.exports = config;
