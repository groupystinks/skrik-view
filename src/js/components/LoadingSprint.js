var Colors = require('./ColorMe');
var PureRender = require('./PureRender');
var Radium = require('radium');
var {Component} = require('react/addons');

@Radium
@PureRender
class LoadingSprint extends Component {
  render(): any {
    return (
      <div style={styles.root}>
        <div style={styles.inner} />
      </div>
    );
  }
}

var pulseKeyframes = Radium.keyframes({
  '0%': {width: '0%', opacity: .8},
  '100%': {width: '100%', opacity: .8},
});

var styles = {
  root: {
    backgroundImage: 'linear-gradient(-90deg, #14FFEF, #EFFF14)',
    left: 0,
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 10000,
  },

  inner: {
    animation: pulseKeyframes + ' 1s ease 0s infinite',
    background: Colors.tinyPink,
    height: '4px',
  },
};

module.exports = LoadingSprint;
