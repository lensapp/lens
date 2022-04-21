/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntity } from "../../common/catalog";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import catalogCategoryRegistryInjectable from "../../common/catalog/category-registry.injectable";
import catalogEntityRegistryInjectable from "../../main/catalog/entity-registry.injectable";

export const catalogCategories = asLegacyGlobalForExtensionApi(catalogCategoryRegistryInjectable);
const catalogEntityRegistry = asLegacyGlobalForExtensionApi(catalogEntityRegistryInjectable);

export interface CatalogEntityRegistry {
  getItemsForApiKind(apiVersion: string, kind: string): CatalogEntity[];
  /**
   * @deprecated use a cast instead of a unbounded type parameter
   */
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[];
}

export const catalogEntities: CatalogEntityRegistry = {
  getItemsForApiKind(apiVersion: string, kind: string) {
    return catalogEntityRegistry.filterItemsForApiKind(apiVersion, kind);
  },
};
