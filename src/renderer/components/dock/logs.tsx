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

import { boundMethod } from "../../utils";
import type { DockTab } from "./dock-store/dock.store";
import { InfoPanel } from "./info-panel";
import { LogResourceSelector } from "./log-resource-selector";
import { LogList } from "./log-list";
import type { LogStore } from "./log-store/log.store";
import { LogSearch } from "./log-search";
import { LogControls } from "./log-controls";
import type { LogTabData, LogTabStore } from "./log-tab-store/log-tab.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import logTabStoreInjectable from "./log-tab-store/log-tab-store.injectable";
import logStoreInjectable from "./log-store/log-store.injectable";
import type { SearchStore } from "../../search-store/search-store";
import searchStoreInjectable from "../../search-store/search-store.injectable";

interface Props {
  className?: string
  tab: DockTab
}

interface Dependencies {
  logTabStore: LogTabStore
  logStore: LogStore
  searchStore: SearchStore
}

@observer
class NonInjectedLogs extends React.Component<Props & Dependencies> {
  @observable isLoading = true;

  private logListElement = React.createRef<typeof LogList>(); // A reference for VirtualList component

  constructor(props: Props & Dependencies) {
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
    await this.props.logStore.load(this.tabId);
    this.isLoading = false;
  };

  reload = async () => {
    this.props.logStore.clearLogs(this.tabId);
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
    const { activeOverlayLine } = this.props.searchStore;

    if (!this.logListElement.current || activeOverlayLine === undefined) return;
    // Scroll vertically
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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

    const logs = this.props.logStore.logs;
    const searchLogs = data.showTimestamps ? logs : this.props.logStore.logsWithoutTimestamps;
    const controls = (
      <div className="flex gaps">
        <LogResourceSelector
          tabId={this.tabId}
          tabData={data}
          save={newData => this.props.logTabStore.setData(this.tabId, { ...data, ...newData })}
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
    const logs = this.props.logStore.logs;
    const data = this.props.logTabStore.getData(this.tabId);

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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ref={this.logListElement}
        />
        <LogControls
          logs={logs}
          tabData={data}
          save={newData => this.props.logTabStore.setData(this.tabId, { ...data, ...newData })}
          reload={this.reload}
        />
      </div>
    );
  }
}

export const Logs = withInjectables<Dependencies, Props>(
  NonInjectedLogs,

  {
    getProps: (di, props) => ({
      logTabStore: di.inject(logTabStoreInjectable),
      logStore: di.inject(logStoreInjectable),
      searchStore: di.inject(searchStoreInjectable),
      ...props,
    }),
  },
);
