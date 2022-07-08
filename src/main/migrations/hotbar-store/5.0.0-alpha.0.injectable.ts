/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getEmptyHotbar } from "../../../common/hotbars/types";
import catalogGeneralEntityInjectable from "../../../common/catalog-entities/general-catalog-entities/implementations/catalog-entity.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreMigrationDeclarationInjectionToken } from "./migration";

const hotbarStoreV500Alpha0MigrationInjectable = getInjectable({
  id: "hotbar-store-v5.0.0-alpha.0-migration",
  instantiate: (di) => {
    const catalogGeneralEntity = di.inject(catalogGeneralEntityInjectable);

    return {
      version: "5.0.0-alpha.0",
      run(store) {
        const hotbar = getEmptyHotbar("default");
        const { metadata: { uid, name, source }} = catalogGeneralEntity;

        hotbar.items[0] = { entity: { uid, name, source }};

        store.set("hotbars", [hotbar]);
      },
    };
  },
  injectionToken: hotbarStoreMigrationDeclarationInjectionToken,
});

export default hotbarStoreV500Alpha0MigrationInjectable;

