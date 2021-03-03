import { autorun, observable, reaction } from "mobx";
import { createStorage, StorageHelper } from "../../local-storage";
import { autobind } from "../../utils";
import { dockStore, TabId } from "./dock.store";

interface Options<T = any> {
  storageName?: string; // persistent key
  storageSerializer?: (data: T) => Partial<T>; // allow to customize data before saving
}

@autobind()
export class DockTabStore<T = any> {
  private storage?: StorageHelper<Record<TabId, T>>;
  protected data = observable.map<TabId, T>();

  constructor(protected options: Options<T> = {}) {
    this.init();
  }

  protected async init() {
    const { storageName: storageKey } = this.options;

    // auto-save to local-storage
    if (storageKey) {
      this.storage = createStorage(storageKey, {});
      await this.storage.whenReady;
      this.data.replace(this.storage.get());
      reaction(() => this.serializeData(), data => this.storage.set(data));
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

  protected serializeData(): Record<TabId, T> {
    const data = this.data.toJSON();
    const { storageSerializer } = this.options;

    if (storageSerializer) {
      return Object.entries(data).reduce((data, [tabId, tabData]) => {
        data[tabId] = storageSerializer(tabData) as T;

        return data;
      }, data);
    }

    return data;
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
  }
}
