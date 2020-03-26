/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const nullthrows = require('nullthrows').default;
const { sansSerif } = require('./Themes/Fonts');
const HighlightHover = require('./HighlightHover');
var styleClasses = require('./ContextMenu.css');
const decorate = require('./decorate');

import type { Theme } from './types';

export type MenuItem = {
  key: string,
  title: string,
  action: () => void
};

type Props = {
  open: boolean,
  hideContextMenu: () => void,
  items: Array<MenuItem>,
  pos?: {
    x: number,
    y: number,
  },
};

type State = {
  elementHeight: number,
  windowHeight: number,
};

class ContextMenu extends React.Component<Props, State> {
  _clickout: (evt: Object) => void;

  context: {
    theme: Theme,
  };

  state = {
    elementHeight: 0,
    windowHeight: 0,
  };

  handleBackdropClick: () => void;

  constructor(props) {
    super(props);
    if (props.pos) {
      this.posX = props.pos.x;
      this.posY = props.pos.y;
    } else {
      this.posX = 0;
      this.posY = 0;
    }
    this.cachedItems = props.items || [];

    this.elementRef = null;

    this.handleBackdropClick = this.handleBackdropClick.bind(this);
  }

  onClick(i, evt) {
    this.props.items[i].action();
  }

  handleBackdropClick(evt) {
    evt.preventDefault();
    if (this.props.hideContextMenu) {
      this.props.hideContextMenu();
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.pos) {
      this.posX = nextProps.pos.x;
      this.posY = nextProps.pos.y;
    }
    if (nextProps.items) {
      this.cachedItems = nextProps.items;
    }
    return true;
  }

  componentDidUpdate() {
    const element = this.elementRef;
    if (!element) {
      return;
    }

    const elementHeight = nullthrows(element.querySelector('.selectthis')).clientHeight;
    const windowHeight = window.innerHeight;

    if (this.state.elementHeight === elementHeight && this.state.windowHeight === windowHeight) {
      return;
    }

    setTimeout(() => {
      this.setState({
        elementHeight: elementHeight,
        windowHeight: windowHeight,
      });
    }, 0);
  }

  _setRef = element => {
    this.elementRef = element;
  };

  render() {
    const { theme } = this.context;
    const { open } = this.props;
    const { elementHeight, windowHeight } = this.state;

    var items = this.cachedItems;
    var posY = this.posY;
    var inverted = posY + elementHeight > windowHeight;

    if (inverted) {
      posY -= elementHeight;
    }

    return (
      <div
        className={[styleClasses.ContextMenu].concat(
          open ? [] : styleClasses.ContextMenuHidden,
          inverted ? styleClasses.ContextMenuInverted : []
        ).join(' ')}
        onClick={this.handleBackdropClick}
        ref={this._setRef}
      >
        <div className="selectthis" style={containerStyle(this.posX, posY, theme)}>
          <ul className={styleClasses.ContextMenu__inner}>
            {!items.length && (
              <li style={emptyStyle(theme)}>No actions</li>
            )}
            {items.map((item, i) => item && (
              <li style={listItemStyle(theme)} key={item.key} onClick={open ? evt => this.onClick(i, evt) : null}>
                <HighlightHover style={styles.highlightHoverItem}>
                  {item.title}
                </HighlightHover>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

ContextMenu.contextTypes = {
  theme: PropTypes.object.isRequired,
};

var Wrapped = decorate({
  listeners() {
    return ['contextMenu'];
  },
  props(store, props) {
    if (!store.contextMenu) {
      return { open: false };
    }
    var { x, y, type, args } = store.contextMenu;

    var items = [];
    args.push(store);

    props.itemSources.forEach(source => {
      if (!source || !source[type]) {
        return;
      }
      var newItems = source[type](...args);
      if (newItems) {
        items = items.concat(newItems.filter(v => !!v));
      }
    });

    return {
      open: true,
      pos: { x, y },
      hideContextMenu: () => store.hideContextMenu(),
      items,
    };
  },
}, ContextMenu);


const containerStyle = (xPos: number, yPos: number, theme: Theme) => ({
  top: `${yPos}px`,
  left: `${xPos}px`,
  position: 'fixed',
  fontSize: sansSerif.sizes.normal,
  borderRadius: '0.2rem',
  overflow: 'hidden',
  zIndex: 1,
  backgroundColor: theme.base00,
  boxShadow: '0 6px 20px rgba(0,0,0,.1),0 0 8px rgba(0,0,0,.08)',
});

const emptyStyle = (theme: Theme) => ({
  padding: '0.35rem .75rem',
  color: theme.base03,
});

const listItemStyle = (theme: Theme) => ({
  color: theme.base05,
});

var styles = {
  highlightHoverItem: {
    padding: '0.35rem .75rem',
    cursor: 'default',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    userSelect: 'none',
  },
};

module.exports = Wrapped;
