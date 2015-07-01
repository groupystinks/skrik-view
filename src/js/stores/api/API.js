var urlUtil = require('url');
var ClientID = require('../../components/ClientID');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');
var RSVP = require('rsvp');
var _ = require('lodash');
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
  emitter.emit('start', id);

  var promise = resolvePendingRequests().then(() => {
    return getPromise();
  });

  promise.catch(error => console.error('API Error', error));

  return promise.finally(() => {
    delete inProgressAPICalls[id];
    emitter.emit('stop', id);
    if (!Object.keys(inProgressAPICalls).length) {
      emitter.emit('allStopped');
    }
  });
}


function subscribe(
  eventName: string,
  callback: (value: ?boolean) => void
): {remove: () => void;} {
  emitter.on(eventName, callback);
  return {
    remove() {
      emitter.removeListener(eventName, callback);
    }
  };
}


function requestThread(options) {
  return new RSVP.Promise((resolve, reject) => {
    var listRequest = [];
    var listResult = [];
    var dataUrl = 'https://api.github.com/repos/groupystinks/skrik-view/contents/data/';
    var dirUrl = urlUtil.resolve(dataUrl, options.title);
    var urlOptions = {
      url: dirUrl,
      crossDomain: true,
      type: 'GET',
    };

    $.ajax(urlOptions).done(data => {

      var info = _.remove(data, function(n) {
        return n.name === 'INFO.md';
      }).pop();

      data.forEach(chapterObject => {
        listRequest.push({
          download_url: chapterObject.download_url,
          name: chapterObject.name,
          size: chapterObject.size
        });
      });

      RSVP.all(listRequest)
      .then(listResult => {
        var threadAndInfo = {};
        threadAndInfo['threads'] = listResult;
        threadAndInfo['info'] = info;

        resolve(threadAndInfo);
      });
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error(errorThrown);

    });
  });
}

function requestPassages(options) {
  return new RSVP.Promise((resolve, reject) => {
    var download_urls = options.download_url.map(download_url => download_url);
    var listRequest = download_urls.map(url => {
      $.ajax(url).done(data => {
        resolve(data);
      });
    });

    $.when.apply($, listRequest)
    .done(() => {
      // // TODO:
      // //      while argument's length is 1
      // // argument for each ajax call, each of one in [data, statusText, jqXHR]
      // var results = [];
      // for (let i = 0; i < arguments.length; i++) {
      //   results.push(arguments[i][0]);
      // }
      // convert the arguments array, where each argument is in the form
      // [data, textStatus, jqXHR], into an array of just the data values
      var results = [].map.call(arguments, function(arg) {
          return arg[0];
      });

      console.log(results);
      resolve(results)
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      reject(errorThrown);
    });
  });
}

// /*
// * TODO
// * There's no local on github
// * Need to modify readFile method
// */
// function executeLocalRequest(options) {
//   return new RSVP.Promise((resolve, reject) => {
//     if (!options.chapter && options.maxResults) {
//
//       var result = '';
//       var listRequest = [];
//       var listResult = [];
//       // pathname breaks, wait to push into Githun
//       var pathname = path.join(dataDir, options.title);
//
//       fs.readdir(pathname, (err, files) => {
//         _.pull(files, 'INFO.md');
//
//         // chaptername vs maxResults
//         files.forEach(chaptername => {
//           listRequest.push(_readFileAsync(pathname, chaptername));
//         });
//
//         RSVP.all(listRequest)
//         .then((listResult) => {
//           resolve(listResult);
//         });
//       });
//
//     } else {
//       var result = '';
//       var pathname = path.join(dataDir, options.title, options.chapter + '.md')
//       fs.readFile(pathname, function(err, data) {
//         result += data;
//
//         if (err) {
//           reject(err);
//         };
//
//         resolve(result);
//       });
//     }
//   });
// }

function extractMeta(options) {
  return new RSVP.Promise((resolve, reject) => {
    _requestAsync(options.info.download_url)
    .then(meta => {
      resolve(meta);
    });
  });
}

// function _readFileAsync(pathname, chaptername) {
//   return new RSVP.Promise((resolve, reject) => {
//     var result = '';
//     var filepath = path.join(pathname, chaptername);
//
//     fs.readFile(filepath, function(err, data) {
//       if (err) {
//         rejcet(err);
//       }
//       result += data;
//       resolve(result);
//     });
//
//   });
// }

function _requestAsync(url) {
  return new RSVP.Promise((resolve, reject) => {
    var urlOptions = {
      url: url,
      crossDomain: true,
      type: 'GET',
      // beforeSend: function(xhr){xhr.setRequestHeader('User-Agent', 'skrik-view');},
    };

    $.ajax(urlOptions).done(data => {
      resolve(data);
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error(errorThrown);
      reject(error);
    });
  });
}


module.exports = {
  requestThread,
  requestPassages,
  extractMeta,
  wrap,
  resolvePendingRequests,
};
