/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import { observable } from "mobx";
import type { PodLogsQuery, Pod } from "@k8slens/kube-object";
import { waitUntilDefined, getOrInsertWith, interval, isObject, hasOwnProperty, hasStringProperty, hasTypedProperty, isNumber } from "@k8slens/utilities";
import type { IntervalFn } from "@k8slens/utilities";
import type { TabId } from "../dock/store";
import type { CallForLogs } from "./call-for-logs.injectable";
import type { LogTabData } from "./tab-store";
import { inspect } from "util";

type PodLogLine = string;

const logLinesToLoad = 500;

interface Dependencies {
  callForLogs: CallForLogs;
}

export class LogStore {
  protected readonly podLogs = observable.map<TabId, PodLogLine[]>();
  protected readonly refreshers = new Map<TabId, IntervalFn>();

  constructor(private dependencies: Dependencies) {}

  protected handlerError(tabId: TabId, error: unknown): void {
    const getErrorMessage = (error: unknown): string[] => {
      if (!isObject(error)) {
        return [`Failed to load logs: ${String(error)}`];
      }

      if (hasStringProperty(error, "message") && hasStringProperty(error, "reason") && hasTypedProperty(error, "code", isNumber)) {
        return [
          `Failed to load logs: ${error.message}`,
          `Reason: ${error.reason} (${error.code})`,
        ];
      }

      if (hasOwnProperty(error, "error")) {
        return getErrorMessage(error.error);
      }

      return [`Failed to load logs: ${inspect(error, {
        colors: false,
      })}`];
    };

    this.stopLoadingLogs(tabId);
    this.podLogs.set(tabId, getErrorMessage(error));
  }

  /**
   * Function prepares tailLines param for passing to API request
   * Each time it increasing it's number, caused to fetch more logs.
   * Also, it handles loading errors, rewriting whole logs with error
   * messages
   */
  public async load(tabId: TabId, computedPod: IComputedValue<Pod | undefined>, logTabData: IComputedValue<LogTabData | undefined>): Promise<void> {
    try {
      const logs = await this.loadLogs(computedPod, logTabData, {
        tailLines: this.getLogLines(tabId) + logLinesToLoad,
      });

      this.getRefresher(tabId, computedPod, logTabData).start();
      this.podLogs.set(tabId, logs);
    } catch (error) {
      this.handlerError(tabId, error);
    }
  }

  private getRefresher(tabId: TabId, computedPod: IComputedValue<Pod | undefined>, logTabData: IComputedValue<LogTabData | undefined>): IntervalFn {
    return getOrInsertWith(this.refreshers, tabId, () => (
      interval(10, () => {
        if (this.podLogs.has(tabId)) {
          void this.loadMore(tabId, computedPod, logTabData);
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
  public async loadMore(tabId: TabId, computedPod: IComputedValue<Pod | undefined>, logTabData: IComputedValue<LogTabData | undefined>): Promise<void> {
    const oldLogs = this.podLogs.get(tabId);

    if (!oldLogs?.length) {
      return;
    }

    try {
      const logs = await this.loadLogs(computedPod, logTabData, {
        sinceTime: this.getLastSinceTime(tabId),
      });

      // Add newly received logs to bottom
      this.podLogs.set(tabId, [...oldLogs, ...logs.filter(Boolean)]);
    } catch (error) {
      this.handlerError(tabId, error);
    }
  }

  /**
   * Main logs loading function adds necessary data to payload and makes
   * an API request
   * @param tabId
   * @param params request parameters described in IPodLogsQuery interface
   * @returns A fetch request promise
   */
  private async loadLogs(computedPod: IComputedValue<Pod | undefined>, logTabData: IComputedValue<LogTabData | undefined>, params: Partial<PodLogsQuery>): Promise<string[]> {
    const {
      pod,
      tabData: {
        selectedContainer,
        showPrevious,
      },
    } = await waitUntilDefined(() => {
      const pod = computedPod.get();
      const tabData = logTabData.get();

      if (pod && tabData) {
        return { pod, tabData };
      }

      return undefined;
    });
    const namespace = pod.getNs();
    const name = pod.getName();

    const result = await this.dependencies.callForLogs({ namespace, name }, {
      ...params,
      timestamps: true,  // Always setting timestamp to separate old logs from new ones
      container: selectedContainer,
      previous: showPrevious,
    });

    return result.trimEnd().replace(/\r/g, "\n").split("\n");
  }

  getLogLines(tabId: TabId): number{
    return this.getLogs(tabId).length;
  }

  areLogsPresent(tabId: TabId): boolean {
    return !this.podLogs.has(tabId);
  }

  getLogs(tabId: TabId): string[]{
    return this.podLogs.get(tabId) ?? [];
  }

  getLogsWithoutTimestamps(tabId: TabId): string[]{
    return this.getLogs(tabId).map(removeTimestamps);
  }

  getTimestampSplitLogs(tabId: TabId): [string, string][]{
    return this.getLogs(tabId).map(splitOutTimestamp);
  }

  /**
   * It gets timestamps from all logs then returns last one + 1 second
   * (this allows to avoid getting the last stamp in the selection)
   * @param tabId
   */
  getLastSinceTime(tabId: TabId): string {
    const logs = this.podLogs.get(tabId) ?? [];
    const [timestamp] = getTimestamps(logs[logs.length - 1]) ?? [];
    const stamp = timestamp ? new Date(timestamp) : new Date();

    stamp.setSeconds(stamp.getSeconds() + 1); // avoid duplicates from last second

    return stamp.toISOString();
  }

  clearLogs(tabId: TabId): void {
    this.podLogs.delete(tabId);
  }

  reload(tabId: TabId, computedPod: IComputedValue<Pod | undefined>, logTabData: IComputedValue<LogTabData | undefined>): Promise<void> {
    this.clearLogs(tabId);

    return this.load(tabId, computedPod, logTabData);
  }
}

const removeTimestamps = (logs: string) => logs.replace(/^\d+.*?\s/gm, "");
const getTimestamps = (logs: string) => logs.match(/^\d+\S+/gm);
const splitOutTimestamp = (logs: string): [string, string] => {
  const extraction = /^(\d+\S+)(.*)/m.exec(logs);

  if (!extraction || extraction.length < 3) {
    return ["", logs];
  }

  return [extraction[1], extraction[2]];
};
