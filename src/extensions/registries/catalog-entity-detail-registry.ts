/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import type { Disposer } from "../../common/utils";
import type { CatalogEntity } from "../common-api/catalog";
import { BaseRegistry } from "./base-registry";

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

export class CatalogEntityDetailRegistry extends BaseRegistry<CatalogEntityDetailRegistration<CatalogEntity>> {
  add<T extends CatalogEntity>(items: CatalogEntityDetailRegistration<T> | CatalogEntityDetailRegistration<T>[]): Disposer {
    return super.add(items as never);
  }

  getItemsForKind(kind: string, apiVersion: string) {
    const items = this.getItems().filter((item) => {
      return item.kind === kind && item.apiVersions.includes(apiVersion);
    });

    return items.sort((a, b) => (b.priority ?? 50) - (a.priority ?? 50));
  }
}
