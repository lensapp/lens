/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { CatalogEntity } from "../../../api/catalog-entity";

export interface CatalogEntityDetailsProps<T extends CatalogEntity> {
  entity: T;
}

export type CatalogEntityDetailsComponent<T  extends CatalogEntity> = React.ComponentType<CatalogEntityDetailsProps<T>>;

export interface CatalogEntityDetailComponents<T extends CatalogEntity> {
  Details: CatalogEntityDetailsComponent<T>;
}

export interface CatalogEntityDetailRegistration<T extends CatalogEntity> {
  kind: string;
  apiVersions: string[];
  components: CatalogEntityDetailComponents<T>;
  priority?: number;
}

export interface CatalogEntityDetailItem {
  kind: string;
  apiVersions: Set<string>;
  components: CatalogEntityDetailComponents<CatalogEntity>;
  orderNumber: number;
}

export const catalogEntityDetailItemInjectionToken = getInjectionToken<CatalogEntityDetailItem>({
  id: "catalog-entity-detail-item-token",
});
