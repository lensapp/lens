/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, type IComputedValue, type IObservableArray, makeObservable, observable } from "mobx";
import type { CatalogEntity } from "../../common/catalog";
import type { HasCategoryForEntity } from "../../common/catalog/has-category-for-entity.injectable";
import { iter } from "../../common/utils";

interface Dependencies {
  readonly hasCategoryForEntity: HasCategoryForEntity;
}

export class CatalogEntityRegistry {
  protected sources = observable.map<string, IComputedValue<CatalogEntity[]>>();

  constructor(protected readonly dependencies: Dependencies) {
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
        entity => this.dependencies.hasCategoryForEntity(entity),
      ),
    );
  }

  findById(id: string): CatalogEntity | undefined {
    return this.items.find(entity => entity.getId() === id);
  }

  filterItemsForApiKind(apiVersion: string, kind: string): CatalogEntity[] {
    return this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind);
  }

  filterItemsByPredicate<E extends CatalogEntity>(filter: (item: CatalogEntity) => item is E): E[] {
    return this.items.filter(filter);
  }
}
