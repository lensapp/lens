/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { boundMethod } from "../../../utils";
import { InfoPanel } from "../info-panel";
import { LogResourceSelector } from "./resource-selector";
import { LogList } from "./list";
import { LogSearch } from "./search";
import { LogControls } from "./controls";
import { withInjectables } from "@ogre-tools/injectable-react";
import logsViewModelInjectable from "./logs-view-model.injectable";
import type { LogTabViewModel } from "./logs-view-model";
import type { DockTab } from "../dock-store/dock.store";

export interface LogsDockTabProps {
  className?: string;
  tab: DockTab;
}

interface Dependencies {
  model: LogTabViewModel;
}

@observer
class NonInjectedLogsDockTab extends React.Component<LogsDockTabProps & Dependencies> {
  private logListElement = React.createRef<LogList>(); // A reference for VirtualList component

  componentDidMount(): void {
    this.props.model.reloadLogs();
  }

  componentWillUnmount(): void {
    this.props.model.stopLoadingLogs();
  }

  /**
   * Scrolling to active overlay (search word highlight)
   */
  @boundMethod
  scrollToOverlay() {
    const { activeOverlayLine } = this.props.model.searchStore;

    if (!this.logListElement.current || activeOverlayLine === undefined) return;
    // Scroll vertically
    this.logListElement.current.scrollToItem(activeOverlayLine, "center");
    // Scroll horizontally in timeout since virtual list need some time to prepare its contents
    setTimeout(() => {
      const overlay = document.querySelector(".PodLogs .list span.active");

      if (!overlay) return;
      overlay.scrollIntoViewIfNeeded();
    }, 100);
  }

  render() {
    const { model, tab } = this.props;
    const { logTabData } = model;
    const data = logTabData.get();

    if (!data) {
      return null;
    }

    return (
      <div className="PodLogs flex column">
        <InfoPanel
          tabId={tab.id}
          controls={(
            <div className="flex gaps">
              <LogResourceSelector model={model} />
              <LogSearch
                onSearch={this.scrollToOverlay}
                model={model}
                toPrevOverlay={this.scrollToOverlay}
                toNextOverlay={this.scrollToOverlay}
              />
            </div>
          )}
          showSubmitClose={false}
          showButtons={false}
          showStatusPanel={false}
        />
        <LogList model={model} ref={this.logListElement} />
        <LogControls model={model} />
      </div>
    );
  }
}

export const LogsDockTab = withInjectables<Dependencies, LogsDockTabProps>(NonInjectedLogsDockTab, {
  getProps: (di, props) => ({
    model: di.inject(logsViewModelInjectable, {
      tabId: props.tab.id,
    }),
    ...props,
  }),
});
