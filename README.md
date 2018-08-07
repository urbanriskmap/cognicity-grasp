# DEPRECATED

[![Build Status](https://travis-ci.org/urbanriskmap/cognicity-grasp.svg?branch=master)](https://travis-ci.org/urbanriskmap/cognicity-grasp)

CogniCity GRASP
=====
##### Geosocial Rapid Assessment Platform

## Introduction
[cognicity-grasp](https://github.com/urbanriskmap/cognicity-grasp) is an extension to the CogniCity platform that adds support to collect disaster reports from residents using web-technologies. Users request a *report card* which is delivered in the form of a unique one time link pointing to a  [cognicity-server]() instance. The report card link is delivered by a simple conversational 'bot'. The bot can be included in [cognicity-reports]() so that report cards can be delivered to users via social messaging or third-party application.

### Key Files
* `Bot.js` - GRASP module for user communication
* `ReportCard.js` - GRASP module to create unique card link
* `App.js` - Reference implementation
  * `sample-grasp-config.js` - Sample config for reference implementation
* `public/` - Folder containing web elements for card design

### GRASP Process
1. **User** input (e.g. via social messaging)
2. `Bot.js` scans **User** input for keyword "report"
3. `Bot.js` requests a report card from `ReportCard.js`
4. `ReportCard.js` creates unique card link, writes this to CogniCity database, and passess to `Bot.js`
5. `Bot.js` replies to **User** with unique card link
6. **User** opens link, requesting card resources from an instance of CogniCity server
7. Server uses local instance of `ReportCard.js` to validate unique card link against database
  - check card exists
  - check card not completed already
8. Server responds to **User** with card resources
9. **User** completes card, and sends response to server
10. Server adds report card to map and responds to **User** with unique report link
11. On update to reports table in CogniCity database, `Bot.js` responds to **User** thanking them, including unique report link for map

## App.js
`App.js` is the reference implementation of CogniCity Grasp. It emulates user input from a reports module to generate a report card using `Bot.js` and `ReportCard.js`, and emulates server response for submission of the card by the user.

### Dependencies
Stored in `package.json`, use:
```sh
npm install
```

### Run App.js
```sh
$ node app.js
info: Application starting...
info: Bot requesting issue of card
info: Express listening
info: Issued card B1eYYW-R
Hi User, here is the link to your report card: http://localhost:3000/report/B1eYYW-R

$ curl http://localhost:3000/report/B1eYYW-R
Success - proceed with report

$ curl http://localhost:3000/report/ZZZ
Error - report card id invalid
```

## ReportCard.js & Bot.js
`ReportCard.js` provides simple module for the creation, storage and validation of unique report card links.

`Bot.js` provides human-API endpoint to CogniCity Reports via keywords. Current keywords:
* "reports" (case insensitive).

`Bot.js` requires an instance of `ReportCard.js` to issue report cards.

```js
var ReportCard = require('ReportCard');
var Bot = require('Bot');

var report_card = new ReportCard(massive_database_object, winston_logger_object);
var bot = new Bot(config, report_card, winston_logger_object);

bot.parse(user_input, callback(err, response));
```

### Bot.js Configuration
See `sample-grasp-config.js`

## Schema
***TO DO***
-> Move schema to /db?

## Development

### Unit tests
```sh
npm install --dev
npm test
```

### Cards
Report card web elements are in the `public/` folder.
In the future, we'll use handlebars templates for multi-language support (see `cards/`).
