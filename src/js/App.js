var _ = require('lodash');
var asap = require('asap');
var {Component, PropTypes} = require('react');
var {Observable} = require('rx-lite');
var React = require('react/addons');
var Router = require('react-router');
var Radium = require('radium');

var API = require('./stores/api/API');
var ProcessActions = require('./actions/ProcessActions');
var KeyBinder = require('./components/KeyBinder');
var Observer = require('./components/Observer');
var PureRender = require('./components/PureRender');
var ProcessStore = require('./stores/ProcessStore');
var Scroller = require('./components/Scroller');
var LoadingSprint = require('./components/LoadingSprint');
var BlockThreadList = require('./components/BlockThreadList');
var Colors = require('./components/ColorMe');

var RouteHandler = Router.RouteHandler;

// /* debug
//  * ----------------
// */
// var ProcessAPI = require('./stores/api/ProcessAPI');
// ProcessAPI.list().then(result => .log("ProcessAPI: ", result));
// /*
//  * end of it
// */

var SHEET_SIZE = 10;

var dummySubscription = {remove() {}};

@KeyBinder
@Observer
@PureRender
@Radium
class App extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  state = {
    initialThread: 0,
    maxResults: SHEET_SIZE,
    title: "A Portrait of the Artist as a Young Man",
    query: 'in:inbox',
    queryProgress: 'in:inbox',
    isLoading: false,
  };

  // equiped with remove method for dummy
  _subscriptions = [dummySubscription];


  observe() {
    var processObservable = ProcessStore.list();
    // const threadObservable = ThreadStore.list({
    //   query: this.state.query,
    //   maxResults: this.state.maxResults,
    //   title: this.state.title,
    // });
    // const threadObservable = processObservable.map(pro => {
    //   console.log("processObservable in threadObservable: ", pro);
    //   if (!pro) {
    //     return Observable.return(null);
    //   }
    //
    //   return pro.items.map(p => {
    //     var options = {};
    //     options.query = p.name;
    //     options.title = p.name;
    //     options.maxResults = this.state.maxResults;
    //
    //     return ThreadStore.list(options);
    //   });
    //     // var options = {};
    //     // options.title = pro.items[0].name;
    //     // options.query = this.state.query;
    //     // options.maxResults = this.state.maxResults;
    // });
    //
    // const passageObservable = threadObservable.flatMap(passagePack => {
    //   console.log("threadObservable in passageObservable: ", passagePack);
    //   if (!passagePack) {
    //     return Observable.return(null);
    //   }
    //   var passageTitle = this.state.title;
    //   var passageURLs = passagePack.items.map(thread => thread.download_url);
    //   var passageNames= passagePack.items.map(thread => thread.name);
    //
    //   var options= {};
    //   options.maxResults = this.state.maxResults;
    //   options.urls = passageURLs;
    //   options.title = passageTitle;
    //   options.names = passageNames;
    //
    //   return PassageStore.getByURLs(options);
    // });

    /*
     * debug
    */
    return {
      processes: processObservable,
      // threads: null,
      // lastPassageInEachThread: null,
    };
  }

  componentDidMount() {
    this._subscriptions = [];

    this._subscriptions.push(API.subscribe('start', () => {
      if (!this.state.isLoading) {
        asap(() => this.setState({isLoading: true}));
      }}));

    this._subscriptions.push(API.subscribe('allStopped', () => {
      asap(() => this.setState({isLoading: false}));
    }));
  }

  componentWillUnmount() {
    this._subscriptions.forEach(s => s.remove());
  }

  _onLogoClick = () => {
    window.location.reload();
  };

  _onThreadSelected = (process) => {
    ProcessActions.select(process);
  };

  render():any {
    return (
      <div style={styles.app}>
        {this.state.isLoading ? <LoadingSprint /> : null}

        <div style={styles.header}>
          <span onClick={this._onLogoClick} style={styles.logo}>
            pX(!!)Xq
            <span style={styles.logoName}>{' '}    Skrik</span>
          </span>
        </div>
        <div style={styles.threads}>
        {this.data.processes ? (
          <Scroller
            isScrollContainer={true}
            style={styles.threadList}>
            <BlockThreadList
              processes={this.data.processes.items}
              onThreadSelected={this._onThreadSelected}
              selectedThreadName={this.props.params.threadName}
            />
           </Scroller>
         ) : (
           <div style={styles.threadList} />
         )}
          <div style={styles.processView}>
            <RouteHandler
             params={this.props.params}
            />
          </div>
        </div>
      </div>
    );
  }
}


var styles = {
  app: {
    paddingTop: '20px',
  },

  header: {
    display: 'flex',
  },

  logo: {
    color: Colors.irishGreen,
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '32px',
    marginLeft: '12px',
  },

  logoName: {
    color: Colors.black,
    marginRight: '12px',
    '@media (max-width: 800px)': {
      display: 'none',
    },
  },

  search: {
    marginLeft: '12px',
  },

  refresh: {
    marginLeft: '12px',
  },

  threads: {
    bottom: 0,
    display: 'flex',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '104px',
  },

  threadList: {
    flex: 1,
    height: '100%',
    minWidth: '100px',
    maxWidth: '200px',
  },

  processView: {
    flex: 1,
    height: '100%',
  },

  passageLoading: {
    textAlign: 'center',
    padding: '20px',
  },
};

module.exports = App;
