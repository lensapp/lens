/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalObjectForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import type { CatalogCategory, CatalogEntity, CatalogCategoryRegistry as InternalCatalogCategoryRegistry, CatalogEntityData, CatalogEntityKindData, CategoryFilter } from "../../common/catalog";
import type { CatalogEntityRegistry as InternalCatalogEntityRegistry, CatalogEntityOnBeforeRun } from "../../renderer/catalog/entity-registry";
import type { Disposer } from "../../common/utils";
import catalogEntityRegistryInjectable from "../../renderer/catalog/entity-registry.injectable";
import catalogCategoryRegistryInjectable from "../../renderer/catalog/category-registry.injectable";

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
   * Currently active/visible entity
   */
  get activeEntity() {
    return this.dependencies.internalRegistry.activeEntity;
  }

  get entities(): Map<string, CatalogEntity> {
    return this.dependencies.internalRegistry.entities;
  }

  getById(id: string) {
    return this.entities.get(id);
  }

  /**
   * @deprecated use cast and not the unused generic type param
   */
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[];
  getItemsForApiKind(apiVersion: string, kind: string): CatalogEntity[] {
    return this.dependencies.internalRegistry.getItemsForApiKind(apiVersion, kind);
  }

  /**
   * @deprecated use cast and not the unused generic type param
   */
  getItemsForCategory<T extends CatalogEntity>(category: CatalogCategory): T[];
  getItemsForCategory(category: CatalogCategory): CatalogEntity[] {
    return this.dependencies.internalRegistry.getItemsForCategory(category);
  }

  /**
   * Add a onBeforeRun hook to a catalog entities. If `onBeforeRun` was previously
   * added then it will not be added again.
   * @param onBeforeRun The function to be called with a `CatalogRunEvent`
   * event target will be the catalog entity. onBeforeRun hook can call event.preventDefault()
   * to stop run sequence
   * @returns A function to remove that hook
   */
  addOnBeforeRun(onBeforeRun: CatalogEntityOnBeforeRun): Disposer {
    return this.dependencies.internalRegistry.addOnBeforeRun(onBeforeRun);
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
