/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LogTabData } from "./tab-store";
import { computed, IComputedValue } from "mobx";
import type { TabId } from "../dock/store";
import { SearchStore } from "../../../search-store/search-store";
import type { Pod } from "../../../../common/k8s-api/endpoints";

export interface LogTabViewModelDependencies {
  getLogs: (tabId: TabId) => string[];
  getLogsWithoutTimestamps: (tabId: TabId) => string[];
  getTimestampSplitLogs: (tabId: TabId) => [string, string][];
  getLogTabData: (tabId: TabId) => LogTabData;
  setLogTabData: (tabId: TabId, data: LogTabData) => void;
  loadLogs: (tabId: TabId, logTabData: IComputedValue<LogTabData>) => Promise<void>;
  reloadLogs: (tabId: TabId, logTabData: IComputedValue<LogTabData>) => Promise<void>;
  updateTabName: (tabId: TabId, pod: Pod) => void;
  stopLoadingLogs: (tabId: TabId) => void;
  getPodById: (id: string) => Pod | undefined;
  getPodsByOwnerId: (id: string) => Pod[];
}

export class LogTabViewModel {
  constructor(protected readonly tabId: TabId, private readonly dependencies: LogTabViewModelDependencies) {}

  readonly logs = computed(() => this.dependencies.getLogs(this.tabId));
  readonly logsWithoutTimestamps = computed(() => this.dependencies.getLogsWithoutTimestamps(this.tabId));
  readonly timestampSplitLogs = computed(() => this.dependencies.getTimestampSplitLogs(this.tabId));
  readonly logTabData = computed(() => this.dependencies.getLogTabData(this.tabId));
  readonly pods = computed(() => {
    const data = this.logTabData.get();

    if (!data) {
      return [];
    }

    if (typeof data.ownerId === "string") {
      return this.dependencies.getPodsByOwnerId(data.ownerId);
    }

    return [this.dependencies.getPodById(data.selectedPodId)];
  });
  readonly pod = computed(() => {
    const data = this.logTabData.get();

    if (!data) {
      return undefined;
    }

    return this.dependencies.getPodById(data.selectedPodId);
  });
  readonly searchStore = new SearchStore();

  updateLogTabData = (partialData: Partial<LogTabData>) => {
    this.dependencies.setLogTabData(this.tabId, { ...this.logTabData.get(), ...partialData });
  };

  loadLogs = () => this.dependencies.loadLogs(this.tabId, this.logTabData);
  reloadLogs = () => this.dependencies.reloadLogs(this.tabId, this.logTabData);
  updateTabName = () => this.dependencies.updateTabName(this.tabId, this.pod.get());
  stopLoadingLogs = () => this.dependencies.stopLoadingLogs(this.tabId);
}
