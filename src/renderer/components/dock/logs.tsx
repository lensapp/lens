/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { boundMethod } from "../../utils";
import { InfoPanel } from "./info-panel";
import { LogResourceSelector } from "./log-resource-selector";
import { LogList, NonInjectedLogList } from "./log-list";
import { LogSearch } from "./log-search";
import { LogControls } from "./log-controls";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SearchStore } from "../../search-store/search-store";
import searchStoreInjectable from "../../search-store/search-store.injectable";
import { Spinner } from "../spinner";
import logsViewModelInjectable from "./logs/logs-view-model/logs-view-model.injectable";
import type { LogsViewModel } from "./logs/logs-view-model/logs-view-model";

interface Props {
  className?: string;
}

interface Dependencies {
  searchStore: SearchStore
  model: LogsViewModel
}

@observer
class NonInjectedLogs extends React.Component<Props & Dependencies> {
  private logListElement = React.createRef<NonInjectedLogList>(); // A reference for VirtualList component

  get model() {
    return this.props.model;
  }

  /**
   * Scrolling to active overlay (search word highlight)
   */
  @boundMethod
  scrollToOverlay() {
    const { activeOverlayLine } = this.props.searchStore;

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

  renderResourceSelector() {
    const { tabs, logs, logsWithoutTimestamps, saveTab, tabId } = this.model;

    if (!tabs) {
      return null;
    }

    const searchLogs = tabs.showTimestamps ? logs : logsWithoutTimestamps;

    const controls = (
      <div className="flex gaps">
        <LogResourceSelector
          tabId={tabId}
          tabData={tabs}
          save={saveTab}
        />

        <LogSearch
          onSearch={this.scrollToOverlay}
          logs={searchLogs}
          toPrevOverlay={this.scrollToOverlay}
          toNextOverlay={this.scrollToOverlay}
        />
      </div>
    );

    return (
      <InfoPanel
        tabId={this.model.tabId}
        controls={controls}
        showSubmitClose={false}
        showButtons={false}
        showStatusPanel={false}
      />
    );
  }

  render() {
    const { logs, tabs, tabId, saveTab } = this.model;

    return (
      <div className="PodLogs flex column">
        {this.renderResourceSelector()}

        <LogList
          logs={logs}
          id={tabId}
          ref={this.logListElement}
        />

        <LogControls
          logs={logs}
          tabData={tabs}
          save={saveTab}
        />
      </div>
    );
  }
}



export const Logs = withInjectables<Dependencies, Props>(
  NonInjectedLogs,

  {

    getPlaceholder: () => (
      <div className="flex box grow align-center justify-center">
        <Spinner center />
      </div>
    ),

    getProps: async (di, props) => ({
      searchStore: di.inject(searchStoreInjectable),
      model: await di.inject(logsViewModelInjectable),
      ...props,
    }),
  },
);
