/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { Fragment, useRef, useEffect, useState, UIEvent } from "react";
import { Icon } from "../icon";
import { Tabs } from "../tabs/tabs";
import { DockTab } from "./dock-tab";
import type { DockTab as DockTabModel } from "./dock-store/dock.store";
import { TabKind, DockStore } from "./dock-store/dock.store";
import { TerminalTab } from "./terminal-tab";

interface Props {
  tabs: DockTabModel[]
  dockStore: DockStore;
  autoFocus: boolean
  selectedTab: DockTabModel
  onChangeTab: (tab: DockTabModel) => void
}

export const DockTabs = ({ tabs, autoFocus, selectedTab, onChangeTab, dockStore }: Props) => {
  const elem = useRef(null);
  const contentElem = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollStep = 200;

  const scrollToRight = (): void => {
    if(!elem || scrollPosition === contentWidth) return;
    const scroll = scrollPosition + scrollStep;

    setScrollPosition(scroll);

    elem.current.scrollLeft = scroll;
  };

  const updateStateValues = () => {
    if(!elem || !contentElem) return;

    setContentWidth(contentElem.current.clientWidth);
    setContainerWidth(elem.current.clientWidth);
    setScrollPosition(elem.current.scrollLeft);
  };

  const scrollToLeft = (): void => {
    if(!elem) return;
    const scroll = scrollPosition - scrollStep;

    setScrollPosition(scroll);

    elem.current.scrollLeft = scroll;
  };

  const  isScrollableRight = (): boolean => {
    if(!elem || !contentElem) return false;

    // check if element with tabs is wider than the parent element
    // check if scroll at the end of scrollable area.
    return contentElem.current?.clientWidth  > containerWidth && scrollPosition  < contentElem.current?.clientWidth - elem.current?.clientWidth;
  };

  const  isScrollableLeft = (): boolean => {
    if(!elem || !contentElem) return false;

    return scrollPosition > 0;
  };

  const updateScrollPosition = ( evt: UIEvent<HTMLDivElement>): void => {
    const position = evt.currentTarget.scrollLeft;

    if (position!== undefined) {
      setScrollPosition(position);
    }
  };

  const onWindowResize = (): void => {
    updateStateValues();
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
        return <DockTab value={tab} icon={<Icon svg="install" />} />;
      case TabKind.POD_LOGS:
        return <DockTab value={tab} icon="subject" />;
      case TabKind.TERMINAL:
        return <TerminalTab value={tab} />;
    }
  };


  useEffect(() => {
    updateStateValues();

    // update values in store on scroll
    elem.current.addEventListener("scroll", updateScrollPosition);

    // update current values on resize to show/hide scroll
    window.addEventListener("resize", onWindowResize);

    // update scroll state if tabs numbers has changed
    dockStore.onTabsNumberChange(() => {
      updateStateValues();
    });
  }, []);

  return (
    <div className={"tabs-wrapper flex gaps align-center"}>
      {isScrollableLeft() && (
        <Icon
          material="keyboard_arrow_left"
          tooltip="Show tabs to the left"
          onClick={scrollToLeft}
          className={"tab-control scroll-left"}
        />
      )}
      <div ref={elem} className={"tabs-control flex gaps align-center"}>
        <div ref={contentElem} className={"scrollable"}>
          <Tabs
            className="DockTabs"
            autoFocus={autoFocus}
            value={selectedTab}
            onChange={onChangeTab}
          >
            {tabs.map(tab => <Fragment key={tab.id}>{renderTab(tab)}</Fragment>)}
          </Tabs>
        </div>
      </div>
      {isScrollableRight() && (
        <Icon
          material="keyboard_arrow_right"
          tooltip="Show tabs to the right"
          onClick={scrollToRight}
          className={"tab-control scroll-right"}
        />
      )}
    </div>
  );
};
