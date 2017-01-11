'use strict';

/**
 * @file Cognicity GRASP module - CogniCity Reports SubModule
 * @copyright (c) Tomas Holderness & Etienne Turpin
 * @license Released under GNU GPLv3 License (see LICENSE)
 */

var ReportCardBot = require('./modules/ReportCardBot.js');
var Bot = require('./modules/Bot.js');

var bot_dialogue = require('./sample-bot-dialogue.js');
var bot_config = require('./sample-bot-config.js');

module.exports = function(config, logger, pg){

	// Report card module
	var report_cards = new ReportCardBot(config, logger, pg);
	// Return Bot
	return new Bot(bot_config, bot_dialogue, report_cards, logger);
};
