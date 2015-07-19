var Colors = require('./ColorMe');
var PureRender = require('./PureRender');
var Radium = require('radium');
var {Component, PropTypes} = require('react/addons');

@PureRender
@Radium
class ShriekButton extends Component {
  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
  }

  _onClick = () => {
    this.props.onClick && this.props.onClick();
  };

  render(): any {
    return (
      <button
        onClick={this._onClick}
        style={styles.root}>
        {this.props.children}
      </button>
    );
  }
}

var styles = {
  root: {
    background: Colors.whiteSmoke,
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
    height: '30px',
    margin: 0,
    padding: '1px 16px',
    boxShadow: '0px 1px 2px 1px #ddd',
    verticalAlign: 'top',

    ':active': {
      padding: '2px 15px 0 17px',
    },
  }
}

module.exports = ShriekButton;
