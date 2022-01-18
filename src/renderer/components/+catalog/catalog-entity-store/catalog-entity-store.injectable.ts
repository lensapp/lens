/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { CatalogEntityStore } from "./catalog-entity.store";
import catalogEntityRegistryInjectable from "../../../api/catalog-entity-registry/catalog-entity-registry.injectable";

const catalogEntityStoreInjectable = getInjectable({
  instantiate: (di) => new CatalogEntityStore({
    registry: di.inject(catalogEntityRegistryInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default catalogEntityStoreInjectable;
