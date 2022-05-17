/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./dock-tab.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { autoBind, cssNames, prevDefault, isMiddleClick } from "../../utils";
import type { DockStore, DockTab as DockTabModel } from "./dock/store";
import type { TabProps } from "../tabs";
import { Tab } from "../tabs";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import { observable } from "mobx";
import { isMac } from "../../../common/vars";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "./dock/store.injectable";
import { Tooltip, TooltipPosition } from "../tooltip";

export interface DockTabProps extends TabProps<DockTabModel> {
  moreActions?: React.ReactNode;
}

interface Dependencies {
  dockStore: DockStore;
}

@observer
class NonInjectedDockTab extends React.Component<DockTabProps & Dependencies> {
  private readonly menuVisible = observable.box(false);

  constructor(props: DockTabProps & Dependencies) {
    super(props);
    autoBind(this);
  }

  close(id: string) {
    this.props.dockStore.closeTab(id);
  }

  renderMenu(tabId: string) {
    const { closeTab, closeAllTabs, closeOtherTabs, closeTabsToTheRight, tabs, getTabIndex } = this.props.dockStore;
    const closeAllDisabled = tabs.length === 1;
    const closeOtherDisabled = tabs.length === 1;
    const closeRightDisabled = getTabIndex(tabId) === tabs.length - 1;

    return (
      <Menu
        usePortal
        htmlFor={`tab-${tabId}`}
        className="DockTabMenu"
        isOpen={this.menuVisible.get()}
        open={() => this.menuVisible.set(true)}
        close={() => this.menuVisible.set(false)}
        toggleEvent="contextmenu"
      >
        <MenuItem onClick={() => closeTab(tabId)}>
          Close
        </MenuItem>
        <MenuItem onClick={() => closeAllTabs()} disabled={closeAllDisabled}>
          Close all tabs
        </MenuItem>
        <MenuItem onClick={() => closeOtherTabs(tabId)} disabled={closeOtherDisabled}>
          Close other tabs
        </MenuItem>
        <MenuItem onClick={() => closeTabsToTheRight(tabId)} disabled={closeRightDisabled}>
          Close tabs to the right
        </MenuItem>
      </Menu>
    );
  }

  render() {
    const { className, moreActions, dockStore, active, ...tabProps } = this.props;

    if (!tabProps.value) {
      return;
    }

    const { title, pinned, id } = tabProps.value;
    const close = prevDefault(() => this.close(id));

    return (
      <>
        <Tab
          {...tabProps}
          id={`tab-${id}`}
          className={cssNames(styles.DockTab, className, {
            [styles.pinned]: pinned,
          })}
          onContextMenu={() => this.menuVisible.set(true)}
          label={(
            <div className="flex align-center" onAuxClick={isMiddleClick(close)}>
              <span className={styles.title}>{title}</span>
              {moreActions}
              {!pinned && (
                <div className={styles.close}>
                  <Icon
                    small
                    material="close"
                    tooltip={`Close ${isMac ? "⌘+W" : "Ctrl+W"}`}
                    onClick={close}
                  />
                </div>
              )}
              <Tooltip
                targetId={`tab-${id}`}
                preferredPositions={[TooltipPosition.TOP, TooltipPosition.TOP_LEFT]}
                style={{ transitionDelay: "700ms" }}
              >
                {title}
              </Tooltip>
            </div>
          )}
        />
        {this.renderMenu(id)}
      </>
    );
  }
}

export const DockTab = withInjectables<Dependencies, DockTabProps>(NonInjectedDockTab, {
  getProps: (di, props) => ({
    dockStore: di.inject(dockStoreInjectable),
    ...props,
  }),
});
