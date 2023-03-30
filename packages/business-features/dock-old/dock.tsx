import "../dock/src/dock/dock.scss";
import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "@k8slens/utilities";
import { Icon } from "../icon";
import { MenuActions } from "../menu/menu-actions";
import { ResizeDirection, ResizingAnchor } from "../resizing-anchor";
import { DockTabs } from "./dock-tabs";
import type { DockStore, DockTab } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "./store.injectable";
import { ErrorBoundary } from "../error-boundary";

export interface DockProps {
  className?: string;
}

interface Dependencies {
  dockStore: DockStore;
}

enum Direction {
  NEXT = 1,
  PREV = -1,
}

@observer
class NonInjectedDock extends React.Component<DockProps & Dependencies> {
  private readonly element = React.createRef<HTMLDivElement>();

  onChangeTab = (tab: DockTab) => {
    const { open, selectTab } = this.props.dockStore;

    open();
    selectTab(tab.id);
    this.element.current?.focus();
  };

  switchToNextTab = (selectedTab: DockTab, direction: Direction) => {
    const { tabs } = this.props.dockStore;
    const currentIndex = tabs.indexOf(selectedTab);
    const nextIndex = currentIndex + direction;

    // check if moving to the next or previous tab is possible.
    if (nextIndex >= tabs.length || nextIndex < 0) {
      return;
    }

    const nextElement = tabs[nextIndex];

    this.onChangeTab(nextElement);
  };

  renderTab(tab: DockTab) {
    switch (tab.kind) {
    }
  }

  renderTabContent() {
    const { isOpen, height, selectedTab } = this.props.dockStore;

    if (!isOpen || !selectedTab) {
      return null;
    }

    return (
      <div
        className={`tab-content ${selectedTab.kind}`}
        style={{ flexBasis: height }}
        data-testid={`dock-tab-content-for-${selectedTab.id}`}
      >
        {this.renderTab(selectedTab)}
      </div>
    );
  }

  render() {
    const { className, dockStore } = this.props;
    const { isOpen, toggle, tabs, toggleFillSize, selectedTab, hasTabs, fullSize } =
      this.props.dockStore;

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
          onDrag={(extent) => (dockStore.height = extent)}
        />
        <div className="tabs-container flex align-center">
          <DockTabs
            tabs={tabs}
            selectedTab={selectedTab}
            autoFocus={isOpen}
            onChangeTab={this.onChangeTab}
          />
          <div
            className={cssNames("toolbar flex gaps align-center box grow", {
              "pl-0": tabs.length == 0,
            })}
          >
            <div className="dock-menu box grow">
              <MenuActions
                id="menu-actions-for-dock"
                usePortal
                triggerIcon={{ material: "add", className: "new-dock-tab", tooltip: "New tab" }}
                closeOnScroll={false}
              ></MenuActions>
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
        <ErrorBoundary>{this.renderTabContent()}</ErrorBoundary>
      </div>
    );
  }
}

export const Dock = withInjectables<Dependencies, DockProps>(
  NonInjectedDock,

  {
    getProps: (di, props) => ({
      dockStore: di.inject(dockStoreInjectable),
      ...props,
    }),
  },
);
