/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, type IComputedValue, type IObservableArray, makeObservable, observable } from "mobx";
import type { CatalogEntity } from "../../common/catalog";
import type { HasCategoryForEntity } from "../../common/catalog/has-category-for-entity.injectable";
import { filter, flatMap } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";

import {
  getLegacyGlobalDiForExtensionApi,
} from "../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";

import catalogEntitiesInjectable from "./catalog-entities-from-features/catalog-entities.injectable";

interface Dependencies {
  readonly hasCategoryForEntity: HasCategoryForEntity;
  readonly decoupledCatalogEntities: IComputedValue<CatalogEntity[]>;
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
    const di = getLegacyGlobalDiForExtensionApi();

    const catalogEntities = di.inject(catalogEntitiesInjectable);

    const sources = [...this.sources.values()];

    return pipeline(
      sources,
      flatMap(source => source.get()),
      x => [...x, ...catalogEntities.get()],
      filter(entity => this.dependencies.hasCategoryForEntity(entity)),
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
