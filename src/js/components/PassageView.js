var Colors = require('./ColorMe');
var PureRender = require('./PureRender');
var Radium = require('radium');
var _ = require('lodash');
var asap = require('asap');
var {Component, PropTypes, findDOMNode} = require('react/addons');

@PureRender
@Radium
class PassageView extends Component {
  static propTypes = {
    isExpandedInitially: PropTypes.bool,
    passage: PropTypes.object,
    style: PropTypes.object,
  };

  componentDidMount() {
    if (this.props.isExpandedInitially) {
      asap(()=> {
        findDOMNode(this).scrollIntoView(true);
      });
    }
  }

  constructor() {
    super();
    this.state = {
      isExpandedManually: null,
    };
  }

  _onClick = () => {
    this.setState({isExpandedManually: !this._isExpanded()});
  }

  _isExpanded(): bool {
    return this.state.isExpandedManually != null ?
      this.state.isExpandedManually :
      this.props.isExpandedInitially;
  }

  render(): any {
    if (!this.props.passage) {
      return (
        <div style={this.props.style} />
      );
    }
    var psg = this.props.passage;

    return (
      <div onClick={this._onClick} style={[this.props.style, styles.root]}>
        <div style={[
          styles.inner,
          !this._isExpanded() && styles.innerCollapsed
        ]}>
          {this._isExpanded() ? (
            <div
              style={styles.bodyStyle}
              dangerouslySetInnerHTML={{
                __html: psg.body
              }}
            />
          ) : (
            <div>{psg.title}</div>
          )}
        </div>
      </div>
    )
  }
}

var styles = {
  bodyStyle:{
    fontFamily: window.getComputedStyle(document.body).fontFamily,
    fontSize: '14px',
    padding: '12px',
  },
  root: {
    margin: '4px 12px 12px 12px',
  },

  inner: {
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0px 1px 2px 1px #ddd',
    padding: 12,
  },

  innerCollapsed: {
    background: Colors.gray1,
  },

  snippet: {
    fontSize: 14,
    marginTop: 12,
  },
};

module.exports = PassageView;
