/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cleans up a store that had the state related data stored
import catalogCatalogEntityInjectable from "../../../../common/catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationInjectionToken } from "../common/migrations-token";
import createHotbarInjectable from "../common/create-hotbar.injectable";

const v500Alpha0HotbarStoreMigrationInjectable = getInjectable({
  id: "v5.0.0-alpha.0-hotbar-store-migration",
  instantiate: (di) => ({
    version: "5.0.0-alpha.0",
    run(store) {
      const catalogCatalogEntity = di.inject(catalogCatalogEntityInjectable);
      const createHotbar = di.inject(createHotbarInjectable);
      const hotbar = createHotbar({ name: "default" });

      hotbar.addEntity(catalogCatalogEntity);

      store.set("hotbars", [hotbar.toJSON()]);
    },
  }),
  injectionToken: hotbarStoreMigrationInjectionToken,
});

export default v500Alpha0HotbarStoreMigrationInjectable;

