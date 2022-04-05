/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { CatalogEntity } from "../../../../common/catalog";

export interface CatalogEntityDetailItemComponentProps<T extends CatalogEntity> {
  entity: T;
}

export interface CatalogEntityDetailComponents<T extends CatalogEntity> {
  Details: React.ComponentType<CatalogEntityDetailItemComponentProps<T>>;
}

export interface CatalogEntityDetailRegistration<T extends CatalogEntity> {
  kind: string;
  apiVersions: string[];
  components: CatalogEntityDetailComponents<T>;
  priority?: number;
}
