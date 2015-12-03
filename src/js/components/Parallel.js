var Colors = require('./ColorMe');
var PureRender = require('./PureRender');
var Radium = require('radium');
var {Component} = require('react/addons');

@PureRender
@Radium
class Parallel extends Component {
  render(): any {
    return (
      <span>
        <div style={styles.first}>
          <div style={styles.second}>
            <div style={styles.third}></div>
          </div>
        </div>
      </span>
    );
  }
}


var spinKeepKeyframe = Radium.keyframes({
  '0%': {transform: 'rotateZ(0deg)'},
  '100%': {transform: 'rotateZ(360deg)'},
});

var spinRemoveKeyframe = Radium.keyframes({
  '0%': {
    transform: 'rotateZ(0deg)',
    borderColor: 'rgba(0, 153, 0, 1)',
  },

  '100%': {
    transform: 'rotateZ(360deg)',
    borderColor: 'rgba(0, 153, 0, 0)',
  },
});

var styles = {
  first: {
    width: '30px',
    height: '40px',
    margin: '-10px -15px 0 10px',
    borderLeft: '3px solid ' + Colors.irishGreen,
    animation: spinKeepKeyframe + ' 2s 1 linear',
  },

  second: {
    width: '20px',
    height: '30px',
    margin: '5px',
    borderLeft: '3px solid ',
    borderColor: 'rgba(0, 153, 0, 0)',
    animation: spinRemoveKeyframe + ' 2s 1 linear',
  },

  third: {
    width: '10px',
    height: '20px',
    margin: '5px',
    borderLeft: '3px solid ',
    borderColor: 'rgba(0, 153, 0, 0)',
    animation: spinRemoveKeyframe + ' 2s 1 linear',
  },
};

module.exports = Parallel;
