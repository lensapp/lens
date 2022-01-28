/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import type { CatalogEntity } from "../../extensions/common-api/catalog";

export interface CatalogEntityDetailsProps<T extends CatalogEntity> {
  entity: T;
}

export interface CatalogEntityDetailComponents<T extends CatalogEntity> {
  Details: React.ComponentType<CatalogEntityDetailsProps<T>>;
}

export interface CatalogEntityDetailRegistration<T extends CatalogEntity> {
  kind: string;
  apiVersions: string[];
  components: CatalogEntityDetailComponents<T>;
  priority?: number;
}
