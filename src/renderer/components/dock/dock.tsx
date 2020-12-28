import "./dock.scss";

import React from "react";
import { observer } from "mobx-react";

import { cssNames, prevDefault } from "../../utils";
import { Icon } from "../icon";
import { MenuItem } from "../menu";
import { MenuActions } from "../menu/menu-actions";
import { ResizeDirection, ResizingAnchor } from "../resizing-anchor";
import { CreateResource } from "./create-resource";
import { createResourceTab, isCreateResourceTab } from "./create-resource.store";
import { DockTabs } from "./dock-tabs";
import { dockStore, IDockTab } from "./dock.store";
import { EditResource } from "./edit-resource";
import { isEditResourceTab } from "./edit-resource.store";
import { InstallChart } from "./install-chart";
import { isInstallChartTab } from "./install-chart.store";
import { PodLogs } from "./pod-logs";
import { isPodLogsTab } from "./pod-logs.store";
import { TerminalWindow } from "./terminal-window";
import { createTerminalTab, isTerminalTab } from "./terminal.store";
import { UpgradeChart } from "./upgrade-chart";
import { isUpgradeChartTab } from "./upgrade-chart.store";

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
  };

  onChangeTab = (tab: IDockTab) => {
    const { open, selectTab } = dockStore;

    open();
    selectTab(tab.id);
  };

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
    );
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
          <DockTabs
            tabs={tabs}
            selectedTab={selectedTab}
            autoFocus={isOpen}
            onChangeTab={this.onChangeTab}
          />
          <div className="toolbar flex gaps align-center box grow">
            <div className="dock-menu box grow">
              <MenuActions usePortal triggerIcon={{ material: "add", className: "new-dock-tab", tooltip: "New tab" }} closeOnScroll={false}>
                <MenuItem className="create-terminal-tab" onClick={() => createTerminalTab()}>
                  <Icon small svg="terminal" size={15} />
                  Terminal session
                </MenuItem>
                <MenuItem className="create-resource-tab" onClick={() => createResourceTab()}>
                  <Icon small material="create" />
                  Create resource
                </MenuItem>
              </MenuActions>
            </div>
            {hasTabs() && (
              <>
                <Icon
                  material={fullSize ? "fullscreen_exit" : "fullscreen"}
                  tooltip={fullSize ? "Exit full size mode" : "Fit to window"}
                  onClick={toggleFillSize}
                />
                <Icon
                  material={`keyboard_arrow_${isOpen ? "down" : "up"}`}
                  tooltip={isOpen ? "Minimize" : "Open"}
                  onClick={toggle}
                />
              </>
            )}
          </div>
        </div>
        {this.renderTabContent()}
      </div>
    );
  }
}
