/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntity } from "../../common/catalog";
import { Environments, getEnvironmentSpecificLegacyGlobalDiForExtensionApi } from "../as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import catalogEntityRegistryInjectable from "../../main/catalog/catalog-entity-registry.injectable";

export { catalogCategoryRegistry as catalogCategories } from "../../common/catalog/catalog-category-registry";

export class CatalogEntityRegistry {
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    const di = getEnvironmentSpecificLegacyGlobalDiForExtensionApi(Environments.main);

    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return catalogEntityRegistry.getItemsForApiKind<T>(apiVersion, kind);
  }
}

export const catalogEntities = new CatalogEntityRegistry();
