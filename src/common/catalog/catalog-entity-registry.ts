import { action, computed, IComputedValue, IObservableArray, makeObservable, observable } from "mobx";
import { CatalogEntity } from "./catalog-entity";

export class CatalogEntityRegistry {
  protected sources = observable.map<string, IComputedValue<CatalogEntity[]>>();

  constructor() {
    makeObservable(this);
  }

  @action
  addObservableSource(id: string, source: IObservableArray<CatalogEntity> | IComputedValue<CatalogEntity[]>) {
    if (Array.isArray(source)) {
      this.sources.set(id, computed(() => source.toJSON()));
    } else {
      this.sources.set(id, source);
    }
  }

  @action removeSource(id: string) {
    this.sources.delete(id);
  }

  @computed get items(): CatalogEntity[] {
    return Array.from(this.sources.values())
      .map(source => source.get())
      .flat();
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    const items = this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind);

    return items as T[];
  }
}

export const catalogEntityRegistry = new CatalogEntityRegistry();
