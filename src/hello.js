"use strict";

var util = require('./utils.js');
var _ = require('lodash');


module.exports = function hello(to){
  return _.template("Hello, <%= name %>!")({ name: to });
}
