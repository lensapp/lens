/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { Fragment } from "react";

import { Icon } from "../icon";
import { Tabs } from "../tabs/tabs";
import { DockTab } from "./dock-tab";
import type { DockTab as DockTabModel } from "./dock/store";
import { TabKind } from "./dock/store";
import { TerminalTab } from "./terminal/dock-tab";

interface Props {
  tabs: DockTabModel[];
  autoFocus: boolean;
  selectedTab: DockTabModel;
  onChangeTab: (tab: DockTabModel) => void;
}

export const DockTabs = ({ tabs, autoFocus, selectedTab, onChangeTab }: Props) => {
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

  return (
    <Tabs
      className="DockTabs"
      autoFocus={autoFocus}
      value={selectedTab}
      onChange={onChangeTab}
    >
      {tabs.map(tab => <Fragment key={tab.id}>{renderTab(tab)}</Fragment>)}
    </Tabs>
  );
};
