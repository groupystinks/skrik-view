var Colors = require('./ColorMe');
var LineClamp = require('./LineClamp');
var PureRender = require('./PureRender');
var Radium = require('radium');
var React = require('react/addons');
var _ = require('lodash');
var {Component, PropTypes, findDOMNode} = require('react/addons');

@PureRender
@Radium
class BlockThreadList extends Component {
  static propTypes = {
    processes: PropTypes.array.isRequired,
    onThreadSelected: PropTypes.func.isRequired,
    selectedThreadName: PropTypes.string,
  };

  _onThreadClick = (index: number, passage: string) => {
    this.props.onThreadSelected(passage);
  };

  render(): any {
    console.log('Process in BlockThreadList: ', this.props.processes);
    return (
      <ul style={[styles.list.root, this.style]}>
        {this.props.processes.map((pro, index) => (
          <BlockThreadListItem
            index={index}
            key={index}
            process={pro}
            isSelected={pro.name === this.props.selectedThreadName}
            onClick={this._onThreadClick}
          />
        ))}
      </ul>
    );
  }
}


@PureRender
@Radium
class BlockThreadListItem extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    process: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    this._scrollIntoView();
  }

  componentDidUpdate(previousProps: any, previousState: any) {
    this._scrollIntoView();
  }

  _scrollIntoView() {
    if (this.props.isSelected) {
      findDOMNode(this).scrollIntoViewIfNeeded ?
        findDOMNode(this).scrollIntoViewIfNeeded(false) :
        findDOMNode(this).scrollIntoView(false);
    }
  };

  _onClick = () => {
    this.props.onClick(this.props.index, this.props.process);
  };

  render(): any {
    var pro = this.props.process;
    return (
      <li
        key={pro.name}
        onClick={this._onClick}
        style={styles.item.root}>
        <div style={[
          styles.item.inner,
          this.props.isSelected && styles.item.innerIsSelected
        ]}>
          <LineClamp lines={2} style={styles.item.text}>
            <span>
              {pro.name}{' '}
            </span>
            <span style={styles.item.snippet}>
              {_.unescape(pro.name)}…
            </span>
          </LineClamp>
        </div>
      </li>
    );
  }
}

var styles = {
  list: {
    root: {
      cursor: 'pointer',
      userSelect: 'none',
    }
  },

  item: {
    root: {
      display: 'block',
      lineHeight: 1.6,
      margin: '0 8px 8px 8px',
    },

    rootFirst: {
      borderTop: 'none',
    },

    inner: {
      borderRadius: '8px',
      padding: '8px 12px 12px 12px',

      ':hover': {
        background: Colors.irishGreen.lighten(44),
      }
    },

    innerIsSelected: {
      background: Colors.irishGreen,
      color: 'white',

      ':hover': {
        background: Colors.irishGreen,
      }
    },

    text: {
      fontSize: '14px',
    },

    snippet: {
      opacity: 0.5,
    },
  },
};

module.exports = BlockThreadList;
