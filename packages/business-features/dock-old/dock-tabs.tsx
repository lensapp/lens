import React, { Fragment, useEffect, useRef, useState } from "react";
import { Tabs } from "../tabs/tabs";
import type { DockTab as DockTabModel } from "./store";
import { cssVar } from "@k8slens/utilities";
import { useResizeObserver } from "../../hooks";

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
    }
  };

  const scrollActiveTabIntoView = () => {
    const tab = elem.current?.querySelector(".Tab.active");

    tab?.scrollIntoView();
  };

  const updateScrollbarVisibility = () => {
    const allTabsShrunk = getTabElements().every((tab) => tab.offsetWidth == minTabSize.current);

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
    <div className={styles.dockTabs} ref={elem} role="tablist">
      <Tabs
        autoFocus={autoFocus}
        value={selectedTab}
        onChange={onChangeTab}
        onWheel={onMouseWheel}
        scrollable={showScrollbar}
        className={styles.tabs}
      >
        {tabs.map((tab) => (
          <Fragment key={tab.id}>{renderTab(tab)}</Fragment>
        ))}
      </Tabs>
    </div>
  );
};
