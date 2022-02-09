/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { CatalogEntityStore } from "./catalog-entity.store";
import catalogEntityRegistryInjectable from "../../../api/catalog-entity-registry/catalog-entity-registry.injectable";

const catalogEntityStoreInjectable = getInjectable({
  id: "catalog-entity-store",

  instantiate: (di) => new CatalogEntityStore({
    registry: di.inject(catalogEntityRegistryInjectable),
  }),
});

export default catalogEntityStoreInjectable;
