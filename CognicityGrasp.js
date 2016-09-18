'use strict';

/**
 * A CognicityGrasp object manages requests and receiepts of user reports
 *
**/

var shortid = require('shortid');

var CognicityGrasp = function(){};

CognicityGrasp.prototype = {
  generateCardID: function(){
    return shortid.generate();
  }
}

module.exports = CognicityGrasp;
