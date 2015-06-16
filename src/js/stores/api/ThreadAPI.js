var fs = require('fs');
var path = require('path');
var API = require('./API');
var RSVP = require('rsvp');
var toMarkdown = require('to-markdown');
var _ = require('lodash');

// [debug]
var options = {
  bookname: "A Portrait of the Artist as a Young Man",
  chapter: 1
}

// [debug] read local data
var appDir = path.dirname(path.dirname(path.dirname(path.dirname(
              path.dirname(require.main.filename)))));


(function getByChapter(options: {bookname: string, chapter: number}) {
  return API.wrap(() => {
    return API.executeLocalRequest(
      {bookname: options.bookname,
        chapter: 'chapter ' + options.chapter}
    ).then(result => {
      //
      console.log(result)
    });
  });
})(options);

function list() {}

function _turnToMarkdown(sourceHtml, bookname, author) {
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


function _getHTMLRemote() {
  return API.wrap(() => {
    return API.executeHTTPRequest(
      {url: 'https://ia802701.us.archive.org/34/items/aportraitofthear04217gut/prtrt10h.htm'}
    ).then(body => body)
  });
};



function getByChapter() {}

// var request = require('request');
// request('https://ia802701.us.archive.org/34/items/aportraitofthear04217gut/prtrt10h.htm', function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(response.statusCode) // Show the HTML for the Google homepage.
//   }
// });


// (function getByChapterLocal(options:{chapter: string}): Promise<Object> {
//   return new RSVP.Promise((resolve, reject) => {
//     var rawHTML = '';
//     var handler = new htmlparser.DefaultHandler(function (error, dom) {
//         if (error)
//             console.error('parsing error');
//     });
//     var parser = new htmlparser.Parser(handler);
//     fs.readFile(appDir + '/data/a-portrait.html', function(err, data) {
//
//       if (err) {throw err};
//
//       rawHTML += data;
//       parser.parseComplete(rawHTML);
//       var firstLayerTags = handler.dom[0].children;
//       try {
//         firstLayerTags.forEach(firstLayerTag => {
//           if (firstLayerTag.name === 'body') {
//             firstLayerTag.children.forEach(secondLayerTag => {
//               if (secondLayerTag.name === 'h2') {
//                 console.log(secondLayerTag.children);
//               }
//             });
//           }
//         });
//       } catch(e) {
//       }
//
//     });
//   });
// })();
// .then( secondLayerTags => {
//     console.log(secondLayerTags);
//   }
// )
