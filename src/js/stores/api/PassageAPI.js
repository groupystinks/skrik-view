var RSVP = require('rsvp');
var _ = require('lodash');
var marked = require('marked');

var API = require('./API');


function getByURLs(
  options: {
    urls: Array<string>;
    title: string;}
): Promise<Array<{passages: string;}>> {
  return API.wrap(() => {
    return API.requestPassages(options).then(listResult => {
      var result = {};
      result['passages'] = [];
      var names = options.urls.map(url => {
        return _.last(url.split('/'));
      });

      for (let i = 0; i < listResult.length; i++) {
        result['passages'][i] = {
          markdown: listResult[i],
          name: names[i],
          url: options.urls[i],
        }
      }
      result['title'] = options.title;

      console.log('in PassageAPI: ',result);
      return result;
    });
  });
}

module.exports = {
  getByURLs
}
