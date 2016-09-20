cognicity-grasp
===============

## Geosocial Rapid Assessment Platform for CogniCity

[![Build Status](https://travis-ci.org/urbanriskmap/cognicity-grasp.svg?branch=master)](https://travis-ci.org/urbanriskmap/cognicity-grasp)

Card -> Outbound

Report <- Inbound

Notes

- micro-service AI platform to collect reports of disaster reports from residents

- respond to user input via medium/network

- access user contact details from database

- send card with unique URL via medium
  - create expected hash-url part

- listen for response via URL

- support upload of media

- send reply of thanks via medium

- log all activity in adjacent log table

### Message Mediums
- Twitter (submodules?) -> based on cognicity-reports
- WhatsApp (submodules?)

Mediums configured via config file to specify API for each, mapping networks against users.

### Internal CogniCity modules

### External Dependencies
https://github.com/dylang/shortid

### GRASP API

issueCard
- create unique URL grasp.petabencana.id/report/QWE#WSF

generateCardID

checkCardID

sendThanks

logActivity?

saveReport

endpoints/

get.report_card (static HTML)
if (report_card_id IS IN DATABASE [checkCardID]){
  response.send(card HTML files)
}
else (){
  response.send('error invalid report card ID')
}
put.report_card (receive + respond with thanks)

get.reports?card_id
-> geoJson of reports
-> images linked as URLS

social endpoints/
- Alerts
- Report / Flood
- Subscribe
- Unsubscribe

# WhatsApp
- wrappers around send and receive
- user info not needed, 'just blind endpoint to start with'

# Subscription
- via GRASP or Alerts?

# Storing image data
7K row per city.
8MP camera @ 1.7MB per image
=56,000MB AKA 56 gigabytes of data

# Future work
-> Geo reminder bot
-> Alerts integration
-> Pebble support
