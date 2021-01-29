import React, { Fragment } from "react";

import { Icon } from "../icon";
import { Tabs } from "../tabs/tabs";
import { isCreateResourceTab } from "./create-resource.store";
import { DockTab } from "./dock-tab";
import { IDockTab } from "./dock.store";
import { isEditResourceTab } from "./edit-resource.store";
import { isInstallChartTab } from "./install-chart.store";
import { isLogsTab } from "./log-tab.store";
import { TerminalTab } from "./terminal-tab";
import { isTerminalTab } from "./terminal.store";
import { isUpgradeChartTab } from "./upgrade-chart.store";

interface Props {
  tabs: IDockTab[]
  autoFocus: boolean
  selectedTab: IDockTab
  onChangeTab: (tab: IDockTab) => void
}

export const DockTabs = ({ tabs, autoFocus, selectedTab, onChangeTab }: Props) => {
  const renderTab = (tab: IDockTab) => {
    if (isTerminalTab(tab)) {
      return <TerminalTab value={tab} />;
    }

    if (isCreateResourceTab(tab) || isEditResourceTab(tab)) {
      return <DockTab value={tab} icon="edit" />;
    }

    if (isInstallChartTab(tab) || isUpgradeChartTab(tab)) {
      return <DockTab value={tab} icon={<Icon svg="install" />} />;
    }

    if (isLogsTab(tab)) {
      return <DockTab value={tab} icon="subject" />;
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
