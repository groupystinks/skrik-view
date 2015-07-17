var RSVP = require('rsvp');
var _ = require('lodash');

var API = require('./API');
var PassageConversion = require('../../components/PassageConversion');


function getByURLs(
  options: {
    urls: Array<string>;
    names: Array<string>;
    title: string;}
): Promise<Array<{passages: string;}>> {
  return API.wrap(() => {
    return API.requestPassages(options).then(listResult => {

      var passagesList = PassageConversion(listResult, options);
      // console.log('in PassageAPI: ', passagesList);
      return passagesList;
    });
  });
}

module.exports = {
  getByURLs
}
