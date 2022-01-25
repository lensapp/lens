/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, observable, makeObservable, IComputedValue } from "mobx";

import { IPodLogsQuery, Pod } from "../../../../common/k8s-api/endpoints";
import { autoBind, getOrInsertWith, interval, IntervalFn } from "../../../utils";
import type { TabId } from "../dock-store/dock.store";
import type { LogTabData } from "./tab.store";

type PodLogLine = string;

const logLinesToLoad = 500;

interface Dependencies {
  callForLogs: ({ namespace, name }: { namespace: string, name: string }, query: IPodLogsQuery) => Promise<string>
}

export class LogStore {
  @observable protected podLogs = observable.map<TabId, PodLogLine[]>();
  protected refreshers = new Map<TabId, IntervalFn>();

  constructor(private dependencies: Dependencies) {
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

    this.stopLoadingLogs(tabId);
    this.podLogs.set(tabId, message);
  }

  /**
   * Function prepares tailLines param for passing to API request
   * Each time it increasing it's number, caused to fetch more logs.
   * Also, it handles loading errors, rewriting whole logs with error
   * messages
   */
  load = async (tabId: TabId, logTabData: IComputedValue<LogTabData>) => {
    try {
      const logs = await this.loadLogs(logTabData, {
        tailLines: this.getLinesByTabId(tabId) + logLinesToLoad,
      });

      this.getRefresher(tabId, logTabData).start();
      this.podLogs.set(tabId, logs);
    } catch (error) {
      this.handlerError(tabId, error);
    }
  };

  private getRefresher(tabId: TabId, logTabData: IComputedValue<LogTabData>): IntervalFn {
    return getOrInsertWith(this.refreshers, tabId, () => (
      interval(10, () => {
        if (this.podLogs.has(tabId)) {
          this.loadMore(tabId, logTabData);
        }
      })
    ));
  }

  /**
   * Stop loading more logs for a given tab
   * @param tabId The ID of the logs tab to stop loading more logs for
   */
  public stopLoadingLogs(tabId: TabId): void {
    this.refreshers.get(tabId)?.stop();
  }

  /**
   * Function is used to refresher/stream-like requests.
   * It changes 'sinceTime' param each time allowing to fetch logs
   * starting from last line received.
   * @param tabId
   */
  loadMore = async (tabId: TabId, logTabData: IComputedValue<LogTabData>) => {
    if (!this.podLogs.get(tabId).length) {
      return;
    }

    try {
      const oldLogs = this.podLogs.get(tabId);
      const logs = await this.loadLogs(logTabData, {
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
  private async loadLogs(logTabData: IComputedValue<LogTabData>, params: Partial<IPodLogsQuery>): Promise<string[]> {
    const { selectedContainer, previous, selectedPod } = logTabData.get();
    const pod = new Pod(selectedPod);
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
   * @deprecated This depends on dockStore, which should be removed
   * Converts logs into a string array
   * @returns Length of log lines
   */
  @computed
  get lines(): number {
    return this.logs.length;
  }

  public getLinesByTabId = (tabId: TabId): number => {
    return this.getLogsByTabId(tabId).length;
  };

  public getLogsByTabId = (tabId: TabId): string[] => {
    return this.podLogs.get(tabId) ?? [];
  };

  public getLogsWithoutTimestampsByTabId = (tabId: TabId): string[] => {
    return this.getLogsByTabId(tabId).map(this.removeTimestamps);
  };

  public getTimestampSplitLogsByTabId = (tabId: TabId): [string, string][] => {
    return this.getLogsByTabId(tabId).map(this.splitOutTimestamp);
  };

  /**
   * @deprecated This now only returns the empty array
   * Returns logs with timestamps for selected tab
   */
  get logs(): string[] {
    return [];
  }

  /**
   * @deprecated This now only returns the empty array
   * Removes timestamps from each log line and returns changed logs
   * @returns Logs without timestamps
   */
  get logsWithoutTimestamps(): string[] {
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

  splitOutTimestamp = (logs: string): [string, string] => {
    const extraction = /^(\d+\S+)(.*)/m.exec(logs);

    if (!extraction || extraction.length < 3) {
      return ["", logs];
    }

    return [extraction[1], extraction[2]];
  };

  getTimestamps(logs: string) {
    return logs.match(/^\d+\S+/gm);
  }

  removeTimestamps = (logs: string) => {
    return logs.replace(/^\d+.*?\s/gm, "");
  };

  clearLogs(tabId: TabId) {
    this.podLogs.delete(tabId);
  }

  reload = (tabId: TabId, logTabData: IComputedValue<LogTabData>) => {
    this.clearLogs(tabId);

    return this.load(tabId, logTabData);
  };
}
