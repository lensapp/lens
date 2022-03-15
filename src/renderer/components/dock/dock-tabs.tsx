/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./dock-tabs.module.scss";

import React, { Fragment, useEffect, useRef, useState } from "react";
import { Tabs } from "../tabs/tabs";
import { DockTab } from "./dock-tab";
import type { DockTab as DockTabModel } from "./dock/store";
import { TabKind } from "./dock/store";
import { TerminalTab } from "./terminal/dock-tab";
import { useResizeObserver } from "../../hooks";
import { cssNames, cssVar } from "../../utils";

export interface DockTabsProps {
  tabs: DockTabModel[];
  autoFocus: boolean;
  selectedTab: DockTabModel;
  onChangeTab: (tab: DockTabModel) => void;
}

export const DockTabs = ({ tabs, autoFocus, selectedTab, onChangeTab }: DockTabsProps) => {
  const elem = useRef<HTMLDivElement>();
  const minTabSize = useRef<number>(0);
  const [showScrollbar, setShowScrollbar] = useState<boolean>(false);

  const renderTab = (tab?: DockTabModel) => {
    if (!tab) {
      return null;
    }

    switch (tab.kind) {
      case TabKind.CREATE_RESOURCE:
      case TabKind.EDIT_RESOURCE:
        return <DockTab value={tab} icon="edit" />;
      case TabKind.INSTALL_CHART:
      case TabKind.UPGRADE_CHART:
        return <DockTab value={tab} icon="install_desktop" />;
      case TabKind.POD_LOGS:
        return <DockTab value={tab} icon="subject" />;
      case TabKind.TERMINAL:
        return <TerminalTab value={tab} />;
    }
  };

  const updateScrollbarVisibility = () => {
    const allTabs: HTMLElement[] = Array.from(elem.current?.querySelectorAll(".Tabs .Tab"));
    const allTabsShrinked = allTabs.every(tab => tab.offsetWidth == minTabSize.current);

    setShowScrollbar(allTabsShrinked);
  };

  useEffect(() => {
    const cssVars = cssVar(elem.current);

    minTabSize.current = cssVars.get("--min-tab-width").valueOf();
  });

  useEffect(() => {
    updateScrollbarVisibility();
  }, [tabs]);

  useResizeObserver(elem.current, updateScrollbarVisibility);

  return (
    <div className={cssNames(styles.dockTabs, { [styles.scrollable]: showScrollbar })} ref={elem}>
      <Tabs
        autoFocus={autoFocus}
        value={selectedTab}
        onChange={onChangeTab}
        scrollable={false}
      >
        {tabs.map(tab => <Fragment key={tab.id}>{renderTab(tab)}</Fragment>)}
      </Tabs>
    </div>
  );
};
