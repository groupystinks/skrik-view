var _ = require('lodash');
var {Component, PropTypes} = require('react');
var {Observable} = require('rx-lite');
var React = require('react/addons');
var Router = require('react-router');
var Radium = require('radium');

var PassageActions = require('../actions/PassageActions');
var PassageStore = require('../stores/PassageStore');
var ThreadStore = require('../stores/ThreadStore');
var ThreadActions = require('../actions/ThreadActions');
var KeyBinder = require('./KeyBinder');
var Observer = require('./Observer');
var PureRender = require('./PureRender');
var Scroller = require('./Scroller');
var LoadingSprint = require('./LoadingSprint');
var BlockPassageList = require('./BlockPassageList');
var Colors = require('./ColorMe');

var RouteHandler = Router.RouteHandler;


var SHEET_SIZE = 10;

@Observer
@PureRender
@Radium
class ProcessView extends Component {
  static propTypes = {
    passagesListDisplay: PropTypes.bool,
    params: PropTypes.object.isRequired,
    style: PropTypes.object,
  };

  state = {
    maxResults: SHEET_SIZE,
  };

  observe(props, context) {
    const threadObservable = ThreadStore.list({
      query: props.params.threadTitle,
      maxResults: this.state.maxResults,
      title: props.params.threadTitle,
    });

    const passageObservable = threadObservable.flatMap(passagePack => {
      if (!passagePack) {
        return Observable.return(null);
      }
      var passageTitle = this.props.params.threadTitle;
      var passageURLs = passagePack.items.map(thread => thread.download_url);
      var passageNames= passagePack.items.map(thread => thread.name);

      var options= {};
      options.maxResults = this.state.maxResults;
      options.urls = passageURLs;
      options.title = passageTitle;
      options.names = passageNames;

      return PassageStore.getByURLs(options);
    });

    return {
      threads: threadObservable,
      lastPassageInEachThread: passageObservable,
    };
  }

  /*
   * TODO: implement _onRefreshThread
  */
  _onRefreshThread = () => {
    ThreadActions.refresh();
  };

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

  render():any {
    return(
        <div style={styles.root}>
          {this.data.threads &&
            this.data.lastPassageInEachThread ? (
            <Scroller
              isScrollContainer={true}
              style={styles.passagesList}
              isDisplayed={this.props.passagesListDisplay}>
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
            />
          </div>
        </div>
    )
  }
}

var styles = {
  root: {
    display: 'flex',
    height: '100%',
  },

  passagesList: {
    borderRight: '1px solid ' + Colors.gray1,
    flex: 1,
    height: '100%',
    minWidth: '300px',
    maxWidth: '400px',
  },

  threadView: {
    flex: 2,
    height: '100%',
  },
};

module.exports = ProcessView;
