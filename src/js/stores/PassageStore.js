
// var API = require('./API');
var ActionType = require('../constants/ActionType');
var BaseStore = require('./BaseStore');
var PassageAPI = require('./api/PassageAPI');
var _ = require('lodash');
var {Observable} = require('rx-lite');

class PassageStore extends BaseStore {
  _passagesByName: Array<{
      name: string;
      url: string;
      markdown: string;
    }>

  constructor() {
    super();

    this._passagesByName = {};
  }

  _getByURLsSync = (
    options: {
      title: string;
      urls: Array;
      names: Array;
      maxResults: number;}
    ) => {
    var names = options.names.map(name => name.split(' ').join('%20'));
    var existing = _.chain(names)
      .map(name => this._passagesByName[name])
      .compact()
      .value();

    if (existing.length === options.names.length) {
      return existing;
    }

    var maxResults =
      (options.maxResults > options.names.length) ?
        options.names.length :
        options.maxResults;


    var urlsToFetch = _.difference(
      options.urls,
      existing.map(passage => passage.url)
    ).slice(0, maxResults);

    var apiOptions = {
      urls: urlsToFetch,
      title: options.title,
    }

    PassageAPI.getByURLs(apiOptions).then(passagesList => {

      passagesList.forEach(passage => {
        this._passagesByName[passage.name] = passage;
      });
      console.log('in PassageStore: ', this._passagesByName);
      this.emitChange();
    });

    return existing;
  };

  getByURLs(options: {
      title: string;
      urls: Array;
      names: Array;
      maxResults: number;
    }
  ): Observable<Array> {
    return this.__wrapAsObservable(this._getByURLsSync, options);
  }
}

module.exports = new PassageStore();
