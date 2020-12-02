import { action, observable, reaction } from "mobx";
import { autobind } from "./utils";
import { KubeObject } from "./api/kube-object";
import { IKubeWatchEvent, kubeWatchApi } from "./api/kube-watch-api";
import { ItemStore } from "./item.store";
import { apiManager } from "./api/api-manager";
import { IKubeApiQueryParams, KubeApi } from "./api/kube-api";
import { KubeJsonApiData } from "./api/kube-json-api";
import { getHostedCluster } from "../common/cluster-store";

@autobind()
export abstract class KubeObjectStore<T extends KubeObject = any> extends ItemStore<T> {
  abstract api: KubeApi<T>;
  public limit: number;

  constructor() {
    super();
    this.bindWatchEventsUpdater();
    kubeWatchApi.addListener(this, this.onWatchApiEvent);
  }

  getStatuses?(items: T[]): Record<string, number>;

  getAllByNs(namespace: string | string[], strict = false): T[] {
    const namespaces: string[] = [].concat(namespace);

    if (namespaces.length) {
      return this.items.filter(item => namespaces.includes(item.getNs()));
    } else if (!strict) {
      return this.items;
    }
  }

  getByName(name: string, namespace?: string): T {
    return this.items.find(item => {
      return item.getName() === name && (
        namespace ? item.getNs() === namespace : true
      );
    });
  }

  getByPath(path: string): T {
    return this.items.find(item => item.selfLink === path);
  }

  getByLabel(labels: string[] | { [label: string]: string }): T[] {
    if (Array.isArray(labels)) {
      return this.items.filter((item: T) => {
        const itemLabels = item.getLabels();

        return labels.every(label => itemLabels.includes(label));
      });
    } else {
      return this.items.filter((item: T) => {
        const itemLabels = item.metadata.labels || {};

        return Object.entries(labels)
          .every(([key, value]) => itemLabels[key] === value);
      });
    }
  }

  protected async loadItems(allowedNamespaces?: string[]): Promise<T[]> {
    if (!this.api.isNamespaced || !allowedNamespaces) {
      const { limit } = this;
      const query: IKubeApiQueryParams = limit ? { limit } : {};

      return this.api.list({}, query);
    } else {
      return Promise
        .all(allowedNamespaces.map(namespace => this.api.list({ namespace })))
        .then(items => items.flat());
    }
  }

  protected filterItemsOnLoad(items: T[]) {
    return items;
  }

  @action
  async loadAll() {
    this.isLoading = true;
    let items: T[];

    try {
      const { isAdmin, allowedNamespaces } = getHostedCluster();

      items = await this.loadItems(!isAdmin ? allowedNamespaces : null);
      items = this.filterItemsOnLoad(items);
    } finally {
      if (items) {
        items = this.sortItems(items);
        this.items.replace(items);
      }
      this.isLoading = false;
      this.isLoaded = true;
    }
  }

  protected async loadItem(params: { name: string; namespace?: string }): Promise<T> {
    return this.api.get(params);
  }

  @action
  async load(params: { name: string; namespace?: string }): Promise<T> {
    const { name, namespace } = params;
    let item = this.getByName(name, namespace);

    if (!item) {
      item = await this.loadItem(params);
      const newItems = this.sortItems([...this.items, item]);

      this.items.replace(newItems);
    }

    return item;
  }

  @action
  async loadFromPath(resourcePath: string) {
    const { namespace, name } = KubeApi.parseApi(resourcePath);

    return this.load({ name, namespace });
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<T>): Promise<T> {
    return this.api.create(params, data);
  }

  async create(params: { name: string; namespace?: string }, data?: Partial<T>): Promise<T> {
    const newItem = await this.createItem(params, data);
    const items = this.sortItems([...this.items, newItem]);

    this.items.replace(items);

    return newItem;
  }

  async update(item: T, data: Partial<T>): Promise<T> {
    const newItem = await item.update<T>(data);
    const index = this.items.findIndex(item => item.getId() === newItem.getId());

    this.items.splice(index, 1, newItem);

    return newItem;
  }

  async remove(item: T) {
    await item.delete();
    this.items.remove(item);
    this.selectedItemsIds.delete(item.getId());
  }

  async removeSelectedItems() {
    return Promise.all(this.selectedItems.map(this.remove));
  }

  // collect items from watch-api events to avoid UI blowing up with huge streams of data
  protected eventsBuffer = observable<IKubeWatchEvent<KubeJsonApiData>>([], { deep: false });

  protected bindWatchEventsUpdater(delay = 1000) {
    return reaction(() => this.eventsBuffer.toJS()[0], this.updateFromEventsBuffer, {
      delay
    });
  }

  subscribe(apis = [this.api]) {
    return KubeApi.watchAll(...apis);
  }

  protected onWatchApiEvent(evt: IKubeWatchEvent) {
    if (!this.isLoaded) return;
    this.eventsBuffer.push(evt);
  }

  @action
  protected updateFromEventsBuffer() {
    if (!this.eventsBuffer.length) {
      return;
    }
    // create latest non-observable copy of items to apply updates in one action (==single render)
    let items = this.items.toJS();

    this.eventsBuffer.clear().forEach(({ type, object }) => {
      const { uid, selfLink } = object.metadata;
      const index = items.findIndex(item => item.getId() === uid);
      const item = items[index];
      const api = apiManager.getApi(selfLink);

      switch (type) {
        case "ADDED":
        case "MODIFIED":
          const newItem = new api.objectConstructor(object);

          if (!item) {
            items.push(newItem);
          } else {
            items.splice(index, 1, newItem);
          }
          break;
        case "DELETED":
          if (item) {
            items.splice(index, 1);
          }
          break;
      }
    });

    // slice to max allowed items
    if (this.limit && items.length > this.limit) {
      items = items.slice(-this.limit);
    }

    // update items
    this.items.replace(this.sortItems(items));
  }
}
