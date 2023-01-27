/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntityMetadata, CatalogEntitySpec, CatalogEntityStatus } from "../catalog";
import type { CatalogEntityActionContext } from "../catalog/catalog-entity";
import { CatalogCategory, CatalogEntity, categoryVersion } from "../catalog/catalog-entity";

export interface GeneralEntitySpec extends CatalogEntitySpec {
  path: string;
  icon?: {
    material?: string;
    background?: string;
  };
}

export class GeneralEntity extends CatalogEntity<CatalogEntityMetadata, CatalogEntityStatus, GeneralEntitySpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "General";

  async onRun(context: CatalogEntityActionContext) {
    context.navigate(this.spec.path);
  }
}

export class GeneralCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "General",
    icon: "settings",
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      categoryVersion("v1alpha1", GeneralEntity),
    ],
    names: {
      kind: "General",
    },
  };
}
