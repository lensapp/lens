/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { makeObservable, observable, reaction } from "mobx";
import { autoBind, StorageLayer, toJS } from "../../../utils";
import type { TabId } from "../dock/store";

export interface DockTabStoreDependencies<T> {
  storage?: StorageLayer<DockTabStorageState<T>>;
}

export type DockTabStorageState<T> = Record<TabId, T>;

export interface DockTabStorageLayer<T> {
  isReady(tabId: TabId): boolean;
  getData(tabId: TabId): T;
  setData(tabId: TabId, data: T): void;
  clearData(tabId: TabId): void;
  findTabIdFromData(inspecter: (val: T) => any): TabId | undefined;
}

export class DockTabStore<T> implements DockTabStorageLayer<T> {
  protected data = observable.map<TabId, T>();

  constructor(protected readonly dependencies: DockTabStoreDependencies<T>) {
    makeObservable(this);
    autoBind(this);

    const { storage } = this.dependencies;

    if (storage) {
      this.data.replace(storage.get());
      reaction(() => this.toJSON(), data => storage.set(data));
    }
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

  protected getAllData() {
    return this.data.toJSON();
  }

  findTabIdFromData(inspecter: (val: T) => any): TabId | undefined {
    for (const [tabId, data] of this.data) {
      if (inspecter(data)) {
        return tabId;
      }
    }

    return undefined;
  }

  isReady(tabId: TabId): boolean {
    return this.getData(tabId) !== undefined;
  }

  getData(tabId: TabId): T {
    return this.data.get(tabId);
  }

  setData(tabId: TabId, data: T): void {
    this.data.set(tabId, data);
  }

  clearData(tabId: TabId): void {
    this.data.delete(tabId);
  }
}
