/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dock-tab.scss";

import React from "react";
import { observer } from "mobx-react";
import { boundMethod, cssNames, prevDefault, isMiddleClick } from "../../utils";
import type { DockStore, DockTab as DockTabModel } from "./dock/store";
import { Tab, TabProps } from "../tabs";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import { observable, makeObservable } from "mobx";
import { isMac } from "../../../common/vars";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "./dock/store.injectable";

export interface DockTabProps extends TabProps<DockTabModel> {
  moreActions?: React.ReactNode;
}

interface Dependencies {
  dockStore: DockStore;
}

@observer
class NonInjectedDockTab extends React.Component<DockTabProps & Dependencies> {
  @observable menuVisible = false;

  constructor(props: DockTabProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get tabId() {
    return this.props.value.id;
  }

  @boundMethod
  close() {
    this.props.dockStore.closeTab(this.tabId);
  }

  renderMenu() {
    const { closeTab, closeAllTabs, closeOtherTabs, closeTabsToTheRight, tabs, getTabIndex } = this.props.dockStore;
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
    const { className, moreActions, dockStore, ...tabProps } = this.props;
    const { title, pinned } = tabProps.value;
    const label = (
      <div className="flex gaps align-center" onAuxClick={isMiddleClick(prevDefault(this.close))}>
        <span className="title" title={title}>{title}</span>
        {moreActions}
        {!pinned && (
          <Icon
            small material="close"
            tooltip={`Close ${isMac ? "⌘+W" : "Ctrl+W"}`}
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

export const DockTab = withInjectables<Dependencies, DockTabProps>(
  NonInjectedDockTab,

  {
    getProps: (di, props) => ({
      dockStore: di.inject(dockStoreInjectable),
      ...props,
    }),
  },
);
