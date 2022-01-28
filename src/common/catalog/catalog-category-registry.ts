/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, observable, makeObservable } from "mobx";
import { Disposer, ExtendedMap, iter } from "../utils";
import { CatalogCategory, CatalogEntity, CatalogEntityData, CatalogEntityKindData } from "./catalog-entity";
import { once } from "lodash";

export type CategoryFilter = (category: CatalogCategory) => any;

export class CatalogCategoryRegistry {
  protected categories = observable.set<CatalogCategory>();
  protected groupKinds = new ExtendedMap<string, ExtendedMap<string, CatalogCategory>>();
  protected filters = observable.set<CategoryFilter>([], {
    deep: false,
  });

  constructor() {
    makeObservable(this);
  }

  @action add(category: CatalogCategory): Disposer {
    this.categories.add(category);
    this.groupKinds
      .getOrInsert(category.spec.group, ExtendedMap.new)
      .strictSet(category.spec.names.kind, category);

    return () => {
      this.categories.delete(category);
      this.groupKinds.get(category.spec.group).delete(category.spec.names.kind);
    };
  }

  @computed get items() {
    return Array.from(this.categories);
  }

  readonly filteredItems = computed(() => Array.from(
    iter.reduce(
      this.filters,
      iter.filter,
      this.categories.values(),
    ),
  ));

  getForGroupKind(group: string, kind: string): CatalogCategory | undefined {
    return this.groupKinds.get(group)?.get(kind);
  }

  getEntityForData = (data: CatalogEntityData & CatalogEntityKindData): CatalogEntity | null => {
    const category = this.getCategoryForEntity(data);

    if (!category) {
      return null;
    }

    const splitApiVersion = data.apiVersion.split("/");
    const version = splitApiVersion[1];

    const specVersion = category.spec.versions.find((v) => v.name === version);

    if (!specVersion) {
      return null;
    }

    return new specVersion.entityClass(data);
  };

  getCategoryForEntity = <T extends CatalogCategory>({ kind, apiVersion }: CatalogEntityData & CatalogEntityKindData): T => {
    const group = apiVersion.split("/")[0];
    const category = this.getForGroupKind(group, kind);

    if (!category) {
      // Throw here because it is very important that this is always true
      throw new Error(`Unable to find a category for group=${group} kind=${kind}`);
    }

    return category as T;
  };

  getByName = (name: string) => {
    return this.items.find(category => category.metadata?.name == name);
  };

  /**
   * Add a new filter to the set of category filters
   * @param fn The function that should return a truthy value if that category should be displayed
   * @returns A function to remove that filter
   */
  addCatalogCategoryFilter(fn: CategoryFilter): Disposer {
    this.filters.add(fn);

    return once(() => void this.filters.delete(fn));
  }
}
