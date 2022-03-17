/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntity } from "../../common/catalog";
import { catalogEntityRegistry as registry } from "../../main/catalog";

export { catalogCategoryRegistry as catalogCategories } from "../../common/catalog/catalog-category-registry";

export interface CatalogEntityRegistry {
  getItemsForApiKind(apiVersion: string, kind: string): CatalogEntity[];
  /**
   * @deprecated use a cast instead of a unbounded type parameter
   */
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[];
}

export const catalogEntities: CatalogEntityRegistry = {
  getItemsForApiKind(apiVersion: string, kind: string) {
    return registry.filterItemsForApiKind(apiVersion, kind);
  },
};
