import "./dock.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { autobind, cssNames, prevDefault } from "../../utils";
import { ResizingAnchor, ResizeDirection } from "../resizing-anchor";
import { Icon } from "../icon";
import { Tabs } from "../tabs/tabs";
import { MenuItem } from "../menu";
import { MenuActions } from "../menu/menu-actions";
import { dockStore, IDockTab } from "./dock.store";
import { DockTab } from "./dock-tab";
import { TerminalTab } from "./terminal-tab";
import { TerminalWindow } from "./terminal-window";
import { CreateResource } from "./create-resource";
import { InstallChart } from "./install-chart";
import { EditResource } from "./edit-resource";
import { UpgradeChart } from "./upgrade-chart";
import { createTerminalTab, isTerminalTab } from "./terminal.store";
import { createResourceTab, isCreateResourceTab } from "./create-resource.store";
import { isEditResourceTab } from "./edit-resource.store";
import { isInstallChartTab } from "./install-chart.store";
import { isUpgradeChartTab } from "./upgrade-chart.store";
import { PodLogs } from "./pod-logs";
import { isPodLogsTab } from "./pod-logs.store";

interface Props {
  className?: string;
}

@observer
export class Dock extends React.Component<Props> {
  onKeydown = (evt: React.KeyboardEvent<HTMLElement>) => {
    const { close, closeTab, selectedTab } = dockStore;
    if (!selectedTab) return;
    const { code, ctrlKey, shiftKey } = evt.nativeEvent;
    if (shiftKey && code === "Escape") {
      close();
    }
    if (ctrlKey && code === "KeyW") {
      if (selectedTab.pinned) close();
      else closeTab(selectedTab.id);
    }
  }

  onChangeTab = (tab: IDockTab) => {
    const { open, selectTab } = dockStore;
    open();
    selectTab(tab.id);
  }

  @autobind()
  renderTab(tab: IDockTab) {
    if (isTerminalTab(tab)) {
      return <TerminalTab value={tab} />
    }
    if (isCreateResourceTab(tab) || isEditResourceTab(tab)) {
      return <DockTab value={tab} icon="edit" />
    }
    if (isInstallChartTab(tab) || isUpgradeChartTab(tab)) {
      return <DockTab value={tab} icon={<Icon svg="install" />} />
    }
    if (isPodLogsTab(tab)) {
      return <DockTab value={tab} icon="subject" />
    }
  }

  renderTabContent() {
    const { isOpen, height, selectedTab: tab } = dockStore;
    if (!isOpen || !tab) return;
    return (
      <div className="tab-content" style={{ flexBasis: height }}>
        {isCreateResourceTab(tab) && <CreateResource tab={tab} />}
        {isEditResourceTab(tab) && <EditResource tab={tab} />}
        {isInstallChartTab(tab) && <InstallChart tab={tab} />}
        {isUpgradeChartTab(tab) && <UpgradeChart tab={tab} />}
        {isTerminalTab(tab) && <TerminalWindow tab={tab} />}
        {isPodLogsTab(tab) && <PodLogs tab={tab} />}
      </div>
    )
  }

  render() {
    const { className } = this.props;
    const { isOpen, toggle, tabs, toggleFillSize, selectedTab, hasTabs, fullSize } = dockStore;
    return (
      <div
        className={cssNames("Dock", className, { isOpen, fullSize })}
        onKeyDown={this.onKeydown}
        tabIndex={-1}
      >
        <ResizingAnchor
          disabled={!hasTabs()}
          getCurrentExtent={() => dockStore.height}
          minExtent={dockStore.minHeight}
          maxExtent={dockStore.maxHeight}
          direction={ResizeDirection.VERTICAL}
          onStart={dockStore.open}
          onMinExtentSubceed={dockStore.close}
          onMinExtentExceed={dockStore.open}
          onDrag={dockStore.setHeight}
        />
        <div className="tabs-container flex align-center" onDoubleClick={prevDefault(toggle)}>
          <Tabs
            autoFocus={isOpen}
            className="dock-tabs"
            value={selectedTab} onChange={this.onChangeTab}
            children={tabs.map(tab => <Fragment key={tab.id}>{this.renderTab(tab)}</Fragment>)}
          />
          <div className="toolbar flex gaps align-center box grow">
            <div className="dock-menu box grow">
              <MenuActions usePortal triggerIcon={{ material: "add", className: "new-dock-tab", tooltip: <Trans>New tab</Trans> }} closeOnScroll={false}>
                <MenuItem className="create-terminal-tab" onClick={() => createTerminalTab()}>
                  <Icon small svg="terminal" size={15} />
                  <Trans>Terminal session</Trans>
                </MenuItem>
                <MenuItem className="create-resource-tab" onClick={() => createResourceTab()}>
                  <Icon small material="create" />
                  <Trans>Create resource</Trans>
                </MenuItem>
              </MenuActions>
            </div>
            {hasTabs() && (
              <>
                <Icon
                  material={fullSize ? "fullscreen_exit" : "fullscreen"}
                  tooltip={fullSize ? <Trans>Exit full size mode</Trans> : <Trans>Fit to window</Trans>}
                  onClick={toggleFillSize}
                />
                <Icon
                  material={`keyboard_arrow_${isOpen ? "down" : "up"}`}
                  tooltip={isOpen ? <Trans>Minimize</Trans> : <Trans>Open</Trans>}
                  onClick={toggle}
                />
              </>
            )}
          </div>
        </div>
        {this.renderTabContent()}
      </div>
    )
  }
}
