/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import type { CatalogEntityDetailComponents } from "../../catalog/catalog-entity-details";
import { bind } from "../../utils";
import entityDetailItemsInjectable from "./entity-detail-items.injectable";

interface Dependencies {
  entityDetailsMap: IComputedValue<Map<string, Map<string, CatalogEntityDetailComponents<CatalogEntity>[]>>>;
}

function getDetailItemsForEntity({ entityDetailsMap }: Dependencies, entity: CatalogEntity) {
  return entityDetailsMap.get()
    .get(entity.kind)
    ?.get(entity.apiVersion)
    ?? [];
}

const getDetailItemsForEntityInjectable = getInjectable({
  instantiate: (di) => bind(getDetailItemsForEntity, null, {
    entityDetailsMap: di.inject(entityDetailItemsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getDetailItemsForEntityInjectable;
