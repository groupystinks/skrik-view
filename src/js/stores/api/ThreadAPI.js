var fs = require('fs');
var path = require('path');
var API = require('./API');
var RSVP = require('rsvp');
var _ = require('lodash');

declare class ListResult {
    items: Array<{
                  /*
                  ** snippet should be handled in View part?
                  */
                  // snippet: string;
                  download_url: string;
                  name: string;
                  size: number;
                  chapter: number;
                  title: string;
                  author: string;
                  edition: number;
                  language: string;
                  characterSetEncoding: string;
                }>
}


// [debug] wrap psudo API chapter.
function _pseudoChapterObject(
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
      _pseudoChapterObject(markdown, options).then(result => {
        return result;
      });
    });
  });
}


function list(
  options: {maxResults: number; title: string;}
): Promise<ListResult> {
  return API.wrap(() => {
    return API.threadRequest(
      {title: options.title,
       maxResults: options.maxResults}
    )
    .then(threadAndInfo => {
      var threads = threadAndInfo['threads']
      var info = threadAndInfo['info'];

      return API.extractMeta({title: options.title, info: info})
       .then(meta => {
        var unlistResult = threads.map(thread => {
          return _pseudoChapterObject(thread, meta, options);
        });

        var listResult = {};
        for (let i = 0; i < unlistResult.length; i++) {
          unlistResult[i]['chapter'] = i + 1;
          unlistResult[i]['edition'] = Number(unlistResult[i]['edition']);
          unlistResult[i]['chapter'] = Number(unlistResult[i]['chapter']);

        }
        listResult['items'] = unlistResult;

        console.log(listResult);
        return listResult;
      });
    });
  });
}

module.exports = {
  list,
  getByChapter,
}
