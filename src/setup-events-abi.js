"use strict";

function setupEventsABI(eventsABI, contracts) {
  var event;
  if (!contracts || !eventsABI) return eventsABI;
  for (event in eventsABI) {
    if (eventsABI.hasOwnProperty(event)) {
      eventsABI[event].address = contracts[eventsABI[event].contract];
    }
  }
  return eventsABI;
}

module.exports = setupEventsABI;
