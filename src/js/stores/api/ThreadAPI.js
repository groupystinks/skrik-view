var path = require('path');
var API = require('./API');
var RSVP = require('rsvp');
var _ = require('lodash');

var Dispatcher = require('../../dispatcher/Dispatcher');
var ActionType = require('../../constants/ActionType');

declare class ListResult {
  items: Array<{
    /*
    ** snippet should be handled in View part?
    */
    download_url: string;
    name: string;
    size: number;
    title: string;
    author: string;
    edition: number;
    language: string;
    characterSetEncoding: string;
  }>
}


// wrap meta
function _wrapMeta(
  thread: object,
  meta: string,
  options: {title: string, dataUrl: string}) {
  // match markdown metadata pattern like => author: James Joyce
  var mdMetaPattern = new RegExp(/^(^[A-Z][\w\s]+): ([\w\s-,]+)\b$/, 'gm');

  var myArray;
  while((myArray = mdMetaPattern.exec(meta)) !== null) {
    myArray[1] = _.camelCase(myArray[1]);
    thread[myArray[1]] = myArray[2];
  }

  return thread;
}


function getByChapter(
  options: {title: string, chapter: number}
): Promise<Object> {
  return API.wrap(() => {
    return API.executeLocalRequest(
      {title: options.title,
        chapter: 'chapter ' + options.chapter}
    ).then(markdown => {
      _wrapMeta(markdown, options).then(result => {
        return result;
      });
    });
  });
}


function list(
  options: {title: string;}
): Promise<ListResult> {
  return API.wrap(() => {
    return API.requestThread({title: options.title})
    .then(threadAndInfo => {
      var threads = threadAndInfo.threads || [];
      var info = threadAndInfo.info || '';

      if (!threads.length) {
        return Promise.resolve({
          items: [],
        });
      }

      return API.extractMeta({title: options.title, info: info})
       .then(meta => {
        var unlistResult = threads.map(thread => {
          return _wrapMeta(thread, meta, options);
        });

        var listResult = {};
        for (let i = 0; i < unlistResult.length; i++) {
          unlistResult[i]['edition'] = Number(unlistResult[i]['edition']);
        }
        listResult['items'] = unlistResult;

        // _dispatchAddMany(listResult);
        return listResult;
      });
    });
  });
}

function _dispatchAddMany(listResult): void {
  var passages = listResult.items;

  Dispatcher.dispatch({
    type: ActionType.Passage.ADD_MANY,
    passages: passages,
  });
}


module.exports = {
  list,
  getByChapter,
}
