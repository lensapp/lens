/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import type { CatalogEntity } from "../../../../common/catalog";
import type { CatalogEntityDetailItemComponentProps } from "./extension-registration";

export interface CatalogEntityDetailItem<T extends CatalogEntity> {
  apiVersions: string[];
  kind: string;

  components: {
    Details: React.ComponentType<CatalogEntityDetailItemComponentProps<T>>;
  };

  orderNumber: number;

  extension?: LensRendererExtension;
}

export const catalogEntityDetailItemInjectionToken = getInjectionToken<CatalogEntityDetailItem<CatalogEntity>>({
  id: "catalog-entity-detail-item",
});
