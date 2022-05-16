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
import { cssVar } from "../../utils";

export interface DockTabsProps {
  tabs: DockTabModel[];
  autoFocus: boolean;
  selectedTab: DockTabModel | undefined;
  onChangeTab: (tab: DockTabModel) => void;
}

export const DockTabs = ({ tabs, autoFocus, selectedTab, onChangeTab }: DockTabsProps) => {
  const elem = useRef<HTMLDivElement | null>(null);
  const minTabSize = useRef<number>(0);
  const [showScrollbar, setShowScrollbar] = useState(false);

  const getTabElements = (): HTMLDivElement[] => {
    return Array.from(elem.current?.querySelectorAll(".Tabs .Tab") ?? []);
  };

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

  const scrollActiveTabIntoView = () => {
    const tab = elem.current?.querySelector(".Tab.active");

    tab?.scrollIntoView();
  };

  const updateScrollbarVisibility = () => {
    const allTabsShrunk = getTabElements().every(tab => tab.offsetWidth == minTabSize.current);

    setShowScrollbar(allTabsShrunk);
  };

  const scrollTabsWithMouseWheel = (left: number) => {
    elem.current?.children[0]?.scrollBy({ left });
  };

  const onMouseWheel = (event: React.WheelEvent) => {
    scrollTabsWithMouseWheel(event.deltaY);
  };

  useEffect(() => {
    if (elem.current) {
      const cssVars = cssVar(elem.current);

      minTabSize.current = cssVars.get("--min-tab-width").valueOf();
    }
  });

  useResizeObserver(elem.current, () => {
    scrollActiveTabIntoView();
    updateScrollbarVisibility();
  });

  return (
    <div
      className={styles.dockTabs}
      ref={elem}
      role="tablist"
    >
      <Tabs
        autoFocus={autoFocus}
        value={selectedTab}
        onChange={onChangeTab}
        onWheel={onMouseWheel}
        scrollable={showScrollbar}
        className={styles.tabs}
      >
        {tabs.map(tab => <Fragment key={tab.id}>{renderTab(tab)}</Fragment>)}
      </Tabs>
    </div>
  );
};
