/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogEntity } from "../../api/catalog-entity";
import catalogEntitySettingItemsInjectable from "./settings.injectable";

export type HasCatalogEntitySettingItems = (entity: CatalogEntity) => boolean;

const hasCatalogEntitySettingItemsInjectable = getInjectable({
  id: "has-catalog-entity-setting-items",
  instantiate: (di): HasCatalogEntitySettingItems => (entity) => {
    const items = di.inject(catalogEntitySettingItemsInjectable, entity);

    return items.get().length > 0;
  },
});

export default hasCatalogEntitySettingItemsInjectable;
