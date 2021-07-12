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
import { DockTab } from "./dock-tab";
import type { DockTab as DockTabModel } from "./dock.store";
import { TabKind } from "./dock.store";
import { TerminalTab } from "./terminal-tab";

interface Props {
  tabs: DockTabModel[]
  autoFocus: boolean
  selectedTab: DockTabModel
  onChangeTab: (tab: DockTabModel) => void
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
