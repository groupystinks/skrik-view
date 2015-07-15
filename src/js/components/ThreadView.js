var KeyBinder = require('./KeyBinder');
var PassageStore = require('../stores/PassageStore');
var PassageView = require('./PassageView');
var Observer = require('./Observer');
var PureRender = require('./PureRender');
var Radium = require('radium');
var ThreadStore = require('../stores/ThreadStore');
var {Component, PropTypes} = require('react');
var {Observable} = require('rx-lite');


@KeyBinder
@Observer
@PureRender
@Radium
class ThreadView extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    style: PropTypes.object,
  };

  observe(props, context) {
    if (!props.params.passageName) {
      return {};
    }

    const observeThread = ThreadStore.getByName(
      {title: props.params.threadTitle, name: props.params.passageName}
    );

    const observePassage = observeThread.flatMap(thread => {
      if (!thread) {
        return Observable.return(null);
      }

      var passageTitle = thread.map(t => t.title);
      var passageURLs = thread.map(t => t.download_url);
      var passageNames= thread.map(t => t.name);

      var options= {};
      options.urls = passageURLs;
      options.title = passageTitle;
      options.names = passageNames;

      return PassageStore.getByURLs(options);
    });

    return {
      thread: observeThread,
      passage: observePassage,
    };
  }

  render(): ?ReactComponent {
    var passage = this.data.passage;
    console.log("passage in ThreadView: ", passage);

    if (!passage) {
      return null;
    }

    var title = this.props.title;

    return (
      <div style={[styles.root, this.props.style]}>
        <div style={styles.title}>
          {title}
        </div>

        <div style={styles.passage}>
          {passage.map(psg => (
            <PassageView
              isExpandedInitially={true}
              key={psg.name}
              passage={psg}
            />
          ))}
        </div>
      </div>
    );
  }
}

var styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  actionBar: {
    margin: '0 12px'
  },

  actionBarItem: {
    display: 'inline-block',
    margin: '0 12px 12px 0',
  },

  title: {
    fontWeight: 'bold',
    margin: '0 12px 12px 12px',
  },

  passage: {
    flex: 1,
    overflow: 'auto',
    paddingBottom: '12px',
  },
};

module.exports = ThreadView;
