"use strict";

function setFrom(functionsAPI, fromAddress) {
  var contract, method;
  if (!fromAddress || !functionsAPI) return functionsAPI;
  for (contract in functionsAPI) {
    if (functionsAPI.hasOwnProperty(contract)) {
      for (method in functionsAPI[contract]) {
        if (functionsAPI[contract].hasOwnProperty(method)) {
          functionsAPI[contract][method].from = fromAddress;
        }
      }
    }
  }
  return functionsAPI;
}

module.exports = setFrom;
