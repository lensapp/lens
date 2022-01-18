/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntity } from "../../common/catalog";
import { catalogEntityRegistry as registry } from "../../main/catalog";

export { catalogCategoryRegistry as catalogCategories } from "../../common/catalog/catalog-category-registry";

export class CatalogEntityRegistry {
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    return registry.getItemsForApiKind<T>(apiVersion, kind);
  }
}

export const catalogEntities = new CatalogEntityRegistry();
