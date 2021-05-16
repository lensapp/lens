/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
