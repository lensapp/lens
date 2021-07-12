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

import React from "react";
import { observable, reaction, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";

import { searchStore } from "../../../common/search-store";
import { boundMethod } from "../../utils";
import type { DockTab } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { LogResourceSelector } from "./log-resource-selector";
import { LogList } from "./log-list";
import { logStore } from "./log.store";
import { LogSearch } from "./log-search";
import { LogControls } from "./log-controls";
import { LogTabData, logTabStore } from "./log-tab.store";

interface Props {
  className?: string
  tab: DockTab
}

@observer
export class Logs extends React.Component<Props> {
  @observable isLoading = true;

  private logListElement = React.createRef<LogList>(); // A reference for VirtualList component

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this,
      reaction(() => this.props.tab.id, this.reload, { fireImmediately: true }),
    );
  }

  get tabId() {
    return this.props.tab.id;
  }

  load = async () => {
    this.isLoading = true;
    await logStore.load(this.tabId);
    this.isLoading = false;
  };

  reload = async () => {
    logStore.clearLogs(this.tabId);
    await this.load();
  };

  /**
   * A function for various actions after search is happened
   * @param query {string} A text from search field
   */
  @boundMethod
  onSearch() {
    this.toOverlay();
  }

  /**
   * Scrolling to active overlay (search word highlight)
   */
  @boundMethod
  toOverlay() {
    const { activeOverlayLine } = searchStore;

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

  renderResourceSelector(data?: LogTabData) {
    if (!data) {
      return null;
    }

    const logs = logStore.logs;
    const searchLogs = data.showTimestamps ? logs : logStore.logsWithoutTimestamps;
    const controls = (
      <div className="flex gaps">
        <LogResourceSelector
          tabId={this.tabId}
          tabData={data}
          save={newData => logTabStore.setData(this.tabId, { ...data, ...newData })}
          reload={this.reload}
        />
        <LogSearch
          onSearch={this.onSearch}
          logs={searchLogs}
          toPrevOverlay={this.toOverlay}
          toNextOverlay={this.toOverlay}
        />
      </div>
    );

    return (
      <InfoPanel
        tabId={this.props.tab.id}
        controls={controls}
        showSubmitClose={false}
        showButtons={false}
        showStatusPanel={false}
      />
    );
  }

  render() {
    const logs = logStore.logs;
    const data = logTabStore.getData(this.tabId);

    if (!data) {
      this.reload();
    }

    return (
      <div className="PodLogs flex column">
        {this.renderResourceSelector(data)}
        <LogList
          logs={logs}
          id={this.tabId}
          isLoading={this.isLoading}
          load={this.load}
          ref={this.logListElement}
        />
        <LogControls
          logs={logs}
          tabData={data}
          save={newData => logTabStore.setData(this.tabId, { ...data, ...newData })}
          reload={this.reload}
        />
      </div>
    );
  }
}
