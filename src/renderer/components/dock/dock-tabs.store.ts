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

import { autorun, computed, IReactionDisposer, IReactionOptions, makeObservable, observable, reaction } from "mobx";
import { autoBind, createStorage, Disposer, disposer, StorageHelper } from "../../utils";
import { dockStore, TabId } from "./dock.store";

export interface DockTabStoreOptions {
  autoInit?: boolean; // load data from storage when `storageKey` is provided and bind events, default: true
  storageKey?: string; // save data to persistent storage under the key
}

export class DockTabsStore<T extends {}> {
  @observable private _data: Record<TabId, T> = {};
  @observable.ref private storage?: StorageHelper<Record<TabId, T>>; // available only with `options.storageKey`
  protected watchers = observable.map<TabId, IReactionDisposer | Disposer>();
  protected dispose = disposer();

  @computed get data() {
    if (this.options.storageKey) {
      return this.storage.get();
    } else {
      return this._data;
    }
  }

  set data(value: Record<TabId, T>) {
    if (this.options.storageKey) {
      this.storage.set(value);
    } else {
      this._data = value;
    }
  }

  protected constructor(protected options: DockTabStoreOptions = {}) {
    autoBind(this);
    makeObservable(this);

    this.options = {
      autoInit: true,
      ...this.options,
    };

    if (this.options.storageKey) {
      this.storage = createStorage(this.options.storageKey, {}); // starts preloading json file via Node.fs right away
    }

    if (this.options.autoInit) {
      this.whenReady.then(() => this.init());
    }
  }

  get whenReady(): Promise<any> {
    return Promise.allSettled([
      dockStore.whenReady,
      this.storage?.whenReady,
    ]);
  }

  protected init() {
    this.dispose.push(
      autorun(() => {
        const docTabIds = dockStore.tabs.map(tab => tab.id);
        const savedDataTabIds = Object.keys(this.data);

        savedDataTabIds.forEach(tabId => {
          const isTabClosed = !docTabIds.includes(tabId);

          if (isTabClosed) {
            this.clearData(tabId); // clear related tab's data
            this.watchers.get(tabId)?.(); // dispose tab related data watcher
            dockStore.closeTab(tabId); // make sure dock tab is closed
          }
        });
      }),

      // clean up data watchers (if any)
      () => this.disposeWatchers(),
    );
  }

  protected disposeWatchers() {
    this.watchers.forEach(dispose => dispose());
    this.watchers.clear();
  }

  onDataChange(callback: (entries: [TabId, T][]) => void, opts?: IReactionOptions): IReactionDisposer {
    return reaction(() => Object.entries(this.data), callback, opts);
  }

  onTabDataChange(tabId: TabId, callback: (data: T, prevData?: T) => void, opts?: IReactionOptions): IReactionDisposer {
    return reaction(() => this.data[tabId], callback, opts);
  }

  isReady(tabId: TabId): boolean {
    return Boolean(this.getData(tabId) !== undefined);
  }

  getData(tabId: TabId) {
    return this.data[tabId];
  }

  setData(tabId: TabId, data: T) {
    this.data[tabId] = data;
  }

  clearData(tabId: TabId) {
    delete this.data[tabId];
  }

  reset() {
    this.data = {};
  }

  destroy() {
    this.dispose();
    this.disposeWatchers();
    this.reset();
  }
}
