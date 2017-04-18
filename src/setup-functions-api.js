"use strict";

function setupFunctionsAPI(functionsAPI, contracts) {
  var contract, method;
  if (!contracts || !functionsAPI) return functionsAPI;
  for (contract in functionsAPI) {
    if (functionsAPI.hasOwnProperty(contract)) {
      for (method in functionsAPI[contract]) {
        if (functionsAPI[contract].hasOwnProperty(method)) {
          functionsAPI[contract][method].to = contracts[contract];
        }
      }
    }
  }
  return functionsAPI;
}

module.exports = setupFunctionsAPI;
