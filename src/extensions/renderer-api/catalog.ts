/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import type { CatalogCategory, CatalogEntity } from "../../common/catalog";
import { catalogEntityRegistry as registry } from "../../renderer/api/catalog-entity-registry";
import type { CatalogEntityOnBeforeRun } from "../../renderer/api/catalog-entity-registry";
import type { Disposer } from "../../common/utils";

export type {
  EntityFilter,
  CatalogEntityOnBeforeRun,
} from "../../renderer/api/catalog-entity-registry";

export type { CatalogCategoryRegistry } from "../../common/catalog/catalog-category-registry";
export { catalogCategoryRegistry as catalogCategories } from "../../common/catalog/catalog-category-registry";

/**
 * The registry for entities synced to renderer
 */
class CatalogEntityRegistry {
  /**
   * Currently active/visible entity
   */
  get activeEntity() {
    return registry.activeEntity;
  }

  /**
   * The mapping of all entities from ID to instance
   */
  get entities(): Map<string, CatalogEntity> {
    return registry.entities;
  }

  /**
   * Attempt to get a catalog entity by its ID.
   * @param id The ID of the desired entity
   */
  getById(id: string): CatalogEntity | undefined {
    return this.entities.get(id);
  }

  /**
   * Get all the entities of a specific version and kind
   * @param apiVersion The version string of an entity
   * @param kind The kind of the entity
   * @returns A list of entities matching that `apiVersion` and `kind`
   */
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    return registry.getItemsForApiKind<T>(apiVersion, kind);
  }

  /**
   * Get all the entities for the kinds declared by a specific category
   * @param category The category that declares different apiVersions for a specific kind
   * @returns A list of entities matching the deckared `apiVersion`'s and `kind`
   */
  getItemsForCategory<T extends CatalogEntity>(category: CatalogCategory): T[] {
    return registry.getItemsForCategory(category);
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
    return registry.addOnBeforeRun(onBeforeRun);
  }
}

export type { CatalogEntityRegistry };

export const catalogEntities = new CatalogEntityRegistry();
