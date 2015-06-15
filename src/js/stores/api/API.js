var ClientID = require('../../components/ClientID');
var EventEmitter = require('events').EventEmitter;

var request = require('request');
var RSVP = require('rsvp');

var emitter = new EventEmitter();
var pendingRequests = [];

RSVP.on('error', function(error) {
  console.error(error, error.stack);
});

var inProgressAPICalls = {};

function resolvePendingRequests() {
  return RSVP.Promise.resolve();
}

function wrap(
  getPromise: () => Promise
): Promise {
  var id = ClientID.get();
  inProgressAPICalls[id] = true;
  // emitter.emit('start', id);

  var promise = resolvePendingRequests().then(() => {
    return getPromise();
  });

  promise.catch(error => console.log('API Error', error));

  return promise.finally(() => {
    delete inProgressAPICalls[id];
    // emitter.emit('stop', id);
    // if (!Object.keys(inProgressAPICalls).length) {
    //   emitter.emit('allStopped');
    // }
  });
}

function execute(option) {
  return new RSVP.Promise((resolve, reject) => {
    request(option.url, (error, response, body) => {
      if (error || !response.statusCode == 200) {
        console.error('API error', error)
        reject(error);
      }
      resolve(body);
    })
  });
}


module.exports = {
  execute,
  wrap,
  resolvePendingRequests,
};
