/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, IComputedValue, IObservableArray, makeObservable, observable } from "mobx";
import { CatalogCategoryRegistry, catalogCategoryRegistry, CatalogEntity, CatalogEntityConstructor, CatalogEntityKindData } from "../../common/catalog";
import { iter } from "../../common/utils";

export class CatalogEntityRegistry {
  protected sources = observable.map<string, IComputedValue<CatalogEntity[]>>();

  constructor(private categoryRegistry: CatalogCategoryRegistry) {
    makeObservable(this);
  }

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
    return Array.from(
      iter.filter(
        iter.flatMap(this.sources.values(), source => source.get()),
        entity => this.categoryRegistry.getCategoryForEntity(entity),
      ),
    );
  }

  getById<T extends CatalogEntity>(id: string): T | undefined {
    return this.items.find((entity) => entity.metadata.uid === id) as T | undefined;
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    return this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind) as T[];
  }

  getItemsByEntityClass<T extends CatalogEntity>({ apiVersion, kind }: CatalogEntityKindData & CatalogEntityConstructor<T>): T[] {
    return this.getItemsForApiKind(apiVersion, kind);
  }
}

export const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);
