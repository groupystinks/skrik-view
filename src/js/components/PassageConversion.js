var _ = require('lodash');
var marked = require('marked');

declare class PassagesList {
  markdown: string;
  body: string;
  title: string;
  name: string;
  url: string
}

function convertPassage(listResult:Array<string>, options): Array<PassagesList> {
  var passagesList = [];
  // markdown to HTML
  var bodyList = listResult.map(result => marked(result, {sanitize: true}));
  var names = options.names;

  for (let i = 0; i < listResult.length; i++) {
    passagesList[i] = {
      markdown: listResult[i],
      body: bodyList[i],
      name: names[i],
      title: options.title,
      url: options.urls[i],
    }
  }

  return passagesList;
}

module.exports = convertPassage;
