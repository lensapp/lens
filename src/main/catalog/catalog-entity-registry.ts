/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { once } from "lodash";
import { action, computed, IComputedValue, IObservableArray, observable } from "mobx";
import type { CatalogCategory, CatalogEntity, CatalogEntityConstructor } from "../../common/catalog";
import { Disposer, iter } from "../../common/utils";

export interface CatalogEntityRegistryDependencies {
  readonly getCategoryForEntity: (entity: CatalogEntity) => CatalogCategory;
  readonly extensionSourcedEntities: IComputedValue<CatalogEntity[]>;
}

export class CatalogEntityRegistry {
  protected localSources = observable.set<IComputedValue<CatalogEntity[]>>();

  constructor(protected readonly dependencies: CatalogEntityRegistryDependencies) {
  }

  addObservableSource = action((source: IObservableArray<CatalogEntity>): Disposer => {
    return this.addComputedSource(computed(() => [...source]));
  });

  addComputedSource = action((source: IComputedValue<CatalogEntity[]>) => {
    this.localSources.add(source);

    return once(() => this.localSources.delete(source));
  });

  private get combinedItems(): CatalogEntity[] {
    return [
      ...iter.flatMap(this.localSources.values(), source => source.get()),
      ...this.dependencies.extensionSourcedEntities.get(),
    ];
  }

  #items = computed(() => this.combinedItems.filter(entity => this.dependencies.getCategoryForEntity(entity)));

  get items(): CatalogEntity[] {
    return this.#items.get();
  }

  getById(id: string): CatalogEntity | undefined {
    return this.items.find((entity) => entity.metadata.uid === id) as CatalogEntity | undefined;
  }

  getItemsForApiKind(apiVersion: string, kind: string): CatalogEntity[] {
    return this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind) as CatalogEntity[];
  }

  getItemsByEntityClass<T extends CatalogEntity>(constructor: CatalogEntityConstructor<T>): T[] {
    return this.items.filter((item) => item instanceof constructor) as T[];
  }
}
