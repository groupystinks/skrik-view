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

    if (this._processInfo.hasOwnProperty('root')) {
      var processingInfo = this._processInfo['root'];
      if (!processingInfo) {
        return null;
      }

      result = {
        items: processingInfo.fetchedResults,
      };

      if (this._processInfo['root'].isFetching) {
        return result;
      }

      return result;
    }

    if (!this._processInfo['root']) {
      this._processInfo['root'] = null;
    } else {
      this._processInfo['root'].isFetching = true;
    }

    ProcessAPI.list().then(listResult => {
      // Add to cache
      listResult.forEach(item => this._processByName[item.name] = item);
      this._processInfo['root'] = {
        fetchedResults: listResult,
        fetchedResultCount: listResult.length,
      };

      this.emitChange();
    });

    return result;
  }
}

module.exports = new ProcessStore();
