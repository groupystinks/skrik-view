var _ = require('lodash');
var asap = require('asap');
var {Component, PropTypes} = require('react');
var {Observable} = require('rx-lite');
var React = require('react/addons');
var Router = require('react-router');

var KeyBinder = require('./components/KeyBinder');
var Observer = require('./components/Observer');
var PureRender = require('./components/PureRender');
// var PassageActions = require('./actions/PassageActions');
var PassageStore = require('./stores/PassageStore');
// var ThreadActions = require('./actions/ThreadActions');
var ThreadStore = require('./stores/ThreadStore');
// var Scroller = require('./components/Scroller');
// var Spinner = require('./components/Spinner');
// var SearchBox = require('./components/SearchBox');
// var LabelStore = require('./stores/LabelStore');
// var BlockMessageList = require('./components/BlockMessageList');
// var Colors = require('./components/Colors');
// var isOffline = require('./components/isOffline');

/*
**debug
*/
var check = require('./stores/api/PassageAPI');
/*
**end of debug
*/

var RouteHandler = Router.RouteHandler;

var SHEET_SIZE = 10;

var dummySubscription = {remove() {}};

@KeyBinder
@Observer
@PureRender
class App extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  state = {
    // isLoading: !isOffline(),
    maxResults: SHEET_SIZE,
    title: "A Portrait of the Artist as a Young Man",
    query: 'in:inbox',
    queryProgress: 'in:inbox',
  };

  // equiped with remove method for dummy
  _subscriptions = [dummySubscription];

  observe() {
    var threadObservable = ThreadStore.list({
      query: this.state.query,
      maxResults: this.state.maxResults,
      title: this.state.title,
    });
    return {
      threads: threadObservable,
      // Rx.Observable.prototype.flatMap(selector, [resultSelector])
      //    selector (Function): A transform function to apply to each element or
      //                         an observable sequence to project each element
      //                         from the source sequence onto.
      lastPassageInEachThread: threadObservable.flatMap(threads => {
        if (!threads) {
          return Observable.return(null);
        }
        var passageTitle = this.state.title;
        var passageURLs = threads.items.map(thread => thread.download_url);
        var passageNames= threads.items.map(thread => thread.name);

        var options= {};
        options.maxResults = this.state.maxResults;
        options.urls = passageURLs;
        options.title = passageTitle;
        options.names = passageNames;

        return PassageStore.getByURLs(options);
      }),
    };
  }

  render():any {
    return (
      <div>
        <h1>Hihdsadassi</h1>
        <div>{this.data.lastPassageInEachThread}</div>
        <div>{this.data.threads}</div>
      </div>
    );
  }
}
let checkApp = new App();
var cool = checkApp.observe();


// // debug
// var options = {
//   download_url: [
//     "https://raw.githubusercontent.com/groupystinks/skrik-view/master/data/A%20Portrait%20of%20the%20Artist%20as%20a%20Young%20Man/chapter%201.md",
//     "https://raw.githubusercontent.com/groupystinks/skrik-view/master/data/A%20Portrait%20of%20the%20Artist%20as%20a%20Young%20Man/chapter%202.md",
//     "https://raw.githubusercontent.com/groupystinks/skrik-view/master/data/A%20Portrait%20of%20the%20Artist%20as%20a%20Young%20Man/chapter%203.md",
//     "https://raw.githubusercontent.com/groupystinks/skrik-view/master/data/A%20Portrait%20of%20the%20Artist%20as%20a%20Young%20Man/chapter%204.md",
//     "https://raw.githubusercontent.com/groupystinks/skrik-view/master/data/A%20Portrait%20of%20the%20Artist%20as%20a%20Young%20Man/chapter%205.md"
//   ],
//   title: 'A Portrait of the Artist as a Young Man',
// }
// let checkPsgApi = check.getChapters(options);

// var styles = {
//   app: {
//     paddingTop: '20px',
//   },
//
//   header: {
//     display: 'flex',
//   },
//
//   logo: {
//     color: Colors.accent,
//     fontSize: '24px',
//     fontWeight: 'bold',
//     lineHeight: '32px',
//     marginLeft: '12px',
//   },
//
//   logoName: {
//     marginRight: '12px',
//     '@media (max-width: 800px)': {
//       display: 'none',
//     },
//   },
//
//   search: {
//     marginLeft: '12px',
//   },
//
//   refresh: {
//     marginLeft: '12px',
//   },
//
//   style.passagesList: {
//     bottom: 0,
//     display: 'flex',
//     left: 0,
//     position: 'absolute',
//     right: 0,
//     top: '104px',
//   },
//
//   passagesList: {
//     flex: 1,
//     height: '100%',
//     minWidth: '300px',
//     maxWidth: '400px',
//   },
//
//   threadView: {
//     flex: 2,
//     height: '100%',
//   },
//
//   passageLoading: {
//     textAlign: 'center',
//     padding: '20px',
//   },
// };

module.exports = App;
