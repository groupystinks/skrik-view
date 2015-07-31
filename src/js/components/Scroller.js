/**
 * A fancy, Facebook-style scrollbar.
 *
 * Known issues:
 * - scrolling over the scrollbar does not work
 * - clicking the scrollbar not on the thumb doesn't scroll
 */

// Inspired by:
// https://github.com/leoselig/jsFancyScroll/

var PureRender = require('./PureRender');
var Radium = require('radium');
var InfiniteScroll = require('./InfiniteScroll');
var {Component, PropTypes, findDOMNode} = require('react/addons');

var scrollBarWidth = '15px';

@PureRender
@Radium
class Scroller extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.object,
    isDisplayed: PropTypes.bool,
  };

  constructor() {
    super();

    this.state = {
      scrollTop: 0,
      scrollHeight: 1,
      offsetHeight: 1,
    };
  }

  _previousUserSelect = '';
  _isMouseDown = false;
  _lastPageY = 0;

  _attachBodyListeners() {
    document.addEventListener('mouseup', this._onDocumentMouseUp);
    document.addEventListener('mouseleave', this._onDocumentMouseUp);
    document.addEventListener('mousemove', this._onDocumentMouseMove);
    document.addEventListener('selectstart', this._onDocumentSelectStart);
    this._previousUserSelect = (document.body.style: any).userSelect;
    (document.body.style: any).userSelect = 'none';
  }

  _detachBodyListeners() {
    document.removeEventListener('mouseup', this._onDocumentMouseUp);
    document.removeEventListener('mouseleave', this._onDocumentMouseUp);
    document.removeEventListener('mousemove', this._onDocumentMouseMove);
    document.removeEventListener('selectstart', this._onDocumentSelectStart);
  }

  _onScroll = () => {
    var viewport = findDOMNode(this.refs.viewport);
    this.setState({
      scrollTop: viewport.scrollTop,
      scrollHeight: viewport.scrollHeight,
      offsetHeight: viewport.offsetHeight,
    });
  };

  _onDocumentSelectStart = (event: Object) => {
    event.preventDefault();
  };

  _onScrollbarMouseDown = (event: Object) => {
    this._attachBodyListeners();
    this._isMouseDown = true;
    this._lastPageY = event.pageY;
    this.setState({isMouseDown: true});
  };

  _onDocumentMouseUp = (event: Object) => {
    this._detachBodyListeners();
    this._isMouseDown = false;
    this.setState({isMouseDown: false});
  };

  _onDocumentMouseMove = (event: Object) => {
    if (this._isMouseDown) {
      var scale = this._getScale();
      var diff = event.pageY - this._lastPageY;
      var viewport = findDOMNode(this.refs.viewport);
      var newScrollTop = (viewport.scrollTop + diff / scale);

      viewport.scrollTop = Math.max(0, newScrollTop);
      this._lastPageY = event.pageY;
    }
  };

  _onScrollerMouseEnter = () => {
    this.setState({isHover: true});
  };

  _onScrollerMouseLeave = () => {
    this.setState({isHover:false});
  };

  _getScale(): number {
    return this.state.offsetHeight / this.state.scrollHeight;
  }

  render(): any {
    var scale = this._getScale();
    var thumbHeight = this.state.offsetHeight * scale;
    var thumbTop = this.state.scrollTop * scale;

    return (
      <div
        onMouseEnter={this._onScrollerMouseEnter}
        onMouseLeave={this._onScrollerMouseLeave}
        style={[
          this.props.style,
          styles.scroller,
          !this.props.isDisplayed && styles.displayNone
          ]}>
        <div
          onMouseDown={this._onScrollbarMouseDown}
          style={[
            styles.scrollbar,
            (this.state.isHover || this.state.isMouseDown) && styles.scrollbarHover
          ]}>
          <div
            style={[styles.thumb, {height: thumbHeight, top:thumbTop}]}
          />
        </div>
        <InfiniteScroll
          onScroll={this._onScroll}
          ref="viewport"
          style={styles.viewport}
          threshold={this.props.threshold}>
          <div style={styles.content}>
            {this.props.children}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
}

var takeColumnOut = Radium.keyframes({
  '0%': {flexGrow: 1},
  '100%': {flexGrow: 0.00001,},
});


var styles = {
  displayNone: {
    flexGrow: 0.00001,
    minWidth: 0,
    animation: takeColumnOut + ' .3s 1 ease',
  },

  scroller: {
    flexGrow: 1,
    overflow: 'hidden',
    position: 'relative',
  },

  scrollbar: {
    bottom: 0,
    opacity: 0,
    position: 'absolute',
    right: '0',
    top: 0,
    transition: 'opacity .25s',
    width: '8px',
  },

  scrollbarHover: {
    opacity: 1,
  },

  thumb: {
    background: 'rgba(0, 0, 0, .4)',
    borderRadius: '4px',
    position: 'absolute',
    right: '0',
    width: '8px',
  },

  viewport: {
    boxSizing: 'content-box',
    height: '100%',
    marginRight: '-' + scrollBarWidth,
    overflowX: 'hidden',
    overflowY: 'scroll',
    paddingRight: scrollBarWidth,
    width: '100%',
  },

  content: {
    marginRight: '-' + scrollBarWidth,
  },
};

module.exports = Scroller;
