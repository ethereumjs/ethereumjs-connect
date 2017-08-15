"use strict";

function setupFunctionsABI(functionsABI, contracts) {
  var contract, method;
  if (!contracts || !functionsABI) return functionsABI;
  for (contract in functionsABI) {
    if (functionsABI.hasOwnProperty(contract)) {
      for (method in functionsABI[contract]) {
        if (functionsABI[contract].hasOwnProperty(method)) {
          functionsABI[contract][method].to = contracts[contract];
        }
      }
    }
  }
  return functionsABI;
}

module.exports = setupFunctionsABI;
