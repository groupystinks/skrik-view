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


function requestProcess() {
  return new RSVP.Promise((resolve, reject) => {
    var dataUrl = 'https://api.github.com/repos/groupystinks/skrik-view/contents/data';
    var urlOptions = {
      url: dataUrl,
      crossDomain: true,
      type: 'GET',
    };

    $.ajax(urlOptions).done(threadObject => {
      resolve(threadObject);
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error(errorThrown);
    });
  });
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

    var threadRequest = new RSVP.Promise((resolve, reject) => {
      resolve($.ajax(urlOptions));
    });

    threadRequest.then(data => {

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
    .catch((jqXHR, textStatus, errorThrown) => {
      console.error(errorThrown);
    });
  });
}


function requestPassages(options: {
  urls: Array<string>;
  title: string;}
): Array<String> {
  return new RSVP.Promise((resolve, reject) => {
    var download_urls = options.urls.map(url => url);
    var listRequest = download_urls.map(url => new RSVP.Promise((resolve, reject) => {
      resolve($.ajax(url));
    }));

    RSVP.all(listRequest)
    .then(results => {
      resolve(results);
    })
    .catch(error => {
      reject(error);
    })
  });
}

function extractMeta(options) {
  return new RSVP.Promise((resolve, reject) => {
    _requestAsync(options.info.download_url)
    .then(meta => {
      resolve(meta);
    });
  });
}

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
  requestProcess,
  requestThread,
  requestPassages,
  subscribe,
  extractMeta,
  wrap,
  resolvePendingRequests,
};
