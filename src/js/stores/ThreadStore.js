var ActionType = require('../constants/ActionType');
var BaseStore = require('./BaseStore');
var ThreadAPI = require('./api/ThreadAPI');
var _ = require('lodash');
var {Observable} = require('rx-lite');


// type ListResult = {
//   hasMore: bool;
//   items: Array<Thread>;
// };

type PagingInfo = {
  fetchedResults: Array<Thread>;
  fetchedResultCount: number;
};

class ThreadStore extends BaseStore {
  _pagingInfoByQuery: {[query: string]: PagingInfo};
  _threadsByID: Array<{
                  chapter: number;
                  name: string;
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
    this._threadsByID = {};
  }

  /*
  ** not yet finished
  */
  getByChapter(options: {chapter: string}): Obervable {
    return this.__wrapAsObservable(this._getByChapterSync, options);
  }

  _getByChapterSync = (options: {chapter: string}) => {
    if (this._threadsByID.hasOwnProperty(options.chapter)) {
      return this._threadsByID[options.chapter];
    }

    // prevent double fetching
    this._threadsByID[options.chapter] = null;

    ThreadAPI.getByChapter(options).then(item => {
      this._threadsByID[item.chapter] = item;
      this.emitChange();
    });

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
    var requestedResultCount = options.maxResultCount || 10;
    var maxResults = requestedResultCount;
    var result = null;
    var fetched = this._pagingInfoByQuery.hasOwnProperty(query);

    if (fetched) {
      var pagingInfo = this._pagingInfoByQuery[query];
      if (!pagingInfo) {
        return null;
      }

      maxResults = requestedResultCount - pagingInfo.fetchedResultCount;

      result = {
        items: pagingInfo.fetchedResults.slice(0, requestedResultCount),
      };

      if (maxResults <= 0 || pagingInfo.isFetching) {
        return result;
      }
    }

    // prevent double fetching
    if (!this._pagingInfoByQuery[query]) {
      this._pagingInfoByQuery[query] = null;
    } else {
      // am fetching, don't fetch again
      this._pagingInfoByQuery[query].isFetching = true;
    }

    var apiOptions = {
      maxResults,
      title,
    }

    ThreadAPI.list(apiOptions).then(listResult => {

      // Add to byID cache
      listResult.items.forEach(item => this._threadsByID[item.chapter-1] = item);

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
