/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cleans up a store that had the state related data stored
import type { MigrationDeclaration } from "../helpers";
import { getEmptyHotbar } from "../../common/hotbars/types";
import { getLegacyGlobalDiForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import catalogCatalogEntityInjectable from "../../common/catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";

export default {
  version: "5.0.0-alpha.0",
  run(store) {
    const hotbar = getEmptyHotbar("default");
    const di = getLegacyGlobalDiForExtensionApi();
    const catalogCatalogEntity = di.inject(catalogCatalogEntityInjectable);

    const { metadata: { uid, name, source }} = catalogCatalogEntity;

    hotbar.items[0] = { entity: { uid, name, source }};

    store.set("hotbars", [hotbar]);
  },
} as MigrationDeclaration;
