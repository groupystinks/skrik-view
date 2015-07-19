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
var Toggler = require('./components/Toggler');
var Parallel = require('./components/Parallel');
var ShriekButton = require('./components/ShriekButton');
var BlockThreadList = require('./components/BlockThreadList');
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
    threadListDisplay: true,
    passagesListDisplay: true,
    maxResults: SHEET_SIZE,
    isLoading: false,
  };

  // equiped with remove method for dummy
  _subscriptions = [dummySubscription];


  observe() {
    var processObservable = ProcessStore.list();

    return {
      processes: processObservable,
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

  _onToggleView = () => {
    if (this.state.threadListDisplay && this.state.passagesListDisplay) {
      this.setState({threadListDisplay: false});
    } else if (this.state.passagesListDisplay) {
      this.setState({passagesListDisplay: false})
    } else {
      this.setState({threadListDisplay: true});
      this.setState({passagesListDisplay: true});
    }
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
            <Parallel />
            <span style={styles.logoName}> Skrik</span>
          </span>
          <ShriekButton onClick={this._onToggleView}>
            <Toggler
              threadDisplay={this.state.threadListDisplay}
              passagesDisplay={this.state.passagesListDisplay}
            />
          </ShriekButton>
        </div>
        <div style={styles.threads}>
        {this.data.processes ? (
          <Scroller
            isScrollContainer={true}
            style={styles.threadList}
            isDisplayed={this.state.threadListDisplay}>
            <BlockThreadList
              processes={this.data.processes.items}
              onThreadSelected={this._onThreadSelected}
              selectedThreadTitle={this.props.params.threadTitle}
            />
           </Scroller>
         ) : (
           <div style={styles.threadList} />
         )}
          <div style={styles.processView}>
            <RouteHandler
             params={this.props.params}
             passagesListDisplay={this.state.passagesListDisplay}
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
    display: 'inherit',
    color: Colors.irishGreen,
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '32px',
    marginLeft: '12px',
  },

  logoName: {
    color: Colors.irishGreen.saturate(40),
    marginRight: '12px',
    '@media (max-width: 800px)': {
      display: 'none',
    },
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
    borderRight: '1px solid ' + Colors.gray1,
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
