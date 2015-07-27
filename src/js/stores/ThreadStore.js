var ActionType = require('../constants/ActionType');
var BaseStore = require('./BaseStore');
var ThreadAPI = require('./api/ThreadAPI');
var _ = require('lodash');
var {Observable} = require('rx-lite');


type PagingInfo = {
  fetchedResults: Array<Thread>;
  fetchedResultCount: number;
};

class ThreadStore extends BaseStore {
  _pagingInfoByQuery: {[query: string]: PagingInfo};
  _threadsByName: Array<{
                  name: string;
                  download_url: string;
                  size: number;
                  title: string;
                  author: string;
                  edition: number;
                  language: string;
                  characterSetEncoding: string;
              }>;

  constructor() {
    super();

    this._pagingInfoByQuery = {};
    this._threadsByName = {};
  }


  getByName(options: {
      name: string;
    }): Obervable {
    return this.__wrapAsObservable(this._getByNameSync, options);
  }

  _getByNameSync = (options:{name: string;}) => {
    if (this._threadsByName.hasOwnProperty(options.name)) {
      return this._threadsByName[options.name] ? (
        new Array(this._threadsByName[options.name])
      ) : (null);
    }

    // prevent double fetching
    this._threadsByName[options.name] = null;

    /*
     *
     * preserve for extensibiltiy
    */
    // ThreadAPI.getByChapter(options).then(item => {
    //   this._threadsByName[item.name] = item;
    //   this.emitChange();
    // });

    return null;
  };


  list(
    options: {query: string;
      maxResultCount: number;
      title: string;}
  ): Observable {
    return this.__wrapAsObservable(this._listSync, options);
  }

  _listSync = (options: {
                query: string;
                title: string;
                maxResultCount: number;}) => {

    var query = options.query || '';
    var title = options.title || '';
    var result = null;
    var fetched = this._pagingInfoByQuery.hasOwnProperty(query);

    if (fetched) {
      var pagingInfo = this._pagingInfoByQuery[query];
      if (!pagingInfo) {
        return null;
      }

      result = {
        items: pagingInfo.fetchedResults
      };

      if (pagingInfo.isFetching) {
        return result;
      }

      return result;
    }

    // prevent double fetching
    if (!this._pagingInfoByQuery[query]) {
      this._pagingInfoByQuery[query] = null;
    } else {
      // fetched, don't fetch again
      this._pagingInfoByQuery[query].isFetching = true;
    }

    var apiOptions = {
      title,
    }

    ThreadAPI.list(apiOptions).then(listResult => {

      // Add to byName cache
      listResult.items.forEach(item => this._threadsByName[item.name] = item);

      // Update cache with concatenated results
      var previousResults = fetched ? pagingInfo.fetchedResults : [];
      var allItems = previousResults.concat(listResult.items);
      this._pagingInfoByQuery[query] = {
        fetchedResults: allItems,
        fetchedResultCount: allItems.length,
      };

      this.emitChange();
    });

    return result;
  };
}

// /**
// * Debug
// **/
// let check = new ThreadStore();
// // [debug]
// let options = {
//   title: "A Portrait of the Artist as a Young Man",
//   dataUrl: 'https://api.github.com/repos/groupystinks/skrik-view/contents/data/',
//   query: "in:inbox",
//   maxResults: 10
// }
// var aa = check._listSync(options);

module.exports = new ThreadStore();
