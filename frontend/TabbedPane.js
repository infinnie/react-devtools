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
const decorate = require('./decorate');
const { sansSerif } = require('./Themes/Fonts');

import type { Theme } from './types';

type Props = {
  tabs: { [key: string]: () => React.Node },
  selected: string,
  setSelectedTab: (name: string) => void,
};

class TabbedPane extends React.Component<Props> {
  context: {
    theme: Theme,
  };

  setListRef = (el) => {
    this.listEl = el;
  }

  setOffsetRef = (el) => {
    this.offsetEl = el;
  }

  processLayout() {
    if (this.listEl) {
      const current = this.listEl.querySelector('.selectthis');
      if (current) {
        const bcr = current.getBoundingClientRect();
        if (this.offsetEl) {
          console.log('detected');
          this.offsetEl.style.transform = `translate3D(${bcr.left + 12}px,0,0) scaleX(${bcr.width - 24})`;
        }
      }
    }
  }

  componentDidMount() {
    this.processLayout();
  }

  componentDidUpdate() {
    this.processLayout();
  }

  render() {
    var { theme } = this.context;
    var tabs = Object.keys(this.props.tabs);
    if (tabs.length === 1) {
      return this.props.tabs[tabs[0]]();
    }
    return (
      <div style={styles.container}>
        <ul style={tabsStyle(theme)} ref={this.setListRef}>
          <li
            ref={this.setOffsetRef}
            style={{
              background: theme.hasInvert ? theme.state00 : theme.special05,
              position: 'absolute',
              bottom: 1,
              left: 0,
              height: 2,
              width: 1,
              transition: 'transform .2s',
              transformOrigin: 'left top',
            }}
          />
          {tabs.map((name, i) => (
            <li
              className={name === this.props.selected ? 'selectthis' : ''}
              key={name + i}
              onClick={() => this.props.setSelectedTab(name)}
              style={tabStyle(name === this.props.selected, theme)}
            >
              {name}
            </li>
          ))}
        </ul>
        <div style={styles.body}>
          {this.props.tabs[this.props.selected]()}
        </div>
      </div>
    );
  }
}

TabbedPane.contextTypes = {
  theme: PropTypes.object.isRequired,
};

const tabsStyle = (theme: Theme) => ({
  display: 'flex',
  flexShrink: 0,
  listStyle: 'none',
  margin: 0,
  backgroundColor: theme.base01,
  padding: '0 0.25rem',
  lineHeight: 1.5,
  position: 'relative',
  boxShadow: '0 2px 7px rgba(0,0,0,.06), 0 0 4px rgba(0,0,0,.08)',
  zIndex: 1,
});

const tabStyle = (isSelected: boolean, theme: Theme) => {
  return {
    padding: '0.25rem 0.75rem',
    fontSize: sansSerif.sizes.normal,
    cursor: 'pointer',
    borderTop: '1px solid transparent',
    background: isSelected ? theme.base00 : 'transparent',
    marginBottom: 1,
  };
};

var styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  body: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
  },
};

module.exports = decorate({
  listeners: () => ['selectedTab'],
  shouldUpdate: (props, prevProps) => {
    for (var name in props) {
      if (props[name] !== prevProps[name]) {
        return true;
      }
    }
    return false;
  },
  props(store) {
    return {
      selected: store.selectedTab,
      setSelectedTab: name => store.setSelectedTab(name),
    };
  },
}, TabbedPane);
