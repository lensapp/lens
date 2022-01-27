/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dock.scss";

import React from "react";
import { observer } from "mobx-react";

import { cssNames, prevDefault } from "../../utils";
import { Icon } from "../icon";
import { MenuItem } from "../menu";
import { MenuActions } from "../menu/menu-actions";
import { ResizeDirection, ResizingAnchor } from "../resizing-anchor";
import { CreateResource } from "./create-resource";
import { DockTabs } from "./dock-tabs";
import { DockStore, DockTab, TabKind } from "./dock-store/dock.store";
import { EditResource } from "./edit-resource";
import { InstallChart } from "./install-chart";
import { LogsDockTab } from "./logs/dock-tab";
import { TerminalWindow } from "./terminal-window";
import { UpgradeChart } from "./upgrade-chart";
import { withInjectables } from "@ogre-tools/injectable-react";
import createResourceTabInjectable from "./create-resource-tab/create-resource-tab.injectable";
import dockStoreInjectable from "./dock-store/dock-store.injectable";
import createTerminalTabInjectable from "./create-terminal-tab/create-terminal-tab.injectable";

interface Props {
  className?: string;
}

interface Dependencies {
  createResourceTab: () => void
  createTerminalTab: () => void
  dockStore: DockStore
}

@observer
class NonInjectedDock extends React.Component<Props & Dependencies> {
  private element = React.createRef<HTMLDivElement>();

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (evt: KeyboardEvent) => {
    const { close, selectedTab, closeTab } = this.props.dockStore;
    const { code, ctrlKey, metaKey, shiftKey } = evt;
    // Determine if user working inside <Dock/> or using any other areas in app
    const dockIsFocused = this.element?.current.contains(document.activeElement);

    if (!selectedTab || !dockIsFocused) return;

    if (shiftKey && code === "Escape") {
      close();
    }

    if ((ctrlKey && code === "KeyW") || (metaKey && code === "KeyW")) {
      closeTab(selectedTab.id);
      this.element?.current.focus();  // Avoid loosing focus when closing tab
    }
  };

  onChangeTab = (tab: DockTab) => {
    const { open, selectTab } = this.props.dockStore;

    open();
    selectTab(tab.id);
    this.element?.current.focus();
  };

  renderTab(tab: DockTab) {
    switch (tab.kind) {
      case TabKind.CREATE_RESOURCE:
        return <CreateResource tab={tab} />;
      case TabKind.EDIT_RESOURCE:
        return <EditResource tab={tab} />;
      case TabKind.INSTALL_CHART:
        return <InstallChart tab={tab} />;
      case TabKind.UPGRADE_CHART:
        return <UpgradeChart tab={tab} />;
      case TabKind.POD_LOGS:
        return <LogsDockTab tab={tab} />;
      case TabKind.TERMINAL:
        return <TerminalWindow tab={tab} />;
    }
  }

  renderTabContent() {
    const { isOpen, height, selectedTab } = this.props.dockStore;

    if (!isOpen || !selectedTab) return null;

    return (
      <div className={`tab-content ${selectedTab.kind}`} style={{ flexBasis: height }}>
        {this.renderTab(selectedTab)}
      </div>
    );
  }

  render() {
    const { className, dockStore } = this.props;
    const { isOpen, toggle, tabs, toggleFillSize, selectedTab, hasTabs, fullSize } = this.props.dockStore;

    return (
      <div
        className={cssNames("Dock", className, { isOpen, fullSize })}
        ref={this.element}
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
          onDrag={extent => dockStore.height = extent}
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
                <MenuItem className="create-terminal-tab" onClick={() => this.props.createTerminalTab()}>
                  <Icon small svg="terminal" size={15} />
                  Terminal session
                </MenuItem>
                <MenuItem className="create-resource-tab" onClick={() => this.props.createResourceTab()}>
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

export const Dock = withInjectables<Dependencies, Props>(
  NonInjectedDock,

  {
    getProps: (di, props) => ({
      createResourceTab: di.inject(createResourceTabInjectable),
      dockStore: di.inject(dockStoreInjectable),
      createTerminalTab: di.inject(createTerminalTabInjectable),
      ...props,
    }),
  },
);

