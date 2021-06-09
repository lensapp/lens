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

import { autorun, observable, reaction } from "mobx";
import { autoBind, createStorage, StorageHelper, toJS } from "../../utils";
import { dockStore, TabId } from "./dock.store";

export interface DockTabStoreOptions {
  autoInit?: boolean; // load data from storage when `storageKey` is provided and bind events, default: true
  storageKey?: string; // save data to persistent storage under the key
}

export type DockTabStorageState<T> = Record<TabId, T>;

export class DockTabStore<T> {
  protected storage?: StorageHelper<DockTabStorageState<T>>;
  protected data = observable.map<TabId, T>();

  constructor(protected options: DockTabStoreOptions = {}) {
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
      this.storage = createStorage(storageKey, {});
      this.storage.whenReady.then(() => {
        this.data.replace(this.storage.get());
        reaction(() => this.toJSON(), data => this.storage.set(data));
      });
    }

    // clear data for closed tabs
    autorun(() => {
      const currentTabs = dockStore.tabs.map(tab => tab.id);

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
