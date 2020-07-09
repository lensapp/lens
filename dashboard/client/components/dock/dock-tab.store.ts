import { autorun, observable, reaction } from "mobx";
import { autobind, StorageHelper } from "../../utils";
import { dockStore, TabId } from "./dock.store";

interface Options<T = any> {
  storageName?: string; // name to sync data with localStorage
  storageSerializer?: (data: T) => Partial<T>; // allow to customize data before saving to localStorage
}

@autobind()
export class DockTabStore<T = any> {
  protected data = observable.map<TabId, T>([]);

  constructor(protected options: Options<T> = {}) {
    const { storageName } = options;

    // auto-save to local-storage
    if (storageName) {
      const storage = new StorageHelper<[TabId, T][]>(storageName, []);
      this.data.replace(storage.get());
      reaction(() => this.serializeData(), (data: T | any) => storage.set(data));
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

  protected serializeData(): [string, Partial<T>][] {
    const { storageSerializer } = this.options;
    return Array.from(this.data)
      .map(([tabId, tabData]) => {
        if (storageSerializer) {
          return [tabId, storageSerializer(tabData)];
        }
        return [tabId, tabData];
      });
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

  reset(): void {
    this.data.clear();
  }
}
