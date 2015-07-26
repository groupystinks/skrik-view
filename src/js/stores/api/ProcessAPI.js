var _ = require('lodash');
var API = require('./API');

declare class ListResult {
  name: string;
  path: string;
  sha: string;
  size: string;
  url: string;
  html_url: string;
  git_url: string;
  type: string;
  _links: Object;
}


function list(): Promise<Array<ListResult>> {
  return API.wrap(() => {
    return API.requestProcess()
    .then(result => {
      return result;
    });
  });
}

module.exports = {
  list,
}
