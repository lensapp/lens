/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./dock-tab.scss";

import React from "react";
import { observer } from "mobx-react";
import { boundMethod, cssNames, prevDefault, isMiddleClick } from "../../utils";
import { dockStore, DockTab as DockTabModel } from "./dock.store";
import { Tab, TabProps } from "../tabs";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import { observable, makeObservable } from "mobx";

export interface DockTabProps extends TabProps<DockTabModel> {
  moreActions?: React.ReactNode;
}

@observer
export class DockTab extends React.Component<DockTabProps> {
  @observable menuVisible = false;

  constructor(props: DockTabProps) {
    super(props);
    makeObservable(this);
  }

  get tabId() {
    return this.props.value.id;
  }

  @boundMethod
  close() {
    dockStore.closeTab(this.tabId);
  }

  renderMenu() {
    const { closeTab, closeAllTabs, closeOtherTabs, closeTabsToTheRight, tabs, getTabIndex } = dockStore;
    const closeAllDisabled = tabs.length === 1;
    const closeOtherDisabled = tabs.length === 1;
    const closeRightDisabled = getTabIndex(this.tabId) === tabs.length - 1;

    return (
      <Menu
        usePortal
        htmlFor={`tab-${this.tabId}`}
        className="DockTabMenu"
        isOpen={this.menuVisible}
        open={() => this.menuVisible = true}
        close={() => this.menuVisible = false}
        toggleEvent="contextmenu"
      >
        <MenuItem onClick={() => closeTab(this.tabId)}>
          Close
        </MenuItem>
        <MenuItem onClick={() => closeAllTabs()} disabled={closeAllDisabled}>
          Close all tabs
        </MenuItem>
        <MenuItem onClick={() => closeOtherTabs(this.tabId)} disabled={closeOtherDisabled}>
          Close other tabs
        </MenuItem>
        <MenuItem onClick={() => closeTabsToTheRight(this.tabId)} disabled={closeRightDisabled}>
          Close tabs to the right
        </MenuItem>
      </Menu>
    );
  }

  render() {
    const { className, moreActions, ...tabProps } = this.props;
    const { title, pinned } = tabProps.value;
    const label = (
      <div className="flex gaps align-center" onAuxClick={isMiddleClick(prevDefault(this.close))}>
        <span className="title" title={title}>{title}</span>
        {moreActions}
        {!pinned && (
          <Icon
            small material="close"
            tooltip="Close (Ctrl+Shift+W)"
            onClick={prevDefault(this.close)}
          />
        )}
      </div>
    );

    return (
      <>
        <Tab
          {...tabProps}
          id={`tab-${this.tabId}`}
          className={cssNames("DockTab", className, { pinned })}
          onContextMenu={() => this.menuVisible = true}
          label={label}
        />
        {this.renderMenu()}
      </>
    );
  }
}
