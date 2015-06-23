var fs = require('fs');
var path = require('path');
var ClientID = require('../../components/ClientID');
var EventEmitter = require('events').EventEmitter;
var request = require('request');
var RSVP = require('rsvp');
var _ = require('lodash');
var emitter = new EventEmitter();
var pendingRequests = [];


var dataDir = path.dirname(path.dirname(path.dirname(path.dirname(
              path.dirname(require.main.filename))))) + '/data';


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

function executeHTTPRequest(option) {
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

/*
* TODO
* There's no local on github
* Need to modify readFile method
*/
function executeLocalRequest(options) {
  return new RSVP.Promise((resolve, reject) => {
    if (!options.chapter && options.maxResults) {

      var result = '';
      var listRequest = [];
      var listResult = [];
      var pathname = path.join(dataDir, options.title);

      fs.readdir(pathname, (err, files) => {
        _.pull(files, 'INFO.md');

        // chaptername vs maxResults
        files.forEach(chaptername => {
          listRequest.push(_readFileAsync(pathname, chaptername));
        });

        RSVP.all(listRequest)
        .then((listResult) => {
          resolve(listResult);
        });
      });

    } else {
      var result = '';
      var pathname = path.join(dataDir, options.title, options.chapter + '.md')
      fs.readFile(pathname, function(err, data) {
        result += data;

        if (err) {
          reject(err);
        };

        resolve(result);
      });
    }
  });
}

function extractMeta(options) {
  return new RSVP.Promise((resolve, reject) => {
    var result = ''
    var pathname = path.join(dataDir, options.title, 'INFO.md')
    fs.readFile(pathname, function(err, data) {
      result += data;

      if (err) {
        reject(err);
      };

      resolve(result);
    });
  });
}

function _readFileAsync(pathname, chaptername) {
  return new RSVP.Promise((resolve, reject) => {
    var result = '';
    var filepath = path.join(pathname, chaptername);

    fs.readFile(filepath, function(err, data) {
      if (err) {
        rejcet(err);
      }
      result += data;
      resolve(result);
    });

  });
}


module.exports = {
  executeHTTPRequest,
  executeLocalRequest,
  extractMeta,
  wrap,
  resolvePendingRequests,
};
