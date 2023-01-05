/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cleans up a store that had the state related data stored
import { getEmptyHotbar } from "../../../common/hotbars/types";
import catalogCatalogEntityInjectable from "../../../common/catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationInjectionToken } from "../../../common/hotbars/migrations-token";

const v500Alpha0HotbarStoreMigrationInjectable = getInjectable({
  id: "v5.0.0-alpha.0-hotbar-store-migration",
  instantiate: (di) => {
    const catalogCatalogEntity = di.inject(catalogCatalogEntityInjectable);

    return {
      version: "5.0.0-alpha.0",
      run(store) {
        const hotbar = getEmptyHotbar("default");

        const { metadata: { uid, name, source }} = catalogCatalogEntity;

        hotbar.items[0] = { entity: { uid, name, source }};

        store.set("hotbars", [hotbar]);
      },
    };
  },
  injectionToken: hotbarStoreMigrationInjectionToken,
});

export default v500Alpha0HotbarStoreMigrationInjectable;

