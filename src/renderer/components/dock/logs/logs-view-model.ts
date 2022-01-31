/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LogTabData } from "./tab-store";
import { computed, IComputedValue } from "mobx";
import type { TabId } from "../dock/store";
import type { SearchStore } from "../../../search-store/search-store";
import type { Pod } from "../../../../common/k8s-api/endpoints";

export interface LogTabViewModelDependencies {
  getLogs: (tabId: TabId) => string[];
  getLogsWithoutTimestamps: (tabId: TabId) => string[];
  getTimestampSplitLogs: (tabId: TabId) => [string, string][];
  getLogTabData: (tabId: TabId) => LogTabData;
  setLogTabData: (tabId: TabId, data: LogTabData) => void;
  loadLogs: (tabId: TabId, pod: IComputedValue<Pod | undefined>, logTabData: IComputedValue<LogTabData>) => Promise<void>;
  reloadLogs: (tabId: TabId, pod: IComputedValue<Pod | undefined>, logTabData: IComputedValue<LogTabData>) => Promise<void>;
  renameTab: (tabId: TabId, title: string) => void;
  stopLoadingLogs: (tabId: TabId) => void;
  getPodById: (id: string) => Pod | undefined;
  getPodsByOwnerId: (id: string) => Pod[];
  areLogsPresent: (tabId: TabId) => boolean;
  searchStore: SearchStore;
}

export class LogTabViewModel {
  constructor(protected readonly tabId: TabId, private readonly dependencies: LogTabViewModelDependencies) {}

  get searchStore() {
    return this.dependencies.searchStore;
  }

  readonly isLoading = computed(() => this.dependencies.areLogsPresent(this.tabId));
  readonly logs = computed(() => this.dependencies.getLogs(this.tabId));
  readonly logsWithoutTimestamps = computed(() => this.dependencies.getLogsWithoutTimestamps(this.tabId));
  readonly timestampSplitLogs = computed(() => this.dependencies.getTimestampSplitLogs(this.tabId));
  readonly logTabData = computed(() => this.dependencies.getLogTabData(this.tabId));
  readonly pods = computed(() => {
    const data = this.logTabData.get();

    if (!data) {
      return [];
    }

    if (typeof data.owner?.uid === "string") {
      return this.dependencies.getPodsByOwnerId(data.owner.uid);
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

  updateLogTabData = (partialData: Partial<LogTabData>) => {
    this.dependencies.setLogTabData(this.tabId, { ...this.logTabData.get(), ...partialData });
  };

  loadLogs = () => this.dependencies.loadLogs(this.tabId, this.pod, this.logTabData);
  reloadLogs = () => this.dependencies.reloadLogs(this.tabId, this.pod, this.logTabData);
  renameTab = (title: string) => this.dependencies.renameTab(this.tabId, title);
  stopLoadingLogs = () => this.dependencies.stopLoadingLogs(this.tabId);
}
