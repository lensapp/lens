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

import { action, autorun, observable, reaction } from "mobx";
import logger from "../../../common/logger";
import { autoBind, createStorage, noop, StorageHelper, toJS } from "../../utils";
import { dockStore, TabId } from "./dock.store";

export interface DockTabStoreOptions<T> {
  /**
   * load data from storage when `storageKey` is provided and bind events
   *
   * @default true
   */
  autoInit?: boolean;

  /**
   * save data to persistent storage under the key
   */
  storageKey?: string;

  /**
   * A function to call for validating values. It should `throw` if an error is present
   */
  validator?: (value: T) => void;
}

type PartialObject<T> = T extends object ? Partial<T> : never;

export class DockTabStore<T> {
  protected storage?: StorageHelper<Record<TabId, T>>;
  protected data = observable.map<TabId, T>();
  protected validator: (value: T) => void;

  constructor({ autoInit = true, storageKey, validator = noop }: DockTabStoreOptions<T> = {}) {
    autoBind(this);

    this.validator = validator;

    if (autoInit) {
      this.init(storageKey);
    }
  }

  protected init(storageKey: string | undefined) {
    // auto-save to local-storage
    if (storageKey) {
      this.storage = createStorage(storageKey, {});
      this.storage.whenReady.then(action(() => {
        for (const [tabId, value] of Object.entries(this.storage.get())) {
          try {
            this.setData(tabId, value);
          } catch (error) {
            logger.warn(`[DOCK-TAB-STORE-${storageKey}]: data for ${tabId} was invalid, skipping`, error);
            dockStore.closeTab(tabId);
          }
        }
        reaction(
          () => this.toJSON(),
          data => this.storage.set(data),
          {
            // fireImmediately so that invalid data is removed from the store
            fireImmediately: true,
          },
        );
      }));
    }

    // clear data for closed tabs
    autorun(() => {
      const currentTabs = new Set(dockStore.tabs.map(tab => tab.id));

      for (const tabId in this.data) {
        if (!currentTabs.has(tabId)) {
          this.clearData(tabId);
        }
      }
    });
  }

  protected finalizeDataForSave(data: T): T {
    return data;
  }

  protected toJSON(): Record<TabId, T> {
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
    this.validator(data);
    this.data.set(tabId, data);
  }

  /**
   * Do a partial update for the dock tab data.
   *
   * NOTE: only supported for object types
   * @param tabId The ID of the tab to merge data with
   * @param data The partial value of the data
   */
  mergeData(tabId: TabId, data: PartialObject<T>) {
    this.setData(tabId, { ...this.getData(tabId), ...data });
  }

  clearData(tabId: TabId) {
    this.data.delete(tabId);
  }

  reset() {
    this.data.clear();
    this.storage?.reset();
  }
}
