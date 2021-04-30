import { action, computed, observable, IComputedValue, IObservableArray } from "mobx";
import { CatalogEntity } from "./catalog-entity";
import { iter } from "../utils";

export class CatalogEntityRegistry {
  protected sources = observable.map<string, IComputedValue<CatalogEntity[]>>([], { deep: true });

  @action addObservableSource(id: string, source: IObservableArray<CatalogEntity>) {
    this.sources.set(id, computed(() => source));
  }

  @action addComputedSource(id: string, source: IComputedValue<CatalogEntity[]>) {
    this.sources.set(id, source);
  }

  @action removeSource(id: string) {
    this.sources.delete(id);
  }

  @computed get items(): CatalogEntity[] {
    return Array.from(iter.flatMap(this.sources.values(), source => source.get()));
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    const items = this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind);

    return items as T[];
  }
}

export const catalogEntityRegistry = new CatalogEntityRegistry();
