/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import catalogEntityDetailItemsInjectable from "./catalog-entity-detail-items/catalog-entity-detail-items.injectable";

// TODO: Extract "default" entity detail items from components to same level than other items are
const showDefaultCatalogEntityDetailItemsInjectable = getInjectable({
  id: "show-default-catalog-entity-detail-items",

  instantiate: (di, catalogEntity: CatalogEntity) => {
    const catalogEntityDetailItems = di.inject(
      catalogEntityDetailItemsInjectable,
      catalogEntity,
    );

    return computed(() =>
      !catalogEntityDetailItems.get().find((item) => item.orderNumber < -999),
    );
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, catalogEntity: CatalogEntity) =>
      `${catalogEntity.kind}/${catalogEntity.apiVersion}`,
  }),
});

export default showDefaultCatalogEntityDetailItemsInjectable;
