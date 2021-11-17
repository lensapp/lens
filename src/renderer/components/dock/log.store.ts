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

import { observable, makeObservable } from "mobx";
import moment from "moment";
import { podsStore } from "../+workloads-pods/pods.store";

import { IPodLogsQuery, podsApi } from "../../../common/k8s-api/endpoints";
import { UserStore } from "../../../common/user-store";
import { autoBind } from "../../utils";
import type { TabId } from "./dock.store";
import type { LogTabData } from "./log-tab.store";

type PodLogLine = string;

const logLinesToLoad = 500;

function removeTimestamp(logLine: string) {
  return logLine.replace(/^\d+.*?\s/gm, "");
}

function formatTimestamp(log: string, tz: string): string {
  const extraction = /^(?<timestamp>\d+\S+)(?<line>.*)/.exec(log);

  if (!extraction) {
    return log;
  }

  const { timestamp, line } = extraction.groups;

  return `${moment.tz(timestamp, tz).format()}${line}`;
}

export class LogStore {
  @observable podLogs = observable.map<TabId, PodLogLine[]>();

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  handlerError(tabId: TabId, error: any): void {
    if (error.error && !(error.message || error.reason || error.code)) {
      error = error.error;
    }

    const message = [
      `Failed to load logs: ${error.message}`,
      `Reason: ${error.reason} (${error.code})`,
    ];

    this.podLogs.set(tabId, message);
  }

  /**
   * Function prepares tailLines param for passing to API request
   * Each time it increasing it's number, caused to fetch more logs.
   * Also, it handles loading errors, rewriting whole logs with error
   * messages
   * @param tabId
   */
  load = async (tabId: TabId, data: LogTabData) => {
    try {
      const prevLogsLength = this.podLogs.get(tabId)?.length ?? 0;
      const params = {
        tailLines: prevLogsLength + logLinesToLoad,
      };
      const logs = await this.loadLogs(data, params);

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
  loadMore = async (tabId: TabId, data: LogTabData) => {
    if (!this.podLogs.get(tabId).length) {
      return;
    }

    try {
      const logs = await this.loadLogs(data, {
        sinceTime: this.getLastSinceTime(tabId),
      });

      // Add newly received logs to bottom
      this.podLogs.get(tabId).push(...logs.filter(Boolean));
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
  async loadLogs(data: LogTabData, params: Partial<IPodLogsQuery>): Promise<string[]> {
    const { podsOwner, selectedContainer, selectedPod, previous } = data;
    const pod = podsOwner
      ? podsStore.getPodsByOwnerId(podsOwner).find(pod => pod.getId() === selectedPod)
      : podsStore.getById(selectedPod);

    if (!pod) {
      return [];
    }

    const namespace = pod.getNs();
    const name = pod.getName();
    const result = await podsApi.getLogs({ namespace, name }, {
      ...params,
      timestamps: true,  // Always setting timestamp to separate old logs from new ones
      container: selectedContainer,
      previous,
    });

    return result.split("\n").filter(Boolean);
  }

  getLogs(tabId: TabId, { showTimestamps }: LogTabData): string[] {
    const logs = this.podLogs.get(tabId) ?? [];
    const { localeTimezone } = UserStore.getInstance();

    return showTimestamps
      ? logs.map(log => formatTimestamp(log, localeTimezone))
      : logs.map(removeTimestamp);
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

  /**
   * Get the local formatted date of the first log line's timestamp
   * @param tabId The ID of the tab to get the time of
   * @returns `""` if no logs, or log does not have a timestamp
   */
  getFirstTime(tabId: TabId): string {
    const logs = this.podLogs.get(tabId);

    if (!logs?.length) {
      return "";
    }

    const timestamps = this.getTimestamps(logs[0]);

    if (!timestamps) {
      return "";
    }

    const stamp = new Date(timestamps[0]);

    return stamp.toLocaleString();
  }

  getTimestamps(logs: string) {
    return logs.match(/^\d+\S+/gm);
  }

  clearLogs(tabId: TabId) {
    this.podLogs.delete(tabId);
  }
}

export const logStore = new LogStore();
