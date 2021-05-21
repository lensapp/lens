/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { action, computed, observable } from "mobx";
import { Disposer, ExtendedMap } from "../utils";
import { CatalogCategory, CatalogEntityData, CatalogEntityKindData } from "./catalog-entity";

export class CatalogCategoryRegistry {
  protected categories = observable.set<CatalogCategory>();
  protected groupKinds = new ExtendedMap<string, ExtendedMap<string, CatalogCategory>>();

  @action add(category: CatalogCategory): Disposer {
    this.categories.add(category);
    this.updateGroupKinds(category);

    return () => {
      this.categories.delete(category);
      this.groupKinds.clear();
    };
  }

  private updateGroupKinds(category: CatalogCategory) {
    this.groupKinds
      .getOrInsert(category.spec.group, ExtendedMap.new)
      .strictSet(category.spec.names.kind, category);
  }

  @computed get items() {
    return Array.from(this.categories);
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
}

export const catalogCategoryRegistry = new CatalogCategoryRegistry();
