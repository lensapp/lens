/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { HotbarStore } from "./hotbar-store";
import catalogCatalogEntityInjectable from "./catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";

const hotbarStoreInjectable = getInjectable({
  id: "hotbar-store",

  instantiate: (di) => HotbarStore.createInstance({
    catalogCatalogEntity: di.inject(catalogCatalogEntityInjectable),
  }),

  causesSideEffects: true,
});

export default hotbarStoreInjectable;
