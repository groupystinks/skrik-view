var ActionType = require('../constants/ActionType');
var BaseStore = require('./BaseStore');
var ThreadAPI = require('./api/ThreadAPI');
var _ = require('lodash');
var {Observable} = require('rx-lite');


// type ListResult = {
//   hasMore: bool;
//   resultSizeEstimate: number;
//   items: Array<Thread>;
// };

// type PagingInfo = {
//   fetchedResults: Array<Thread>;
//   fetchedResultCount: number;
//   nextPageToken: string;
//   resultSizeEstimate: number;
// };

class ThreadStore extends BaseStore {
  _pagingInfoByQuery: {[query: string]: PagingInfo};
  _threadsByID: {[id: string]: Thread};

  constructor() {
    super();

    this._pagingInfoByQuery = {};
    this._threadsByID = {};
  }


  getByChapter(options: {chapter: string}): Obervable {
    return this.__wrapAsObservable(this._getByChapterSync, options);
  }

  _getByChapterSync = (options: {id: string}) => {
    if (this._threadsByID.hasOwnProperty(options.id)) {
      return this._threadsByID[options.id];
    }

    // prevent double fetching
    this._threadsByID[options.id] = null;

    ThreadAPI.getByChapter(options).then(item => {
      this._threadsByID[item.id] = item;
      this.emitChange();
    });

    return null;
  };



  list(
    options: {query: string; maxResultCount: number}
  ): Observable {
    return this.__wrapAsObservable(this._listSync, options);
  }

  _listSync = (options: {query: string; maxResultCount: number}) => {
    var query = options.query || '';
    var requestedResultCount = options.maxResultCount || 10;
    var maxResults = requestedResultCount;
    var result = null;

    if (this._pagingInfoByQuery.hasOwnProperty(query)) {
      var pagingInfo = this._pagingInfoByQuery[query];
      if (!pagingInfo) {
        return null;
      }

      leftoverResults = requestedResultCount - pagingInfo.fetchedResultCount;

      result = {
        items: pagingInfo.fetchedResults.slice(0, requestedResultCount),
      };

      if (leftoverResults <= 0 || pagingInfo.isFetching) {
        return result;
      }
    }

    var threadAPIoptions = {
      // query,

      title/* debug */: "A Portrait of the Artist as a Young Man",
      maxResults,
    };

    // prevent double fetching
    if (!this._pagingInfoByQuery[query]) {
      this._pagingInfoByQuery[query] = null;
    } else {
      // am fetching, don't fetch again
      this._pagingInfoByQuery[query].isFetching = true;
    }

    console.log("check ThreadAPI, Hello? ", ThreadAPI);
    ThreadAPI.list(threadAPIoptions).then(listResult => {
      console.log("in ThreadAPI.list");
      // Add to byID cache
      listResult.items.forEach(item => this._threadsByID[item.id] = item);

      // Update cache with concatenated results
      var previousResults = pagingInfo.fetchedResults;
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

/**
* Debug
**/

// let check = new ThreadStore();
// let options = {maxResultCount: 10, title: "A Portrait of the Artist as a Young Man"}
// console.log(check._listSync(options));

module.exports = new ThreadStore();
