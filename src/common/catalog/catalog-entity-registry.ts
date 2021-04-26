import { action, computed, IObservableArray, makeObservable, observable } from "mobx";
import { CatalogEntity } from "./catalog-entity";
import { toJS } from "../utils";

export class CatalogEntityRegistry {
  protected sources = observable.map<string, IObservableArray<CatalogEntity>>([], { deep: true });

  constructor() {
    makeObservable(this);
  }

  @action addSource(id: string, source: IObservableArray<CatalogEntity>) {
    this.sources.set(id, source);
  }

  @action removeSource(id: string) {
    this.sources.delete(id);
  }

  @computed get items(): CatalogEntity[] {
    return toJS(Array.from(this.sources.values()).flat());
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    const items = this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind);

    return items as T[];
  }
}

export const catalogEntityRegistry = new CatalogEntityRegistry();
