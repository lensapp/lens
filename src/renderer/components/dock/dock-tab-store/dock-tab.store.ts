/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autorun, observable, reaction } from "mobx";
import { autoBind, StorageHelper, toJS } from "../../../utils";
import type { DockStore, TabId } from "../dock-store/dock.store";

export interface DockTabStoreOptions {
  autoInit?: boolean; // load data from storage when `storageKey` is provided and bind events, default: true
  storageKey?: string; // save data to persistent storage under the key
}

export type DockTabStorageState<T> = Record<TabId, T>;

interface Dependencies {
  dockStore: DockStore
  createStorage: <T>(storageKey: string, options: DockTabStorageState<T>) => StorageHelper<DockTabStorageState<T>>
}

export class DockTabStore<T> {
  protected storage?: StorageHelper<DockTabStorageState<T>>;
  protected data = observable.map<TabId, T>();

  constructor(protected dependencies: Dependencies, protected options: DockTabStoreOptions) {
    autoBind(this);

    this.options = {
      autoInit: true,
      ...this.options,
    };

    if (this.options.autoInit) {
      this.init();
    }
  }

  protected init() {
    const { storageKey } = this.options;

    // auto-save to local-storage
    if (storageKey) {
      this.storage = this.dependencies.createStorage<T>(storageKey, {});

      this.storage.whenReady.then(() => {
        this.data.replace(this.storage.value);
        reaction(() => this.toJSON(), data => this.storage.set(data));
      });
    }

    // clear data for closed tabs
    autorun(() => {
      const currentTabs = this.dependencies.dockStore.tabs.map(tab => tab.id);

      Array.from(this.data.keys()).forEach(tabId => {
        if (!currentTabs.includes(tabId)) {
          this.clearData(tabId);
        }
      });
    });
  }

  protected finalizeDataForSave(data: T): T {
    return data;
  }

  protected toJSON(): DockTabStorageState<T> {
    const deepCopy = toJS(this.data);

    deepCopy.forEach((tabData, key) => {
      deepCopy.set(key, this.finalizeDataForSave(tabData));
    });

    return Object.fromEntries<T>(deepCopy);
  }

  isReady(tabId: TabId): boolean {
    return Boolean(this.getData(tabId) !== undefined);
  }

  getData(tabId: TabId) {
    return this.data.get(tabId);
  }

  setData(tabId: TabId, data: T) {
    this.data.set(tabId, data);
  }

  clearData(tabId: TabId) {
    this.data.delete(tabId);
  }

  reset() {
    this.data.clear();
    this.storage?.reset();
  }
}
