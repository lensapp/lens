/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LogTabData, LogTabStore } from "../../log-tab-store/log-tab.store";
import type { LogStore } from "../../log-store/log.store";
import { computed, makeObservable } from "mobx";

interface Dependencies {
  dockStore: { selectedTabId: string },
  logTabStore: LogTabStore
  logStore: LogStore
}

export class LogsViewModel {
  constructor(private dependencies: Dependencies) {
    makeObservable(this, {
      logs: computed,
      logsWithoutTimestamps: computed,
      tabs: computed,
      tabId: computed,
    });
  }

  get logs() {
    return this.dependencies.logStore.logs;
  }

  get logsWithoutTimestamps() {
    return this.dependencies.logStore.logsWithoutTimestamps;
  }

  get tabs() {
    return this.dependencies.logTabStore.tabs;
  }

  get tabId() {
    return this.dependencies.dockStore.selectedTabId;
  }

  saveTab = (newTabs: LogTabData) => {
    this.dependencies.logTabStore.setData(this.tabId, { ...this.tabs, ...newTabs });
  };
}
