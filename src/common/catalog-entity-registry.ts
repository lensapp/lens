import { action, computed, observable, IObservableArray } from "mobx";
import { CatalogEntity } from "./catalog-entity";

export class CatalogEntityRegistry {
  protected sources = observable.map<string, IObservableArray<CatalogEntity>>([], { deep: true });

  @action addSource(id: string, source: IObservableArray<CatalogEntity>) {
    this.sources.set(id, source);
  }

  @action removeSource(id: string) {
    this.sources.delete(id);
  }

  @computed get items(): CatalogEntity[] {
    return Array.from(this.sources.values()).flat();
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    const items = this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind);

    return items as T[];
  }
}

export const catalogEntityRegistry = new CatalogEntityRegistry();
