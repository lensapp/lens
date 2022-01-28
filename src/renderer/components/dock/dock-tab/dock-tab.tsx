/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dock-tab.scss";

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { isMac } from "../../../../common/vars";
import { cssNames, isMiddleClick, prevDefault } from "../../../utils";
import { Icon } from "../../icon";
import { Menu, MenuItem } from "../../menu";
import { Tab, TabProps } from "../../tabs";
import type { DockTabData, TabId } from "../dock/store";
import closeDockTabInjectable from "../dock/close-tab.injectable";
import closeAllDockTabsInjectable from "../dock/close-all-tabs.injectable";
import closeOtherDockTabsInjectable from "../dock/close-other-tabs.injectable";
import closeDockTabsToTheRightInjectable from "../dock/close-tabs-right.injectable";

export interface DockTabProps extends TabProps<DockTabData> {
  moreActions?: React.ReactNode;
  isLastTab: boolean;
  isOnlyTab: boolean;
}

interface Dependencies {
  closeDockTab: (tabId: TabId) => void;
  closeAllDockTabs: () => void;
  closeOtherDockTabs: (tabId: TabId) => void;
  closeDockTabsToTheRight: (tabId: TabId) => void;
}

const NonInjectedDockTab = observer(({ closeAllDockTabs: closeAllTabs, closeOtherDockTabs: closeOtherTabs, closeDockTab: closeTab, closeDockTabsToTheRight: closeTabsToTheRight, isOnlyTab, isLastTab, value: tab, className, moreActions, ...tabProps }: Dependencies & DockTabProps) => {
  const [menuIsVisible, setMenuIsVisible] = useState(false);

  const close = () => closeTab(tab.id);
  const { title, pinned } = tab;

  return (
    <>
      <Tab
        {...tabProps}
        value={tab}
        id={`tab-${tab.id}`}
        className={cssNames("DockTab", className, { pinned })}
        onContextMenu={() => setMenuIsVisible(true)}
        label={
          <div className="flex gaps align-center" onAuxClick={isMiddleClick(prevDefault(close))}>
            <span className="title" title={title}>{title}</span>
            {moreActions}
            {!pinned && (
              <Icon
                small material="close"
                tooltip={`Close ${isMac ? "⌘+W" : "Ctrl+W"}`}
                onClick={prevDefault(close)}
              />
            )}
          </div>
        }
      />
      <Menu
        usePortal
        htmlFor={`tab-${tab.id}`}
        className="DockTabMenu"
        isOpen={menuIsVisible}
        open={() => setMenuIsVisible(true)}
        close={() => setMenuIsVisible(false)}
        toggleEvent="contextmenu"
      >
        <MenuItem onClick={close}>
            Close
        </MenuItem>
        <MenuItem onClick={() => closeAllTabs()}>
            Close all tabs
        </MenuItem>
        <MenuItem onClick={() => closeOtherTabs(tab.id)} disabled={isOnlyTab}>
            Close other tabs
        </MenuItem>
        <MenuItem onClick={() => closeTabsToTheRight(tab.id)} disabled={isLastTab}>
            Close tabs to the right
        </MenuItem>
      </Menu>
    </>
  );
});

export const DockTab = withInjectables<Dependencies, DockTabProps>(NonInjectedDockTab, {
  getProps: (di, props) => ({
    closeDockTab: di.inject(closeDockTabInjectable),
    closeAllDockTabs: di.inject(closeAllDockTabsInjectable),
    closeOtherDockTabs: di.inject(closeOtherDockTabsInjectable),
    closeDockTabsToTheRight: di.inject(closeDockTabsToTheRightInjectable),
    ...props,
  }),
});
