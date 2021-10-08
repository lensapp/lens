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

import { action, makeObservable, observable } from "mobx";
import { autoBind, createStorage, disposer, StorageHelper } from "../../utils";
import { dockStore, TabId } from "./dock.store";

export interface DockTabStoreOptions {
  autoInit?: boolean; // load data from storage when `storageKey` is provided and bind events, default: true
  storageKey?: string; // save data to persistent storage under the key
}

export class DockTabStore<T extends {}> {
  @observable.ref private storage?: StorageHelper<Record<TabId, T>>; // available only with `options.storageKey`
  @observable private _data: Record<TabId, T> = {};
  @observable dataReady = false; // dock-tab's data ready to interact, e.g. start editing resource

  protected dispose = disposer();

  get data() {
    if (this.options.storageKey) {
      return this.storage.get();
    }

    return this._data;
  }

  set data(value: Record<TabId, T>) {
    if (this.options.storageKey) {
      this.storage.set(value);
    } else {
      this._data = value;
    }
  }

  protected constructor(protected options: DockTabStoreOptions = {}) {
    makeObservable(this); // must be called *before* autoBind() when used with mobx's method decorators
    autoBind(this);

    this.options = {
      autoInit: true,
      ...this.options,
    };

    if (this.options.storageKey) {
      this.storage = createStorage(this.options.storageKey, this._data);
      this.dispose.push(() => this.storage.dispose());
    }

    if (this.options.autoInit) {
      this.whenReady.then(() => this.init());
    }
  }

  get whenReady(): Promise<any> {
    return Promise.all([
      dockStore.whenReady,
      this.storage?.whenReady,
    ]);
  }

  @action
  protected init() {
    this.dataReady = true;

    this.dispose.push(
      dockStore.onTabClose(({ tabId }) => this.clearData(tabId)),
    );
  }

  getData(tabId: TabId): T {
    return this.data[tabId];
  }

  @action
  setData(tabId: TabId, data: T) {
    this.data[tabId] = data;
  }

  @action
  clearData(tabId: TabId) {
    delete this.data[tabId];
  }

  @action
  reset() {
    this.data = {};
    this.dataReady = false;
  }

  @action
  destroy() {
    this.reset();
    this.dispose();
  }
}
