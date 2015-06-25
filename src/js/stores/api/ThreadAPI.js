var fs = require('fs');
var path = require('path');
var API = require('./API');
var RSVP = require('rsvp');
var toMarkdown = require('to-markdown');
var _ = require('lodash');

// [debug]
var options = {
  title: "A Portrait of the Artist as a Young Man",
  dataUrl: 'https://api.github.com/repos/groupystinks/skrik-view/contents/data/',
  // chapter: 3
  maxResults: 10
}

// // [debug] read local data
// var appDir = path.dirname(path.dirname(path.dirname(path.dirname(
//               path.dirname(require.main.filename)))));


declare class ListResult {
    items: Array<{
                  markdown: string;
                  /*
                  ** snippet should be handled in View part?
                  */
                  // snippet: string;
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
  markdown: string,
  options: {title: string,
  chapter: ?number}) {
  // match markdown metadata pattern like => author: James Joyce
  var mdMetaPattern = new RegExp(/^(^[A-Z][\w\s]+): ([\w\s-,]+)\b$/, 'gm');

  return API.extractMeta(
    {title: options.title}
  ).then(meta => {
    var myArray;
    var result = {};
    while((myArray = mdMetaPattern.exec(meta)) !== null) {
      myArray[1] = _.camelCase(myArray[1]);
      result[myArray[1]] = myArray[2];
    }
    result['markdown'] = markdown;
    result['chapter'] = options.chapter;
    return result;
  });
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
  options: {maxResults: number; title: string; dataUrl: string}
): Promise<ListResult> {
  return API.wrap(() => {
    return API.executeHTTPRequest(
      {title: options.title,
       dataUrl: options.dataUrl,
       maxResults: options.maxResults}
    )
    .then(listMarkdowns => {
      var promises = listMarkdowns.map(markdown => {
        return _pseudoChapterObject(markdown, options);
      });

      RSVP.all(promises)
      .then(unlistResult => {
        var listResult = {};
        for (let i = 0; i < unlistResult.length; i++) {
          unlistResult[i]['chapter'] = i + 1;
          unlistResult[i]['edition'] = Number(unlistResult[i]['edition']);
          unlistResult[i]['chapter'] = Number(unlistResult[i]['chapter']);
        }
        listResult['items'] = unlistResult;

        console.log(listResult);
        return listResult;
      })
      .catch(reason => {
        console.error(reason);
      });
    });
  });
};


function _turnToMarkdown(sourceHtml, title, author) {
  var rawHTML = ''
  fs.readFile(appDir + '/data/a-portrait.html', function(err, data) {

    if (err) {throw err};

    rawHTML += data;

    var converter1 = {
      filter: ['title', 'div', 'meta'],

      replacement: function(innerHTML) {
        return '';
      }
    }
    var md = toMarkdown(rawHTML, {converters: [converter1]});

    fs.writeFile(appDir + '/data/A Portrait of the Artist as a Young Man.md', md, function(err, data) {
      if (err) throw err;
    });

  });
};


module.exports = {
  list,
  getByChapter,
}
