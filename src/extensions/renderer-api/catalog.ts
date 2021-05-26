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

import * as internal from "../../renderer/catalog";

export type {
  CatalogEntity,
  CatalogCategoryRegistration,
} from "../../renderer/catalog";

export type {
  KubernetesCluster,
} from "../../renderer/catalog-entities";

export class CatalogEntityRegistry {
  static getItemsForApiKind<T extends internal.CatalogEntity>(apiVersion: string, kind: string): T[] {
    return internal.CatalogEntityRegistry.getInstance().getItemsForApiKind<T>(apiVersion, kind);
  }
}

export class CatalogCategoryRegistry {
  static add(category: internal.CatalogCategoryRegistration) {
    return internal.CatalogCategoryRegistry.getInstance().add(category);
  }

  static get items() {
    return internal.CatalogCategoryRegistry.getInstance().items;
  }

  static getForGroupKind(group: string, version: string, kind: string) {
    return internal.CatalogCategoryRegistry.getInstance().getForGroupKind(group, version, kind);
  }

  static hasForGroupKind(group: string, version: string, kind: string) {
    return internal.CatalogCategoryRegistry.getInstance().hasForGroupKind(group, version, kind);
  }

  static getCategoryForEntity(data: internal.CatalogEntity) {
    return internal.CatalogCategoryRegistry.getInstance().getCategoryForEntity(data);
  }

  static registerHandler(apiVersion: string, kind: string, handlerName: internal.CategoryHandlerNames, handler: internal.CatalogHandler<typeof handlerName>) {
    return internal.CatalogCategoryRegistry.getInstance().registerHandler(apiVersion, kind, handlerName, handler);
  }

  static runEntityHandlersFor(entity: internal.CatalogEntity, handlerName: "onContextMenuOpen"): ReturnType<internal.CategoryHandlers[typeof handlerName]>;
  static runEntityHandlersFor(entity: internal.CatalogEntity, handlerName: "onSettingsOpen"): ReturnType<internal.CategoryHandlers[typeof handlerName]>;
  static runEntityHandlersFor(entity: internal.CatalogEntity, handlerName: internal.EntityContextHandlers): ReturnType<internal.CategoryHandlers[typeof handlerName]> {
    return internal.CatalogCategoryRegistry.getInstance().runEntityHandlersFor(entity, handlerName as any);
  }

  static runGlobalHandlersFor(reg: internal.CatalogCategoryRegistration, handlerName: "onCatalogAddMenu"): ReturnType<internal.CategoryHandlers[typeof handlerName]>;
  static runGlobalHandlersFor(reg: internal.CatalogCategoryRegistration, handlerName: internal.GlobalContextHandlers): ReturnType<internal.CategoryHandlers[typeof handlerName]> {
    return internal.CatalogCategoryRegistry.getInstance().runGlobalHandlersFor(reg, handlerName as any);
  }
}
