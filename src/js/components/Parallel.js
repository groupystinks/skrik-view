var Colors = require('./ColorMe');
var PureRender = require('./PureRender');
var Radium = require('radium');
var {Component, PropTypes} = require('react/addons');

@PureRender
@Radium
class Parallel extends Component {
  render(): any {
    return (
      <span style={styles.panWrapper}>
        <div style={[styles.first, styles.divs]}>
          <div style={[styles.second, styles.divs]}>
            <div style={[styles.third, styles.divs]}></div>
          </div>
        </div>
      </span>
    );
  }
}


var spinKeyframe = Radium.keyframes({
  '0%': {transform: 'rotateZ(0deg)'},
  '100%': {transform: 'rotateZ(360deg)'},
});

var styles = {
  spanWrapper: {
    display: 'inherit',
  },

  divs: {
    borderLeft: '3px solid ' + Colors.irishGreen,
    animation: spinKeyframe + ' 2s 1 linear',
  },

  first: {
    width: '50px',
    height: '50px',
    marginTop: '-15px',
  },

  second: {
    width: '40px',
    height: '40px',
    margin: '5px',
  },

  third: {
    width: '30px',
    height: '30px',
    margin: '5px',
  },
};

module.exports = Parallel;
