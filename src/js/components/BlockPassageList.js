var Colors = require('./ColorMe');
var LineClamp = require('./LineClamp');
var PureRender = require('./PureRender');
var Radium = require('radium');
var React = require('react/addons');
var RelativeDate = require('./RelativeDate');
var _ = require('lodash');
var {Component, PropTypes, findDOMNode} = require('react/addons');

@PureRender
@Radium
class BlockPassageList extends Component {
  static propTypes = {
    passages: PropTypes.array.isRequired,
    onPassageSelected: PropTypes.func.isRequired,
    selectedPassageName: PropTypes.string,
  };

  _onPassageClick = (index: number, passage: string) => {
    this.props.onPassageSelected(passage);
  };

  render(): any {
    return (
      <ul style={[styles.list.root, this.style]}>
        {this.props.passages.map((psg, index) => (
          <BlockPassageListItem
            index={index}
            isSelected={psg.id === this.props.selectedPassageName}
            key={index}
            passage={psg}
            onClick={this._onPassageClick}
          />
        ))}
      </ul>
    );
  }
}


@PureRender
@Radium
class BlockPassageListItem extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    isSelected: PropTypes.bool.isRequired,
    passage: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
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
    this.props.onClick(this.props.index, this.props.passage);
  };

  render(): any {
    var psg = this.props.passage;
    return (
      <li
        key={psg.id}
        onClick={this._onClick}
        style={styles.item.root}>
        <div style={[
          styles.item.inner,
          this.props.isSelected && styles.item.innerIsSelected
        ]}>
          <LineClamp lines={2} style={styles.item.text}>
            <span>
              {psg.title}{' '}
            </span>
            <span style={styles.item.snippet}>
              {_.unescape(psg.name)}…
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

    innerIsUnread: {
      background: Colors.irishGreen.lighten(40),

      ':hover': {
        background: Colors.irishGreen.lighten(40),
      }
    },

    innerIsSelected: {
      background: Colors.irishGreen,
      color: 'white',

      ':hover': {
        background: Colors.irishGreen,
      }
    },

    top: {
      display: 'flex',
    },

    date: {
      fontSize: '14px',
      opacity: 0.5,
      textAlign: 'right',
      whiteSpace: 'nowrap',
    },

    text: {
      fontSize: '14px',
    },

    sender: {
      flex: 1,
      color: Colors.irishGreen,
      fontWeight: 'bold',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    senderIsSelected: {
      color: 'white',
    },

    snippet: {
      opacity: 0.5,
    },

    star: {
      color: 'yellow',
      marginRight: '4px',
      textShadow: `
        -1px -1px 0 #999,
        1px -1px 0 #999,
        -1px 1px 0 #999,
        1px 1px 0 #999,
        -1px 0 0 #999,
        1px 0 0 #999,
        0 1px 0 #999,
        0 -1px 0 #999
      `,
    },
  },
};

module.exports = BlockPassageList;
