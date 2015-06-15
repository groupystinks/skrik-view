var API = require('./API');

var RSVP = require('rsvp');
var _ = require('lodash');

(function getByChapter(
  options: {chapter: string}
): Promise<Object> {
  return API.wrap(() => {
    return API.execute(
      {url: 'https://ia802701.us.archive.org/34/items/aportraitofthear04217gut/prtrt10h.htm'}
    ).then(response => {
      console.log(response);
    });
  });
})();

//
// var request = require('request');
// request('https://ia802701.us.archive.org/34/items/aportraitofthear04217gut/prtrt10h.htm', function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(response.statusCode) // Show the HTML for the Google homepage.
//   }
// });
