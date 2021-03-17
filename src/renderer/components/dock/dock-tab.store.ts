import { autorun, observable, reaction, toJS } from "mobx";
import { autobind, createStorage, StorageHelper } from "../../utils";
import { dockStore, TabId } from "./dock.store";

export interface DockTabStoreOptions {
  autoInit?: boolean; // load data from storage when `storageKey` is provided and bind events, default: true
  storageKey?: string; // save data to persistent storage under the key
}

export type DockTabStorageState<T> = Record<TabId, T>;

@autobind()
export class DockTabStore<T> {
  protected storage?: StorageHelper<DockTabStorageState<T>>;
  protected data = observable.map<TabId, T>();

  constructor(protected options: DockTabStoreOptions = {}) {
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
        reaction(() => this.getStorableData(), data => this.storage.set(data));
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

  protected getStorableData(): DockTabStorageState<T> {
    const allTabsData = toJS(this.data, { recurseEverything: true });

    return Object.fromEntries(
      Object.entries(allTabsData).map(([tabId, tabData]) => {
        return [tabId, this.finalizeDataForSave(tabData)];
      })
    );
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
    this.storage?.clear();
  }
}
