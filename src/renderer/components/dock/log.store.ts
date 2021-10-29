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

import { autorun, computed, observable, makeObservable } from "mobx";

import { IPodLogsQuery, Pod, podsApi } from "../../../common/k8s-api/endpoints";
import { autoBind, interval } from "../../utils";
import { dockStore, TabId, TabKind } from "./dock.store";
import { logTabStore } from "./log-tab.store";

type PodLogLine = string;

const logLinesToLoad = 500;

export class LogStore {
  private refresher = interval(10, () => {
    const id = dockStore.selectedTabId;

    if (!this.podLogs.get(id)) return;
    this.loadMore(id);
  });

  @observable podLogs = observable.map<TabId, PodLogLine[]>();

  constructor() {
    makeObservable(this);
    autoBind(this);

    autorun(() => {
      const { selectedTab, isOpen } = dockStore;

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
   * @param tabId
   */
  load = async (tabId: TabId) => {
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
    const data = logTabStore.getData(tabId);
    const { selectedContainer, previous } = data;
    const pod = new Pod(data.selectedPod);
    const namespace = pod.getNs();
    const name = pod.getName();

    const result = await podsApi.getLogs({ namespace, name }, {
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
    return this.podLogs.get(dockStore.selectedTabId) ?? [];
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
}

export const logStore = new LogStore();
