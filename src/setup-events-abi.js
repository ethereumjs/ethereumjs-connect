"use strict";

function setupEventsABI(eventsABI, contracts) {
  var contractName, eventName, contractEventsABI;
  if (!contracts || !eventsABI) return eventsABI;
  for (contractName in eventsABI) {
    if (eventsABI.hasOwnProperty(contractName)) {
      contractEventsABI = eventsABI[contractName];
      for (eventName in contractEventsABI) {
        if (contractEventsABI.hasOwnProperty(eventName)) {
          eventsABI[contractName][eventName].address = contracts[contractEventsABI[eventName].contract];
        }
      }
    }
  }
  return eventsABI;
}

module.exports = setupEventsABI;
