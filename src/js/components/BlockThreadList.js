var Colors = require('./ColorMe');
var LineClamp = require('./LineClamp');
var PureRender = require('./PureRender');
var Radium = require('radium');
var _ = require('lodash');
var {Component, PropTypes, findDOMNode} = require('react/addons');
var fileImage = require('../../images/file16.png');

@PureRender
@Radium
class BlockThreadList extends Component {
  static propTypes = {
    processes: PropTypes.array.isRequired,
    onThreadSelected: PropTypes.func.isRequired,
    selectedThreadTitle: PropTypes.string,
  };

  _onThreadClick = (index: number, passage: string) => {
    this.props.onThreadSelected(passage);
  };

  render(): any {
    return (
      <ul style={[styles.list.root, this.style]}>
        {this.props.processes.map((pro, index) => (
          <BlockThreadListItem
            index={index}
            key={index}
            process={pro}
            isSelected={pro.name === this.props.selectedThreadTitle}
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
    var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    return (
      <li
        key={pro.name}
        onClick={this._onClick}
        style={styles.item.root}>
        <div style={[
          styles.item.inner,
          this.props.isSelected && styles.item.innerIsSelected
        ]}>
          <span><img src={fileImage} style={styles.item.image}/></span>
          {is_firefox ?
          (<span style={styles.item.snippet}>
            {pro.name}{' '}
          </span>):(
          <span style={styles.item.lineClampWrapper}>
            <LineClamp lines={2} style={styles.item.text}>
              <span style={styles.item.snippet}>
                {pro.name}{' '}
              </span>
            </LineClamp>
          </span>)}
        </div>
      </li>
    );
  }
}


/*
 * TODO: box-shadow
*/
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

    image: {
      position: 'relative',
      paddingRight: "5px",
      verticalAlign: 'top',
    },

    lineClampWrapper: {
      display: 'inline-block',
    },

    rootFirst: {
      borderTop: 'none',
    },

    inner: {
      borderRadius: '8px',
      padding: '8px 12px 12px 12px',

      ':hover': {
        background: Colors.whiteSmoke,
      }
    },

    innerIsSelected: {
      background: Colors.whiteSmoke.darken(8),
      color: Colors.black,

      ':hover': {
        background: Colors.whiteSmoke.darken(8),
      }
    },

    text: {
      fontSize: '14px',
    },
  },
};

module.exports = BlockThreadList;
