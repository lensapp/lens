/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Icon } from "../../icon";
import { Tabs } from "../../tabs/tabs";
import { TabKind, DockTabData } from "../dock/store";
import { TerminalTab } from "../terminal/terminal-tab";
import { DockTab } from "./dock-tab";

interface Props {
  tabs: DockTabData[]
  autoFocus: boolean;
  selectedTab: DockTabData | undefined;
  onChangeTab: (tab: DockTabData) => void
}

const getIcon = (kind: string) => {
  switch (kind) {
    case TabKind.INSTALL_CHART:
    case TabKind.UPGRADE_CHART:
      return <Icon svg="install" />;
    case TabKind.CREATE_RESOURCE:
    case TabKind.EDIT_RESOURCE:
      return "edit";
    case TabKind.POD_LOGS:
      return "subject";
    default:
      return "question_mark";
  }
};

export const DockTabs = ({ tabs, autoFocus, selectedTab, onChangeTab }: Props) => {
  interface RenderTabArgs {
    tab: DockTabData;
    isLastTab: boolean;
    isOnlyTab: boolean;
  }

  const renderTab = ({ tab, isLastTab, isOnlyTab }: RenderTabArgs) => (
    tab.kind === TabKind.TERMINAL
      ? (
        <TerminalTab
          key={tab.id}
          value={tab}
          isLastTab={isLastTab}
          isOnlyTab={isOnlyTab}
        />
      )
      : (
        <DockTab
          key={tab.id}
          value={tab}
          icon={getIcon(tab.kind)}
          isLastTab={isLastTab}
          isOnlyTab={isOnlyTab}
        />
      )
  );

  return (
    <Tabs
      className="DockTabs"
      autoFocus={autoFocus}
      value={selectedTab}
      onChange={onChangeTab}
    >
      {tabs.map((tab, index) => renderTab({
        tab,
        isLastTab: index === tabs.length - 1,
        isOnlyTab: tabs.length === 1,
      }))}
    </Tabs>
  );
};
