/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import type { CatalogCategory, CatalogEntity } from "../../common/catalog";
import type { CatalogEntityOnBeforeRun } from "../../renderer/api/catalog/entity/registry";
import type { Disposer } from "../../common/utils";
import catalogCategoryRegistryInjectable from "../../common/catalog/category-registry.injectable";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import catalogEntityRegistryInjectable from "../../renderer/api/catalog/entity/registry.injectable";

export const catalogCategories = asLegacyGlobalForExtensionApi(catalogCategoryRegistryInjectable);

const internalEntityRegistry = asLegacyGlobalForExtensionApi(catalogEntityRegistryInjectable);

export class CatalogEntityRegistry {
  /**
   * Currently active/visible entity
   */
  get activeEntity() {
    return internalEntityRegistry.activeEntity;
  }

  get entities(): Map<string, CatalogEntity> {
    return internalEntityRegistry.entities;
  }

  getById(id: string) {
    return this.entities.get(id);
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    return internalEntityRegistry.getItemsForApiKind<T>(apiVersion, kind);
  }

  getItemsForCategory<T extends CatalogEntity>(category: CatalogCategory): T[] {
    return internalEntityRegistry.getItemsForCategory(category);
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
    return internalEntityRegistry.addOnBeforeRun(onBeforeRun);
  }
}

export const catalogEntities = new CatalogEntityRegistry();
