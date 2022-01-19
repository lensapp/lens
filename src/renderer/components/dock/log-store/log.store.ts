/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autorun, computed, observable, makeObservable } from "mobx";

import { IPodLogsQuery, Pod } from "../../../../common/k8s-api/endpoints";
import { autoBind, interval } from "../../../utils";
import { DockStore, TabId, TabKind } from "../dock-store/dock.store";
import type { LogTabStore } from "../log-tab-store/log-tab.store";

type PodLogLine = string;

const logLinesToLoad = 500;

interface Dependencies {
  logTabStore: LogTabStore
  dockStore: DockStore
  callForLogs: ({ namespace, name }: { namespace: string, name: string }, query: IPodLogsQuery) => Promise<string>
}

export class LogStore {
  private refresher = interval(10, () => {
    const id = this.dependencies.dockStore.selectedTabId;

    if (!this.podLogs.get(id)) return;
    this.loadMore(id);
  });

  @observable podLogs = observable.map<TabId, PodLogLine[]>();

  constructor(private dependencies: Dependencies) {
    makeObservable(this);
    autoBind(this);

    autorun(() => {
      const { selectedTab, isOpen } = this.dependencies.dockStore;

      if (selectedTab?.kind === TabKind.POD_LOGS && isOpen) {
        this.refresher.start();
      } else {
        this.refresher.stop();
      }
    }, { delay: 500 });
  }

  handlerError(tabId: TabId, error: any): void {
    if (error.error && !(error.message || error.reason || error.code)) {
      error = error.error;
    }

    const message = [
      `Failed to load logs: ${error.message}`,
      `Reason: ${error.reason} (${error.code})`,
    ];

    this.refresher.stop();
    this.podLogs.set(tabId, message);
  }

  /**
   * Function prepares tailLines param for passing to API request
   * Each time it increasing it's number, caused to fetch more logs.
   * Also, it handles loading errors, rewriting whole logs with error
   * messages
   */
  load = async () => {
    const tabId = this.dependencies.dockStore.selectedTabId;

    try {
      const logs = await this.loadLogs(tabId, {
        tailLines: this.lines + logLinesToLoad,
      });

      this.refresher.start();
      this.podLogs.set(tabId, logs);
    } catch (error) {
      this.handlerError(tabId, error);
    }
  };

  /**
   * Function is used to refresher/stream-like requests.
   * It changes 'sinceTime' param each time allowing to fetch logs
   * starting from last line received.
   * @param tabId
   */
  loadMore = async (tabId: TabId) => {
    if (!this.podLogs.get(tabId).length) {
      return;
    }

    try {
      const oldLogs = this.podLogs.get(tabId);
      const logs = await this.loadLogs(tabId, {
        sinceTime: this.getLastSinceTime(tabId),
      });

      // Add newly received logs to bottom
      this.podLogs.set(tabId, [...oldLogs, ...logs.filter(Boolean)]);
    } catch (error) {
      this.handlerError(tabId, error);
    }
  };

  /**
   * Main logs loading function adds necessary data to payload and makes
   * an API request
   * @param tabId
   * @param params request parameters described in IPodLogsQuery interface
   * @returns A fetch request promise
   */
  async loadLogs(tabId: TabId, params: Partial<IPodLogsQuery>): Promise<string[]> {
    const data = this.dependencies.logTabStore.getData(tabId);

    const { selectedContainer, previous } = data;
    const pod = new Pod(data.selectedPod);
    const namespace = pod.getNs();
    const name = pod.getName();

    const result = await this.dependencies.callForLogs({ namespace, name }, {
      ...params,
      timestamps: true,  // Always setting timestamp to separate old logs from new ones
      container: selectedContainer.name,
      previous,
    });

    return result.trimEnd().split("\n");
  }

  /**
   * Converts logs into a string array
   * @returns Length of log lines
   */
  @computed
  get lines(): number {
    return this.logs.length;
  }


  /**
   * Returns logs with timestamps for selected tab
   */
  @computed
  get logs() {
    return this.podLogs.get(this.dependencies.dockStore.selectedTabId) ?? [];
  }

  /**
   * Removes timestamps from each log line and returns changed logs
   * @returns Logs without timestamps
   */
  @computed
  get logsWithoutTimestamps() {
    return this.logs.map(item => this.removeTimestamps(item));
  }

  /**
   * It gets timestamps from all logs then returns last one + 1 second
   * (this allows to avoid getting the last stamp in the selection)
   * @param tabId
   */
  getLastSinceTime(tabId: TabId) {
    const logs = this.podLogs.get(tabId);
    const timestamps = this.getTimestamps(logs[logs.length - 1]);
    const stamp = new Date(timestamps ? timestamps[0] : null);

    stamp.setSeconds(stamp.getSeconds() + 1); // avoid duplicates from last second

    return stamp.toISOString();
  }

  splitOutTimestamp(logs: string): [string, string] {
    const extraction = /^(\d+\S+)(.*)/m.exec(logs);

    if (!extraction || extraction.length < 3) {
      return ["", logs];
    }

    return [extraction[1], extraction[2]];
  }

  getTimestamps(logs: string) {
    return logs.match(/^\d+\S+/gm);
  }

  removeTimestamps(logs: string) {
    return logs.replace(/^\d+.*?\s/gm, "");
  }

  clearLogs(tabId: TabId) {
    this.podLogs.delete(tabId);
  }

  reload = async () => {
    this.clearLogs(this.dependencies.dockStore.selectedTabId);

    await this.load();
  };
}
