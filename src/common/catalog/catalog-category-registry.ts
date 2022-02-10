/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { once } from "lodash";
import { action, computed, makeObservable, observable } from "mobx";
import { CatalogCategory, CatalogEntityData, CatalogEntityKindData } from "./catalog-entity";
import { ExtendedMap, iter, type Disposer } from "../utils";

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

  @computed get filteredItems() {
    return Array.from(
      iter.reduce(
        this.filters,
        iter.filter,
        this.items.values(),
      ),
    );
  }


  getForGroupKind<T extends CatalogCategory>(group: string, kind: string): T | undefined {
    return this.groupKinds.get(group)?.get(kind) as T;
  }

  getEntityForData(data: CatalogEntityData & CatalogEntityKindData) {
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
  }

  getCategoryForEntity<T extends CatalogCategory>(data: CatalogEntityData & CatalogEntityKindData): T | undefined {
    const splitApiVersion = data.apiVersion.split("/");
    const group = splitApiVersion[0];

    return this.getForGroupKind(group, data.kind);
  }

  getByName(name: string) {
    return this.items.find(category => category.metadata?.name == name);
  }

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

export const catalogCategoryRegistry = new CatalogCategoryRegistry();
