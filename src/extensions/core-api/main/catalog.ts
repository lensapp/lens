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


import { CatalogEntityRegistry as InternalCatalogEntityRegistry, CatalogCategoryRegistry as InternalCatalogCategoryRegistry, CatalogEntity, CatalogCategoryRegistration, SpecEnhancer } from "../../../main/catalog";

export type {
  CatalogEntity,
} from "../../../main/catalog";

export class CatalogEntityRegistry {
  static get items() {
    return InternalCatalogEntityRegistry.getInstance().items;
  }
}

export class CatalogCategoryRegistry {
  static add(category: CatalogCategoryRegistration) {
    return InternalCatalogCategoryRegistry.getInstance().add(category);
  }

  static get items() {
    return InternalCatalogCategoryRegistry.getInstance().items;
  }

  static getForGroupKind(group: string, version: string, kind: string) {
    return InternalCatalogCategoryRegistry.getInstance().getForGroupKind(group, version, kind);
  }

  static hasForGroupKind(group: string, version: string, kind: string) {
    return InternalCatalogCategoryRegistry.getInstance().hasForGroupKind(group, version, kind);
  }

  static getCategoryForEntity(data: CatalogEntity) {
    return InternalCatalogCategoryRegistry.getInstance().getCategoryForEntity(data);
  }

  static registerSpecEnhancer(apiVersion: string, kind: string, handler: SpecEnhancer) {
    return InternalCatalogCategoryRegistry.getInstance().registerSpecEnhancer(apiVersion, kind, handler);
  }
}
