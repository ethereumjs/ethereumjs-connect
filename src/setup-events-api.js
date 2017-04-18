"use strict";

function setupEventsAPI(eventsAPI, contracts) {
  var event;
  if (!contracts || !eventsAPI) return eventsAPI;
  for (event in eventsAPI) {
    if (eventsAPI.hasOwnProperty(event)) {
      eventsAPI[event].address = contracts[eventsAPI[event].contract];
    }
  }
  return eventsAPI;
}

module.exports = setupEventsAPI;
