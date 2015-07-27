var Colors = require('./ColorMe');
var PureRender = require('./PureRender');
var Radium = require('radium');
var {Component, PropTypes} = require('react/addons');

@PureRender
@Radium
class Toggler extends Component {
  static propTypes = {
    threadDisplay: PropTypes.bool,
    passagesDisplay: PropTypes.bool,
  };

  render(): any {
    return (
      <div
        style={styles.aToggle}>
        <span>| </span>
        {this.props.threadDisplay ? <span>| </span>  : null}
        {this.props.passagesDisplay ? <span>|</span>  : null}
      </div>
    );
  }
}

var styles = {
  aToggle: {
    fontSize: '18px',
  },
}

module.exports = Toggler;
