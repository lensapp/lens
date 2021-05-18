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

import { action, computed, observable, toJS } from "mobx";
import { CatalogCategory, CatalogEntityData, CatalogEntityKindData } from "./catalog-entity";

export class CatalogCategoryRegistry {
  @observable protected categories: CatalogCategory[] = [];

  @action add(category: CatalogCategory) {
    this.categories.push(category);
  }

  @action remove(category: CatalogCategory) {
    this.categories = this.categories.filter((cat) => cat.apiVersion !== category.apiVersion && cat.kind !== category.kind);
  }

  @computed get items() {
    return toJS(this.categories);
  }

  getForGroupKind<T extends CatalogCategory>(group: string, kind: string) {
    return this.categories.find((c) => c.spec.group === group && c.spec.names.kind === kind) as T;
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

  getCategoryForEntity<T extends CatalogCategory>(data: CatalogEntityData & CatalogEntityKindData) {
    const splitApiVersion = data.apiVersion.split("/");
    const group = splitApiVersion[0];

    const category = this.categories.find((category) => {
      return category.spec.group === group && category.spec.names.kind === data.kind;
    });

    if (!category) return null;

    return category as T;
  }
}

export const catalogCategoryRegistry = new CatalogCategoryRegistry();
