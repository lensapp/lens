/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogCategory, CatalogEntity, CatalogEntityData, CatalogEntityKindData, CategoryFilter, CatalogCategoryRegistry as InternalCatalogCategoryRegistry } from "../../common/catalog";
import type { CatalogEntityRegistry as InternalCatalogEntityRegistry } from "../../main/catalog";
import catalogCategoryRegistryInjectable from "../../main/catalog/category-registry.injectable";
import catalogEntityRegistryInjectable from "../../main/catalog/entity-registry.injectable";
import type { Disposer } from "../../renderer/utils";
import { asLegacyGlobalObjectForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";


interface CatalogEntityRegistryDependencies {
  readonly internalRegistry: InternalCatalogEntityRegistry;
}

export type { CatalogEntityRegistry };

class CatalogEntityRegistry {
  /**
   * @internal
   */
  constructor(protected readonly dependencies: CatalogEntityRegistryDependencies) {}

  /**
   * @deprecated use cast instead of unused generic type argument
   */
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[];
  getItemsForApiKind(apiVersion: string, kind: string): CatalogEntity[] {
    return this.dependencies.internalRegistry.getItemsForApiKind(apiVersion, kind);
  }
}

interface CatalogCategoryRegistryDependencies {
  readonly internalRegistry: InternalCatalogCategoryRegistry;
}

export type { CatalogCategoryRegistry };


class CatalogCategoryRegistry {
  constructor(protected readonly dependencies: CatalogCategoryRegistryDependencies) {}

  add(category: CatalogCategory): Disposer {
    return this.dependencies.internalRegistry.add(category);
  }

  get items() {
    return this.dependencies.internalRegistry.items;
  }

  get filteredItems() {
    return this.dependencies.internalRegistry.filteredItems.get();
  }

  /**
   * @deprecated use cast instead of unused generic type argument
   */
  getForGroupKind<T extends CatalogCategory>(group: string, kind: string): T | undefined;
  getForGroupKind(group: string, kind: string): CatalogCategory | undefined {
    return this.dependencies.internalRegistry.getForGroupKind(group, kind);
  }

  getEntityForData(data: CatalogEntityData & CatalogEntityKindData): CatalogEntity | null {
    return this.dependencies.internalRegistry.getEntityForData(data);
  }

  /**
   * @deprecated use cast instead of unused generic type argument
   */
  getCategoryForEntity<T extends CatalogCategory>({ kind, apiVersion }: CatalogEntityData & CatalogEntityKindData): T;
  /**
   * @throws if category is not found
   */
  getCategoryForEntity(entity: CatalogEntityData & CatalogEntityKindData): CatalogCategory {
    return this.dependencies.internalRegistry.getCategoryForEntity(entity);
  }

  getByName(name: string): CatalogCategory | undefined {
    return this.dependencies.internalRegistry.getByName(name);
  }

  /**
   * Add a new filter to the set of category filters
   * @param fn The function that should return a truthy value if that category should be displayed
   * @returns A function to remove that filter
   */
  addCatalogCategoryFilter(fn: CategoryFilter): Disposer {
    return this.dependencies.internalRegistry.addCatalogCategoryFilter(fn);
  }
}

export const catalogEntities = new CatalogEntityRegistry({
  internalRegistry: asLegacyGlobalObjectForExtensionApi(catalogEntityRegistryInjectable),
});

export const catalogCategories = new CatalogCategoryRegistry({
  internalRegistry: asLegacyGlobalObjectForExtensionApi(catalogCategoryRegistryInjectable),
});

