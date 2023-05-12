/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";
import { byOrderNumber } from "@k8slens/utilities";
import type { CatalogEntity } from "../../../api/catalog-entity";
import { catalogEntityDetailItemInjectionToken } from "./token";

const catalogEntityDetailItemsInjectable = getInjectable({
  id: "catalog-entity-detail-items",
  instantiate: (di, entity) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const detailItems = computedInjectMany(catalogEntityDetailItemInjectionToken);

    return computed(() => (
      detailItems.get()
        .filter(item => (
          item.apiVersions.has(entity.apiVersion)
          && item.kind === entity.kind
        ))
        .sort(byOrderNumber)
        .map(item => item.components.Details)
    ));
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, entity: CatalogEntity) => `${entity.apiVersion}/${entity.kind}`,
  }),
});

export default catalogEntityDetailItemsInjectable;
