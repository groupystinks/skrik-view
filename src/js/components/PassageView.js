var Colors = require('./ColorMe');
var PureRender = require('./PureRender');
var Radium = require('radium');
var asap = require('asap');
var {Component, PropTypes, findDOMNode} = require('react/addons');

@PureRender
@Radium
class PassageView extends Component {
  static propTypes = {
    threadListDisplay: PropTypes.bool,
    passagesListDisplay: PropTypes.bool,
    passage: PropTypes.object,
    style: PropTypes.object,
  };

  componentDidMount() {
    asap(()=> {
      findDOMNode(this).scrollIntoView(true);
    });
  }

  constructor() {
    super();
  }

  render(): any {
    if (!this.props.passage) {
      return (
        <div style={this.props.style} />
      );
    }
    var psg = this.props.passage;

    return (
      <div style={[this.props.style, styles.root]}>
        <div style={styles.inner}>
          <div
            style={styles.bodyStyle}
            className='readingContent'
            dangerouslySetInnerHTML={{
              __html: psg.body
            }}
          />
        </div>
      </div>
    )
  }
}

var styles = {
  root: {
    margin: '4px 12px 12px 12px',
  },

  bodyStyle: {
    maxWidth: '780px',
    margin: 'auto',
    fontFamily: window.getComputedStyle(document.body).fontFamily,
    padding: '12px',
  },

  inner: {
    background: Colors.whiteSmoke,
    borderRadius: '4px',
    boxShadow: '0px 1px 2px 1px #ddd',
  },
};

module.exports = PassageView;
