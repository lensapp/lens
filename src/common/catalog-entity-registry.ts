import { action, computed, observable } from "mobx";
import { CatalogEntity } from "./catalog-entity";

export class CatalogEntityRegistry {
  @observable.deep protected sources: Map<string, CatalogEntity[]> = observable.map(new Map(), { deep: true });

  @action addSource(id: string, source: CatalogEntity[]) {
    this.sources.set(id, source);
  }

  @action removeSource(id: string) {
    this.sources.delete(id);
  }

  @computed get items() {
    const catalogItems: CatalogEntity[] = [];

    for (const items of this.sources.values()) {
      items.forEach((item) => catalogItems.push(item));
    }

    return catalogItems;
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    const items = this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind);

    return items as T[];
  }
}

export const catalogEntityRegistry = new CatalogEntityRegistry();
