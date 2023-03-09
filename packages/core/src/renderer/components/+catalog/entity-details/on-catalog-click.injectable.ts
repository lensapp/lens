/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { CatalogEntity } from "../../../api/catalog-entity";
import catalogEntityRegistryInjectable from "../../../api/catalog/entity/registry.injectable";
import selectedCatalogEntityParamInjectable from "./selected-uid.injectable";

export type OnCatalogEntityListClick = (entity: CatalogEntity) => void;

const onCatalogEntityListClickInjectable = getInjectable({
  id: "on-catalog-entity-list-click",
  instantiate: (di): OnCatalogEntityListClick => {
    const selectedCatalogEntityParam = di.inject(selectedCatalogEntityParamInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return action(entity => {
      if (selectedCatalogEntityParam.get() === entity.getId()) {
        selectedCatalogEntityParam.clear();
      } else if (selectedCatalogEntityParam.get() === undefined) {
        catalogEntityRegistry.onRun(entity);
      } else {
        selectedCatalogEntityParam.set(entity.getId());
      }
    });
  },
});

export default onCatalogEntityListClickInjectable;
