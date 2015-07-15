var _ = require('lodash');
var asap = require('asap');
var {Component, PropTypes} = require('react');
var {Observable} = require('rx-lite');
var React = require('react/addons');
var Router = require('react-router');
var Radium = require('radium');

var API = require('./stores/api/API');
var KeyBinder = require('./components/KeyBinder');
var Observer = require('./components/Observer');
var PureRender = require('./components/PureRender');
var PassageActions = require('./actions/PassageActions');
var PassageStore = require('./stores/PassageStore');
var ThreadActions = require('./actions/ThreadActions');
var ThreadStore = require('./stores/ThreadStore');
var Scroller = require('./components/Scroller');
var LoadingSprint = require('./components/LoadingSprint');
var BlockPassageList = require('./components/BlockPassageList');
var Colors = require('./components/ColorMe');

var RouteHandler = Router.RouteHandler;

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
    // isLoading: !isOffline(),
    maxResults: SHEET_SIZE,
    title: "A Portrait of the Artist as a Young Man",
    query: 'in:inbox',
    queryProgress: 'in:inbox',
    isLoading: false,
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

  // keep it for extensibiltiy
  _onRequestMoreItems = () => {
    this.setState({maxResults: this.state.maxResults + SHEET_SIZE});
  };

  _onPassageSelected = (passage) => {
    PassageActions.select(passage);
  };

  _selectNextPassage = () => {
    this._onPassageSelected(this._getNextPassage());
  };

  _selectPreviousPassage = () => {
    this._onPassageSelected(this._getPreviousPassage());
  };

  _getNextPassage() {
    var passages = this.data.lastPassageInEachThread;
    if (!passages) {
      return null;
    }

    var selectedPassageIndex = this.props.params.passageName &&
      passages.findIndex(
        pass => pass.name === this.props.params.passageName
      );

    if (!this.props.params.passageName) {
      return passages[0];
    } else if (selectedPassageIndex < 0 || selectedPassageIndex === passages.length) {
      return null;
    } else {
      return passages[selectedPassageIndex + 1];
    }
  }

  _getPreviousPassage() {
    var passages = this.data.lastPassageInEachThread;
    if (!passages) {
      return null;
    }

    var selectedPassageIndex = this.props.params.passageName &&
      passages.findIndex(
        pass => pass.name === this.props.params.passageName
      );

    if (!this.props.params.passageName) {
      return passages[0];
    } else if (selectedPassageIndex < 0 || selectedPassageIndex === passages.length) {
      return null;
    } else {
      return passages[selectedPassageIndex - 1];
    }
  }

  _onRefresh = () => {
    ThreadActions.refresh();
  };

  _onLogoClick = () => {
    window.location.reload();
  };

  render():any {
    console.log("passage in APP: ", this.data.lastPassageInEachThread);
    return (
      <div style={styles.app}>
        {this.state.isLoading ? <LoadingSprint /> : null}

        <div style={styles.header}>
          <span onClick={this._onLogoClick} style={styles.logo}>
            pX(!!)Xq
            <span style={styles.logoName}>{' '}    Skrik</span>
          </span>
        </div>
        <div style={styles.passages}>
          {this.data.threads &&
            this.data.lastPassageInEachThread ? (
            <Scroller
              isScrollContainer={true}
              style={styles.passagesList}>
              <BlockPassageList
                passages={this.data.lastPassageInEachThread}
                onPassageSelected={this._onPassageSelected}
                selectedPassageName={this.props.params.passageName}
              />
            </Scroller>
          ) : (
            <div style={styles.passagesList} />
          )}
          <div style={styles.threadView}>
            <RouteHandler
              params={this.props.params}
              title={this.state.title}
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

  passages: {
    bottom: 0,
    display: 'flex',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '104px',
  },

  passagesList: {
    flex: 1,
    height: '100%',
    minWidth: '300px',
    maxWidth: '400px',
  },

  threadView: {
    flex: 2,
    height: '100%',
  },

  passageLoading: {
    textAlign: 'center',
    padding: '20px',
  },
};

module.exports = App;
