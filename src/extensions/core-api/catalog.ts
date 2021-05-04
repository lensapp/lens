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
import {
  CatalogCategorySpec,
  CatalogEntity,
  CatalogEntityData,
  CatalogEntityKindData,
  CatalogEntityRegistry as InternalCatalogEntityRegistry,
  MatchingCatalogEntityData,
} from "../../common/catalog";
import {
  CatalogCategoryRegistry as InternalCatalogCategoryRegistry,
  CatalogHandler,
  CategoryHandlerNames,
  CategoryHandlers,
  EntityContextHandlers,
  GlobalContextHandlers,
} from "../../common/catalog/catalog-category-registry";
import { Disposer } from "../../common/utils";

export * from "../../common/catalog-entities";

export class CatalogEntityRegistry {
  static getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    return InternalCatalogEntityRegistry.getInstance().getItemsForApiKind<T>(apiVersion, kind);
  }
}

export class CatalogCategoryRegistry {
  /**
   * Registers a new category
   * @param category The category to register
   * @throws if the apiVersion and kind conflict with a previously registered category
   * @returns a disposer to remove the category
   */
  static add(category: CatalogCategorySpec): () => void {
    return InternalCatalogCategoryRegistry.getInstance().add(category);
  }

  static registerHandler(apiVersion: string, kind: string, handlerName: CategoryHandlerNames, handler: CatalogHandler<typeof handlerName>): Disposer {
    return InternalCatalogCategoryRegistry.getInstance().registerHandler(apiVersion, kind, handlerName, handler);
  }

  static runEntityHandlersFor(entity: CatalogEntity, handlerName: "onContextMenuOpen"): ReturnType<CategoryHandlers[typeof handlerName]>;
  static runEntityHandlersFor(entity: CatalogEntity, handlerName: "onSettingsOpen"): ReturnType<CategoryHandlers[typeof handlerName]>;
  static runEntityHandlersFor(entity: CatalogEntity, handlerName: EntityContextHandlers): ReturnType<CategoryHandlers[typeof handlerName]> {
    return InternalCatalogCategoryRegistry.getInstance().runEntityHandlersFor(entity, handlerName as any);
  }

  static runGlobalHandlersFor(categorySpec: CatalogCategorySpec, handlerName: "onAddMenuOpen"): ReturnType<CategoryHandlers[typeof handlerName]>;
  static runGlobalHandlersFor(categorySpec: CatalogCategorySpec, handlerName: GlobalContextHandlers): ReturnType<CategoryHandlers[typeof handlerName]> {
    return InternalCatalogCategoryRegistry.getInstance().runGlobalHandlersFor(categorySpec, handlerName as any);
  }

  static getEntityForData<Entity extends CatalogEntity>(data: MatchingCatalogEntityData<Entity> & CatalogEntityKindData): Entity {
    return InternalCatalogCategoryRegistry.getInstance().getEntityForData(data);
  }

  static getCategorySpecForEntity(data: CatalogEntityData & CatalogEntityKindData): CatalogCategorySpec {
    return InternalCatalogCategoryRegistry.getInstance().getCategoryForEntity(data);
  }
}
