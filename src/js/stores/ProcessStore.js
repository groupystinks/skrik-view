var _ = require('lodash');
var {Observable} = require('rx-lite');
var ProcessAPI = require('./api/ProcessAPI');
var BaseStore = require('./BaseStore');


class ProcessStore extends BaseStore {

  constructor() {
    super();

    this._processByName = {};
    this._processInfo = {};
  }


  list(): Observable {
    return this.__wrapAsObservable(this._listSync);
  }

  _listSync = () => {
    var result = null;

    if (this._processInfo['all']) {
      var processingInfo = this._processInfo['all'];
      if (!processingInfo) {
        return null;
      }

      result = {
        items: processingInfo.fetchedResults,
      };

      if (processingInfo.isFetching) {
        return result;
      }

      return result;
    }

    if (!this._processInfo['all']) {
      this._processInfo['all'] = null;
    } else {
      this._processInfo['all'].isFetching = true;
    }
    ProcessAPI.list().then(listResult => {
      // Add to cache
      listResult.forEach(item => this._processByName[item.name] = item);
      this._processInfo['all'] = {
        fetchedResults: listResult,
        fetchedResultCount: listResult.length,
      };

      console.log("processes in ProcessStore: ", listResult);
      this.emitChange();
    });

    return result;
  }
}

module.exports = new ProcessStore;
